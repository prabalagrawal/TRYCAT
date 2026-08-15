import { int, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Purpose-scoped consent evidence. The pseudonymous subject key excludes IP address collection. */
export const consentEvents = mysqlTable("consent_events", {
  id: int("id").autoincrement().primaryKey(),
  subjectId: varchar("subjectId", { length: 128 }).notNull(),
  purpose: mysqlEnum("purpose", ["analytics", "contact_request", "rights_request", "marketing"]).notNull(),
  choice: mysqlEnum("choice", ["granted", "denied", "withdrawn"]).notNull(),
  noticeVersion: varchar("noticeVersion", { length: 64 }).notNull(),
  source: varchar("source", { length: 64 }).notNull(),
  recordedAt: timestamp("recordedAt").defaultNow().notNull(),
  retentionUntil: timestamp("retentionUntil").notNull(),
});

/** Public privacy / grievance requests. Identity verification is performed operationally before fulfilment. */
export const dataRightsRequests = mysqlTable("data_rights_requests", {
  id: int("id").autoincrement().primaryKey(),
  requestId: varchar("requestId", { length: 40 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  requestType: mysqlEnum("requestType", ["access", "correction", "erasure", "withdrawal", "grievance"]).notNull(),
  details: text("details"),
  status: mysqlEnum("status", ["received", "verifying", "in_progress", "completed", "rejected"]).default("received").notNull(),
  noticeVersion: varchar("noticeVersion", { length: 64 }).notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  retentionUntil: timestamp("retentionUntil").notNull(),
}, (table) => ({ requestIdUnique: uniqueIndex("data_rights_requests_request_id_unique").on(table.requestId) }));

/** Business inquiries made through the privacy-aware contact path. Optional marketing uses a separate opt-in. */
export const contactRequests = mysqlTable("contact_requests", {
  id: int("id").autoincrement().primaryKey(),
  requestId: varchar("requestId", { length: 40 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  organisation: varchar("organisation", { length: 240 }),
  message: text("message").notNull(),
  marketingOptIn: mysqlEnum("marketingOptIn", ["granted", "not_granted"]).default("not_granted").notNull(),
  noticeVersion: varchar("noticeVersion", { length: 64 }).notNull(),
  status: mysqlEnum("status", ["received", "responded", "closed"]).default("received").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  retentionUntil: timestamp("retentionUntil").notNull(),
}, (table) => ({ requestIdUnique: uniqueIndex("contact_requests_request_id_unique").on(table.requestId) }));

/** Shared rate-limit counters keyed by an HMAC, never by a raw IP address or email. */
export const rateLimitWindows = mysqlTable("rate_limit_windows", {
  keyHash: varchar("keyHash", { length: 128 }).primaryKey(),
  windowStartedAt: timestamp("windowStartedAt").defaultNow().notNull(),
  attemptCount: int("attemptCount").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type InsertConsentEvent = typeof consentEvents.$inferInsert;
export type InsertDataRightsRequest = typeof dataRightsRequests.$inferInsert;
export type InsertContactRequest = typeof contactRequests.$inferInsert;
