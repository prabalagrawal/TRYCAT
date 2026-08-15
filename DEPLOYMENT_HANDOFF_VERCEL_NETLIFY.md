# TRYCAT™ Deployment Handoff — Vercel or Netlify

> **Decision status:** The hosting provider has not yet been selected. This document is a deployment handoff, not a claim that either target is configured, secure, or production-ready. The existing managed deployment remains a development/reference environment.

## Current Application Shape

TRYCAT is a React/Vite client plus an Express/tRPC server with a managed relational database. Public contact and data-rights requests depend on server-side rate limiting, durable consent/request storage, and a short-lived server-verified proof-of-work challenge. A static-only export would remove required server controls; the selected host must therefore run the Express/tRPC layer and expose it at the same origin as the frontend.

| Capability | Required in the target deployment | Why it cannot be omitted |
| --- | --- | --- |
| Node/Express runtime | Yes | Public tRPC procedures, security headers, request limits, origin checks, and error sanitisation run on the server. |
| Durable database connectivity | Yes | Consent records, contact requests, data-rights requests, rate limits, and proof challenges require atomic persistence. |
| Managed server-side secrets | Yes | `DATABASE_URL`, `JWT_SECRET`, platform API credentials, and any future OAuth credentials must never enter browser bundles. |
| Same-origin routing | Yes | Browser calls use `/api/trpc`; the deployment must route the frontend and backend consistently. |
| Background cleanup | Not currently implemented | Rate-limit and proof records expire logically; deletion scheduling must be agreed separately after privacy/retention approval. |

## Mandatory Release Gate: Dedicated Database Identity

The current managed application connection was observed to have root-level global permissions and grant authority. **Do not copy that account or connection string to Vercel or Netlify.** Create two separate database identities before a production cutover.

| Identity | Minimum intended role | Must not have |
| --- | --- | --- |
| `trycat_app` | Connection only to the TRYCAT production schema; `SELECT`, `INSERT`, `UPDATE`, and `DELETE` on the application tables needed at runtime. | Global privileges, `GRANT OPTION`, user management, schema drop/create/alter, file access, replication, or routine/event administration. |
| `trycat_migrate` | Time-bound, controlled schema migration authority for approved deployment changes. | Use by the running application, global user management, or routine day-to-day access. |

The database administrator should create provider-specific users through the database service console or privileged administration channel, apply schema-scoped grants, rotate the old root-level application credential, and store only the new application connection value in the selected host’s production secret store. The migration identity should not be placed in the application runtime environment.

## Vercel Handoff

Vercel documents Express support, but an Express app is deployed as a single Vercel Function; Vercel Functions limitations therefore apply. Its Express guidance also notes that `express.static()` does not serve static assets there, so static assets need Vercel’s public/CDN routing or an explicit compatible configuration.[1]

| Area | Required action before a Vercel production deployment | Evidence to retain |
| --- | --- | --- |
| Runtime adapter | A root-level `server.ts` exports the configured Express app without opening a listener. `vercel.json` routes unresolved/API/storage requests through that secured function, while the Vercel filesystem resolves generated static assets first. Validate the bundle in a Vercel Preview deployment before production. | Preview URL, build log, route smoke-test results for `/`, `/contact`, `/rights`, `/api/trpc/*`, and the storage asset path. |
| Static assets | `pnpm run vercel-build` generates the Vite site, copies `dist/public/**` to root `public/**` for Vercel CDN delivery, and retains `dist/public/**` in the function bundle only for SPA fallback pages. Vercel documents that Express static middleware is ignored, and resolves filesystem assets before rewrites. Confirm CDN assets, SPA fallback pages, and function routes all behave as expected. | Route/asset probe and configuration review. |
| Production secrets | Add runtime secrets only in the Vercel project/team environment configuration; use Vercel’s sensitive-variable protection for production and preview where available.[2] | Environment-key inventory (not values), environment scope, access-role list, and rotation owner. |
| Database | Set only the dedicated `trycat_app` connection for production runtime. Test TLS, allowed network access, and a contact/rights form without retaining test personal data. | Schema-grant record, TLS evidence, and redacted connection validation result. |
| Headers and proxy | Re-test HTTP→HTTPS, HSTS, CSP, origin checks, request limit, 413, and 429 responses from the Vercel deployment domain. Confirm forwarded headers cannot be supplied by a public client to alter client-IP/rate-limit identity. | Header/method/body probe output and platform/proxy configuration evidence. |
| Observability | Configure access-controlled Vercel/runtime log access, error alerting, and a documented retention period. | Log destination, retention setting, alert test, and responder owner. |

## Netlify Handoff

Netlify’s Express documentation describes Express running through Netlify Functions. For a frontend-plus-Express application, the documented pattern includes a `serverless-http` function wrapper and a rewrite from `/api/*` to the function; function execution and memory limits still apply.[3] This project should therefore be adapted and preview-tested rather than deployed as a static site.

