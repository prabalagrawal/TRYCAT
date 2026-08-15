import { createHash } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  insertConsentEvent: vi.fn(),
  insertContactRequest: vi.fn(),
  insertDataRightsRequest: vi.fn(),
  consumeSharedRateLimit: vi.fn(),
  createBotChallenge: vi.fn(),
  getBotChallenge: vi.fn(),
  consumeBotChallenge: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

const subjectId = "f554210e-3d67-4b6a-b42b-27e57e7dcc61";

type StoredChallenge = {
  challengeId: string;
  nonceHash: string;
  difficulty: number;
  expiresAt: Date;
  usedAt: Date | null;
};

function createCaller() {
  return appRouter.createCaller({
    user: null,
    req: { protocol: "https", ip: "127.0.0.1", headers: {} },
    res: { setHeader: vi.fn() },
  } as never);
}

function solve(challengeId: string, nonce: string, difficulty: number) {
  const target = "0".repeat(difficulty);
  for (let solution = 0; solution < 800_000; solution += 1) {
    if (createHash("sha256").update(`${challengeId}:${nonce}:${solution}`).digest("hex").startsWith(target)) return String(solution);
  }
  throw new Error("test proof was not found");
}

describe("public contact proof-of-work integration", () => {
  let stored: StoredChallenge | null = null;

  beforeEach(() => {
    vi.clearAllMocks();
    stored = null;
    dbMocks.consumeSharedRateLimit.mockResolvedValue({ attemptCount: 1, windowStartedAt: new Date() });
    dbMocks.createBotChallenge.mockImplementation(async (record: StoredChallenge) => { stored = { ...record, usedAt: null }; });
    dbMocks.getBotChallenge.mockImplementation(async () => stored);
    dbMocks.consumeBotChallenge.mockResolvedValue(true);
  });

  async function issueProof() {
    const issued = await createCaller().botChallenge.issue({ subjectId });
    return { challengeId: issued.challengeId, nonce: issued.nonce, solution: solve(issued.challengeId, issued.nonce, issued.difficulty) };
  }

  it("persists a contact request after a real issued proof is verified", async () => {
    const botProof = await issueProof();
    const result = await createCaller().contact.submit({
      subjectId,
      name: "Asha Mehta",
      email: "asha@example.com",
      message: "We need help mapping a complex transformation programme.",
      contactProcessingConsent: true,
      marketingOptIn: false,
      botProof,
    });
    expect(result.requestId).toMatch(/^TR-C-/);
    expect(dbMocks.consumeBotChallenge).toHaveBeenCalledWith(botProof.challengeId);
    expect(dbMocks.insertContactRequest).toHaveBeenCalledTimes(1);
  });

  it("rejects an invalid proof and does not persist a contact request", async () => {
    const botProof = await issueProof();
    await expect(createCaller().contact.submit({
      subjectId,
      name: "Asha Mehta",
      email: "asha@example.com",
      message: "We need help mapping a complex transformation programme.",
      contactProcessingConsent: true,
      marketingOptIn: false,
      botProof: { ...botProof, solution: "0" },
    })).rejects.toThrow("We could not verify this request. Please refresh the form and try again.");
    expect(dbMocks.insertContactRequest).not.toHaveBeenCalled();
  });
});
