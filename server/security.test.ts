import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  consumeSharedRateLimit: vi.fn(),
  createBotChallenge: vi.fn(),
  getBotChallenge: vi.fn(),
  consumeBotChallenge: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { BOT_CHALLENGE_MESSAGE, issueBotChallenge, verifyBotProof } from "./security";

type StoredChallenge = {
  challengeId: string;
  nonceHash: string;
  difficulty: number;
  expiresAt: Date;
  usedAt: Date | null;
};

function createContext() {
  return {
    req: { protocol: "https", ip: "127.0.0.1", headers: {} },
    res: { setHeader: vi.fn() },
    user: null,
  } as never;
}

function solve(challengeId: string, nonce: string, difficulty: number) {
  const prefix = "0".repeat(difficulty);
  for (let solution = 0; solution < 800_000; solution += 1) {
    if (createHash("sha256").update(`${challengeId}:${nonce}:${solution}`).digest("hex").startsWith(prefix)) return String(solution);
  }
  throw new Error("test proof was not found");
}

describe("internal proof-of-work verifier", () => {
  let stored: StoredChallenge | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    stored = null;
    dbMocks.consumeSharedRateLimit.mockResolvedValue({ attemptCount: 1, windowStartedAt: new Date() });
    dbMocks.createBotChallenge.mockImplementation(async (record: StoredChallenge) => { stored = { ...record, usedAt: null }; });
    dbMocks.getBotChallenge.mockImplementation(async () => stored);
    dbMocks.consumeBotChallenge.mockResolvedValue(true);
  });

  async function issueAndSolve() {
    const issued = await issueBotChallenge(createContext(), "f554210e-3d67-4b6a-b42b-27e57e7dcc61");
    return { ...issued, solution: solve(issued.challengeId, issued.nonce, issued.difficulty) };
  }

  it("accepts a valid, fresh, single-use proof", async () => {
    const proof = await issueAndSolve();
    await expect(verifyBotProof(proof)).resolves.toBeUndefined();
    expect(dbMocks.consumeBotChallenge).toHaveBeenCalledWith(proof.challengeId);
  });

  it("rejects an invalid proof before challenge consumption", async () => {
    const proof = await issueAndSolve();
    await expect(verifyBotProof({ ...proof, solution: "0" })).rejects.toThrow(BOT_CHALLENGE_MESSAGE);
    expect(dbMocks.consumeBotChallenge).not.toHaveBeenCalled();
  });

  it("rejects an expired proof before challenge consumption", async () => {
    const proof = await issueAndSolve();
    if (stored) stored.expiresAt = new Date(Date.now() - 1_000);
    await expect(verifyBotProof(proof)).rejects.toThrow(BOT_CHALLENGE_MESSAGE);
    expect(dbMocks.consumeBotChallenge).not.toHaveBeenCalled();
  });

  it("rejects a proof for a challenge already consumed", async () => {
    const proof = await issueAndSolve();
    if (stored) stored.usedAt = new Date();
    await expect(verifyBotProof(proof)).rejects.toThrow(BOT_CHALLENGE_MESSAGE);
    expect(dbMocks.consumeBotChallenge).not.toHaveBeenCalled();
  });
});