| Area | Required action before a Netlify production deployment | Evidence to retain |
| --- | --- | --- |
| Runtime adapter | Add and review a Netlify Function adapter around the Express server and the required `/api/*` rewrite. Verify that static SPA fallback does not bypass or shadow tRPC routes. | `netlify.toml` / function-adapter review, Deploy Preview URL, route smoke-test results. |
| Function suitability | Verify function duration/memory behaviour with the proof-of-work issue/verify flow, database calls, and public rate-limit updates. Avoid treating the Express server as a scheduled/background function. | Function logs, duration/memory metrics, and concurrency/rate-limit test results. |
| Production secrets | Enter secrets through Netlify’s controlled environment-variable configuration rather than a committed `.env` file. Netlify notes that values intended after build should be accessed at runtime through functions/edge functions, and only non-sensitive values should be injected into client output.[4] | Environment-key inventory (not values), scope record, access-role list, and rotation owner. |
| Database | Set only the dedicated `trycat_app` connection for production runtime. Test TLS, allowed network access, and a contact/rights form without retaining test personal data. | Schema-grant record, TLS evidence, and redacted connection validation result. |
| Headers and proxy | Re-test HTTP→HTTPS, HSTS, CSP, origin checks, request limit, 413, and 429 responses from the Netlify deployment domain. Confirm redirects/rewrites do not weaken header or API controls. | Header/method/body probe output and redirect/function configuration review. |
| Observability | Configure access-controlled Netlify/function logs, security-event alerting where supported, and a documented retention period. | Log destination, retention setting, alert test, and responder owner. |

## Platform-Neutral Acceptance Test

Before declaring either host production-ready, execute the following against the selected production domain and record dates, environment, operator, and result. Do not enter real customer data while testing.

| Test | Expected result |
| --- | --- |
| HTTP request | Redirects to HTTPS. |
| HTTPS response | Includes CSP, HSTS, content-type protection, frame protection, referrer policy, and permissions policy. |
| Public API method | Unsupported API method returns `405` and the allowed method set. |
| Oversized API body | Returns `413` without logging the request body. |
| Cross-origin state-changing request | Is rejected without persistence. |
| Contact/rights form before proof | Submit remains unavailable until the proof state is ready. |
| Invalid/expired/reused proof | Returns the neutral verification response and persists no request. |
| Rate-limit threshold | Returns `429` with the neutral retry message. |
| Analytics before opt-in | No optional analytics script is present. |
| Secret review | No server secret appears in bundled client assets, rendered HTML, browser storage, or public logs. |
| Database grant review | Runtime connection uses `trycat_app`, not a root/global or migration account. |

## Explicit Non-Claims

Until the selected host supplies environment-specific evidence, TRYCAT must not claim that encryption at rest, encrypted backups, key management, least privilege, trusted proxy handling, central logging, or security alerting has been verified. The application-level controls have been tested; the platform controls remain a separate release record.

## Vercel Rollback and Release Recovery

| Item | Required procedure |
| --- | --- |
| Release owner | Name one accountable deployment owner and one backup owner before promoting a Vercel Preview to Production. Record the target production deployment ID, commit hash, migration version, database identity review, environment-variable scope review, and acceptance-test results. |
| Rollback triggers | Roll back immediately for a confirmed security-control regression; unexpected 4xx/5xx increase; failed contact/rights persistence; broken proof verification, rate limiting, consent gate, or headers; client-secret exposure; database access failure; or material visual/functionality regression. |
| Rollback action | Use Vercel’s deployment rollback/promotion workflow to restore the last known-good production deployment. Do not roll back a database schema by deletion or destructive alteration. If a migration is incompatible, stop promotion and use a separately reviewed forward-fix or restore procedure approved by the database owner. |
| Evidence to retain | Preserve the incident timestamp, affected deployment ID/commit, observed symptoms, rollback operator, restored deployment ID/commit, relevant redacted logs, and a decision record explaining whether secrets or database credentials require rotation. |
| Post-rollback verification | Re-run the production-domain acceptance test: HTTPS redirect, HSTS/CSP/security headers, `/api/trpc` method handling, 413 body limit, origin guard, proof-ready/invalid-proof behavior, rate-limit response, no pre-consent analytics, and no client-secret exposure. Confirm contact/rights records remain available and no data migration was lost. |
| Follow-up | Create a corrective branch from the failed deployment commit, reproduce in Vercel Preview, obtain reviewer approval, and attach the new acceptance-test evidence before another production promotion. |

> **Safety constraint:** Vercel rollback restores application code/configuration; it does not automatically reverse database changes. Database rollback, restore, or credential rotation remains a controlled operation owned by the database/platform administrator.

## References

[1]: https://vercel.com/docs/frameworks/backend/express "Vercel: Express on Vercel"
[2]: https://vercel.com/docs/environment-variables/sensitive-environment-variables "Vercel: Sensitive environment variables"
[3]: https://docs.netlify.com/build/frameworks/framework-setup-guides/express/ "Netlify: Express"
[4]: https://docs.netlify.com/build/configure-builds/environment-variables/ "Netlify: Build environment variables"
