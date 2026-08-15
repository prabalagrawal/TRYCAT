import { and, eq, gt, isNull, lt, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { botChallenges, contactRequests, consentEvents, dataRightsRequests, InsertContactRequest, InsertConsentEvent, InsertDataRightsRequest, InsertUser, rateLimitWindows, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/** Privacy records must never report success unless durable storage completes. */
async function requirePrivacyDb() {
  const db = await getDb();
  if (!db) {
    throw new Error("Privacy records are temporarily unavailable. Please try again later.");
  }
  return db;
}

export async function insertConsentEvent(record: InsertConsentEvent) {
  const db = await requirePrivacyDb();
  await db.insert(consentEvents).values(record);
}

export async function insertDataRightsRequest(record: InsertDataRightsRequest) {
  const db = await requirePrivacyDb();
  await db.insert(dataRightsRequests).values(record);
}

export async function insertContactRequest(record: InsertContactRequest) {
  const db = await requirePrivacyDb();
  await db.insert(contactRequests).values(record);
}

export async function consumeSharedRateLimit(keyHash: string, windowMs: number) {
  const db = await requirePrivacyDb();
  const windowSeconds = Math.max(1, Math.floor(windowMs / 1000));

  await db.execute(sql`
    INSERT INTO rate_limit_windows (keyHash, windowStartedAt, attemptCount, updatedAt)
    VALUES (${keyHash}, UTC_TIMESTAMP(), 1, UTC_TIMESTAMP())
    ON DUPLICATE KEY UPDATE
      attemptCount = IF(windowStartedAt <= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ${windowSeconds} SECOND), 1, attemptCount + 1),
      windowStartedAt = IF(windowStartedAt <= DATE_SUB(UTC_TIMESTAMP(), INTERVAL ${windowSeconds} SECOND), UTC_TIMESTAMP(), windowStartedAt),
      updatedAt = UTC_TIMESTAMP()
  `);

  const record = await db.select().from(rateLimitWindows).where(eq(rateLimitWindows.keyHash, keyHash)).limit(1);
  if (!record[0]) throw new Error("Rate-limit record unavailable");
  return record[0];
}

export async function createBotChallenge(record: { challengeId: string; nonceHash: string; difficulty: number; expiresAt: Date }) {
  const db = await requirePrivacyDb();
  await db.delete(botChallenges).where(lt(botChallenges.expiresAt, new Date()));
  await db.insert(botChallenges).values(record);
}

export async function getBotChallenge(challengeId: string) {
  const db = await requirePrivacyDb();
  const record = await db.select().from(botChallenges).where(eq(botChallenges.challengeId, challengeId)).limit(1);
  return record[0];
}

export async function consumeBotChallenge(challengeId: string) {
  const db = await requirePrivacyDb();
  const result = await db.update(botChallenges).set({ usedAt: new Date() }).where(and(
    eq(botChallenges.challengeId, challengeId),
    isNull(botChallenges.usedAt),
    gt(botChallenges.expiresAt, new Date()),
  ));
  return result[0].affectedRows === 1;
}
