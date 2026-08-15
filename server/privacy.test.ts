import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  insertConsentEvent: vi.fn(),
  insertContactRequest: vi.fn(),
  insertDataRightsRequest: vi.fn(),
  consumeSharedRateLimit: vi.fn(),
}));

const securityMocks = vi.hoisted(() => ({
  verifyBotProof: vi.fn(),
}));

vi.mock("./db", () => dbMocks);
vi.mock("./security", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./security")>();
  return { ...actual, verifyBotProof: securityMocks.verifyBotProof };
});

import { appRouter } from "./routers";

const subjectId = "f554210e-3d67-4b6a-b42b-27e57e7dcc61";
const botProof = { challengeId: "challenge-id-0001", nonce: "nonce-value-that-is-long-enough", solution: "42" };

function createCaller() {
  return appRouter.createCaller({
    user: null,
    req: { protocol: "https", headers: {} },
    res: { setHeader: vi.fn() },
  } as never);
}

describe("privacy controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    dbMocks.consumeSharedRateLimit.mockReset();
    securityMocks.verifyBotProof.mockReset();
    dbMocks.consumeSharedRateLimit.mockResolvedValue({
      attemptCount: 1,
      windowStartedAt: new Date(),
    });
    securityMocks.verifyBotProof.mockResolvedValue(undefined);
  });

  it("records an explicit analytics decision with a notice version", async () => {
    const result = await createCaller().privacy.recordConsent({
      subjectId,
      purpose: "analytics",
      choice: "denied",
      noticeVersion: "2026-08-15-draft",
      source: "consent_banner",
    });

    expect(result).toEqual({ success: true });
    expect(dbMocks.insertConsentEvent).toHaveBeenCalledWith(expect.objectContaining({
      subjectId,
      purpose: "analytics",
      choice: "denied",
      noticeVersion: "2026-08-15-draft",
    }));
  });

  it("records a rights request and its request-handling consent separately", async () => {
    const result = await createCaller().rights.submit({
      subjectId,
      name: "Asha Mehta",
      email: "asha@example.com",
      requestType: "erasure",
      details: "Please erase my contact enquiry.",
      requestHandlingConsent: true,
      botProof,
    });

    expect(result.requestId).toMatch(/^TR-R-/);
    expect(dbMocks.insertDataRightsRequest).toHaveBeenCalledWith(expect.objectContaining({
      name: "Asha Mehta",
      email: "asha@example.com",
      requestType: "erasure",
      noticeVersion: "2026-08-15-draft",
    }));
    expect(dbMocks.insertConsentEvent).toHaveBeenCalledWith(expect.objectContaining({
      purpose: "rights_request",
      choice: "granted",
      source: "rights_form",
    }));
  });

  it("records mandatory contact processing and optional marketing as different purposes", async () => {
    const result = await createCaller().contact.submit({
      subjectId,
      name: "Arjun Rao",
      email: "arjun@example.com",
      organisation: "Example Co",
      message: "We need help mapping a complex transformation programme.",
      contactProcessingConsent: true,
      marketingOptIn: false,
      botProof,
    });

    expect(result.requestId).toMatch(/^TR-C-/);
    expect(dbMocks.insertContactRequest).toHaveBeenCalledWith(expect.objectContaining({ marketingOptIn: "not_granted" }));
    expect(dbMocks.insertConsentEvent).toHaveBeenCalledWith(expect.objectContaining({ purpose: "contact_request", choice: "granted" }));
    expect(dbMocks.insertConsentEvent).toHaveBeenCalledWith(expect.objectContaining({ purpose: "marketing", choice: "denied" }));
  });

  it("does not report a successful consent choice when durable persistence fails", async () => {
    dbMocks.insertConsentEvent.mockRejectedValueOnce(new Error("database unavailable"));

    await expect(createCaller().privacy.recordConsent({
      subjectId,
      purpose: "analytics",
      choice: "granted",
      noticeVersion: "2026-08-15-draft",
      source: "consent_banner",
    })).rejects.toThrow("database unavailable");
  });

  it("rejects repeated sensitive submissions with a neutral rate-limit response", async () => {
    dbMocks.consumeSharedRateLimit.mockResolvedValueOnce({
      attemptCount: 6,
      windowStartedAt: new Date(),
    });

    await expect(createCaller().contact.submit({
      subjectId,
      name: "Arjun Rao",
      email: "arjun@example.com",
      message: "We need help mapping a complex transformation programme.",
      contactProcessingConsent: true,
      marketingOptIn: false,
      botProof,
    })).rejects.toThrow("Too many attempts. Please wait a few minutes and try again.");
    expect(dbMocks.insertContactRequest).not.toHaveBeenCalled();
  });

  it("rejects unexpected fields and oversized contact messages before persistence", async () => {
    await expect(createCaller().contact.submit({
      subjectId,
      name: "Arjun Rao",
      email: "arjun@example.com",
      message: "x".repeat(3001),
      contactProcessingConsent: true,
      marketingOptIn: false,
      unexpected: "not allowed",
    } as never)).rejects.toThrow();
    expect(dbMocks.insertContactRequest).not.toHaveBeenCalled();
  });

  it("requires a proof response before a public contact record is created", async () => {
    await expect(createCaller().contact.submit({
      subjectId,
      name: "Arjun Rao",
      email: "arjun@example.com",
      message: "We need help mapping a complex transformation programme.",
      contactProcessingConsent: true,
      marketingOptIn: false,
    } as never)).rejects.toThrow();
    expect(securityMocks.verifyBotProof).not.toHaveBeenCalled();
    expect(dbMocks.insertContactRequest).not.toHaveBeenCalled();
  });

  it("verifies the proof response before persisting a public contact record", async () => {
    await createCaller().contact.submit({
      subjectId,
      name: "Arjun Rao",
      email: "arjun@example.com",
      message: "We need help mapping a complex transformation programme.",
      contactProcessingConsent: true,
      marketingOptIn: false,
      botProof,
    });
    expect(securityMocks.verifyBotProof).toHaveBeenCalledWith(botProof);
    expect(dbMocks.insertContactRequest).toHaveBeenCalled();
  });
});
