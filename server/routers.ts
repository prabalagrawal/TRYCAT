import { COOKIE_NAME } from "@shared/const";
import { nanoid } from "nanoid";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { insertContactRequest, insertConsentEvent, insertDataRightsRequest } from "./db";

const noticeVersion = "2026-08-15-draft";
const browserSubjectId = z.string().uuid();
const consentPurpose = z.enum(["analytics", "contact_request", "rights_request", "marketing"]);
const consentChoice = z.enum(["granted", "denied", "withdrawn"]);

function addMonths(months: number) {
  const retentionUntil = new Date();
  retentionUntil.setUTCMonth(retentionUntil.getUTCMonth() + months);
  return retentionUntil;
}

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  privacy: router({
    recordConsent: publicProcedure
      .input(z.object({
        subjectId: browserSubjectId,
        purpose: consentPurpose,
        choice: consentChoice,
        noticeVersion: z.string().min(1).max(64),
        source: z.enum(["consent_banner", "contact_form", "rights_form", "preference_center"]),
      }))
      .mutation(async ({ input }) => {
        await insertConsentEvent({ ...input, retentionUntil: addMonths(24) });
        return { success: true } as const;
      }),
  }),

  rights: router({
    submit: publicProcedure
      .input(z.object({
        subjectId: browserSubjectId,
        name: z.string().trim().min(2).max(160),
        email: z.string().trim().email().max(320),
        requestType: z.enum(["access", "correction", "erasure", "withdrawal", "grievance"]),
        details: z.string().trim().max(2500).optional(),
        requestHandlingConsent: z.literal(true),
      }))
      .mutation(async ({ input }) => {
        const requestId = `TR-R-${nanoid(12)}`;
        await insertDataRightsRequest({ requestId, name: input.name, email: input.email, requestType: input.requestType, details: input.details || null, noticeVersion, retentionUntil: addMonths(36) });
        await insertConsentEvent({ subjectId: input.subjectId, purpose: "rights_request", choice: "granted", noticeVersion, source: "rights_form", retentionUntil: addMonths(24) });
        return { success: true, requestId } as const;
      }),
  }),

  contact: router({
    submit: publicProcedure
      .input(z.object({
        subjectId: browserSubjectId,
        name: z.string().trim().min(2).max(160),
        email: z.string().trim().email().max(320),
        organisation: z.string().trim().max(240).optional(),
        message: z.string().trim().min(10).max(2500),
        contactProcessingConsent: z.literal(true),
        marketingOptIn: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const requestId = `TR-C-${nanoid(12)}`;
        await insertContactRequest({ requestId, name: input.name, email: input.email, organisation: input.organisation || null, message: input.message, marketingOptIn: input.marketingOptIn ? "granted" : "not_granted", noticeVersion, retentionUntil: addMonths(12) });
        await insertConsentEvent({ subjectId: input.subjectId, purpose: "contact_request", choice: "granted", noticeVersion, source: "contact_form", retentionUntil: addMonths(24) });
        await insertConsentEvent({ subjectId: input.subjectId, purpose: "marketing", choice: input.marketingOptIn ? "granted" : "denied", noticeVersion, source: "contact_form", retentionUntil: addMonths(24) });
        return { success: true, requestId } as const;
      }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
