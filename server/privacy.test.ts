import { beforeEach, describe, expect, it, vi } from "vitest";

const dbMocks = vi.hoisted(() => ({
  insertConsentEvent: vi.fn(),
  insertContactRequest: vi.fn(),
  insertDataRightsRequest: vi.fn(),
}));

vi.mock("./db", () => dbMocks);

import { appRouter } from "./routers";

const subjectId = "f554210e-3d67-4b6a-b42b-27e57e7dcc61";

function createCaller() {
  return appRouter.createCaller({
    user: null,
    req: { protocol: "https", headers: {} },
    res: {},
  } as never);
}

describe("privacy controls", () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
