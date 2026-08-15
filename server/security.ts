import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { TRPCError } from "@trpc/server";
import { consumeBotChallenge, consumeSharedRateLimit, createBotChallenge, getBotChallenge } from "./db";
import { ENV } from "./_core/env";
import type { TrpcContext } from "./_core/context";

const WINDOW_MS = 15 * 60 * 1000;
const SENSITIVE_ATTEMPT_LIMIT = 5;
const BOT_CHALLENGE_TTL_MS = 5 * 60 * 1000;
const BOT_CHALLENGE_DIFFICULTY = 3;
export const RATE_LIMIT_MESSAGE = "Too many attempts. Please wait a few minutes and try again.";
export const BOT_CHALLENGE_MESSAGE = "We could not verify this request. Please refresh the form and try again.";

export type BotProof = { challengeId: string; nonce: string; solution: string };

type RateLimitResult = { allowed: boolean; remaining: number; retryAfterSeconds: number };

function logSecurityEvent(event: string, fields: Record<string, string | number | boolean> = {}) {
  console.warn(JSON.stringify({ event, ...fields, timestamp: new Date().toISOString() }));
}

function limiterSecret() {
  if (ENV.cookieSecret) return ENV.cookieSecret;
  if (ENV.isProduction) throw new Error("Rate-limit secret is unavailable");
  return "development-only-rate-limit-secret";
}

function hashRateLimitKey(scope: string, identifier: string) {
  return createHmac("sha256", limiterSecret()).update(`${scope}:${identifier}`).digest("hex");
}

function hashChallengeNonce(nonce: string) {
  return createHmac("sha256", limiterSecret()).update(`bot-challenge:${nonce}`).digest("hex");
}

function matchesNonce(expectedHash: string, nonce: string) {
  const actualHash = hashChallengeNonce(nonce);
  return timingSafeEqual(Buffer.from(expectedHash, "hex"), Buffer.from(actualHash, "hex"));
}

export function validProof(challengeId: string, nonce: string, solution: string, difficulty = BOT_CHALLENGE_DIFFICULTY) {
  if (!/^[a-zA-Z0-9_-]{12,64}$/.test(challengeId) || !/^[a-zA-Z0-9_-]{16,96}$/.test(nonce) || !/^\d{1,9}$/.test(solution)) return false;
  return createHash("sha256").update(`${challengeId}:${nonce}:${solution}`).digest("hex").startsWith("0".repeat(difficulty));
}

export async function issueBotChallenge(ctx: TrpcContext, subjectId: string) {
  await enforceSensitiveRateLimit(ctx, "botChallenge.issue", subjectId);
  const challengeId = randomBytes(18).toString("base64url");
  const nonce = randomBytes(24).toString("base64url");
  const expiresAt = new Date(Date.now() + BOT_CHALLENGE_TTL_MS);
  await createBotChallenge({ challengeId, nonceHash: hashChallengeNonce(nonce), difficulty: BOT_CHALLENGE_DIFFICULTY, expiresAt });
  return { challengeId, nonce, difficulty: BOT_CHALLENGE_DIFFICULTY, expiresAt };
}

export async function verifyBotProof(proof: BotProof) {
  try {
    const challenge = await getBotChallenge(proof.challengeId);
    if (!challenge || challenge.usedAt || challenge.expiresAt.getTime() <= Date.now()) throw new Error("expired challenge");
    if (!matchesNonce(challenge.nonceHash, proof.nonce)) throw new Error("invalid nonce");
    if (!validProof(proof.challengeId, proof.nonce, proof.solution, challenge.difficulty)) throw new Error("invalid proof");
    const consumed = await consumeBotChallenge(proof.challengeId);
    if (!consumed) throw new Error("reused challenge");
  } catch (error) {
    logSecurityEvent("bot_challenge_failed", { kind: "public_form" });
    throw new TRPCError({ code: "BAD_REQUEST", message: BOT_CHALLENGE_MESSAGE });
  }
}

function clientIp(req: Request) {
  return req.ip || req.socket?.remoteAddress || "unknown";
}

async function attempt(scope: string, identifier: string, maxAttempts: number): Promise<RateLimitResult> {
  const record = await consumeSharedRateLimit(hashRateLimitKey(scope, identifier), WINDOW_MS);
  const elapsed = Date.now() - record.windowStartedAt.getTime();
  const retryAfterSeconds = Math.max(1, Math.ceil((WINDOW_MS - elapsed) / 1000));
  return {
    allowed: record.attemptCount <= maxAttempts,
    remaining: Math.max(0, maxAttempts - record.attemptCount),
    retryAfterSeconds,
  };
}

function setRateLimitHeaders(res: Response, maxAttempts: number, result: RateLimitResult) {
  res.setHeader("RateLimit-Limit", String(maxAttempts));
  res.setHeader("RateLimit-Remaining", String(result.remaining));
  res.setHeader("RateLimit-Reset", String(result.retryAfterSeconds));
  if (!result.allowed) res.setHeader("Retry-After", String(result.retryAfterSeconds));
}

export function createPublicRateLimitMiddleware(scope: string, maxAttempts: number) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (req.method === "OPTIONS") return next();
    try {
      const result = await attempt(scope, clientIp(req), maxAttempts);
      setRateLimitHeaders(res, maxAttempts, result);
      if (!result.allowed) {
        logSecurityEvent("rate_limit_exceeded", { scope, kind: "public_api" });
        return res.status(429).json({ error: RATE_LIMIT_MESSAGE });
      }
      return next();
    } catch {
      logSecurityEvent("rate_limit_store_unavailable", { scope });
      return res.status(503).json({ error: "Something went wrong. Please try again." });
    }
  };
}

export async function enforceSensitiveRateLimit(ctx: TrpcContext, scope: string, identifier?: string) {
  try {
    const ipResult = await attempt(`${scope}:ip`, clientIp(ctx.req), SENSITIVE_ATTEMPT_LIMIT);
    const identifierResult = identifier ? await attempt(`${scope}:identifier`, identifier.toLowerCase(), SENSITIVE_ATTEMPT_LIMIT) : ipResult;
    const result = !ipResult.allowed ? ipResult : identifierResult;
    setRateLimitHeaders(ctx.res, SENSITIVE_ATTEMPT_LIMIT, result);
    if (!ipResult.allowed || !identifierResult.allowed) {
      logSecurityEvent("rate_limit_exceeded", { scope, kind: "sensitive_mutation" });
      throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: RATE_LIMIT_MESSAGE });
    }
  } catch (error) {
    if (error instanceof TRPCError) throw error;
    logSecurityEvent("rate_limit_store_unavailable", { scope });
    throw new TRPCError({ code: "SERVICE_UNAVAILABLE", message: "Something went wrong. Please try again." });
  }
}
