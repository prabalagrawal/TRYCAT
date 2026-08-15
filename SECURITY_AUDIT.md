# SECURITY AUDIT — TRYCAT™

> **Security assessment, not a security guarantee.** This report records the code, configuration, runtime, and dependency evidence reviewed on the date below. It does not establish that any hosted platform, DNS/CDN, database service, email provider, or future third-party integration is secure unless separately verified.

| Field | Value |
| --- | --- |
| Audit date | 15 August 2026 |
| Application version reviewed | `0241020b` baseline plus uncheckpointed security hardening on `compliance/dpdp` |
| Application | TRYCAT public marketing, privacy, contact, and data-rights site |
| Deployment scope tested | Local production-mode server with simulated trusted TLS termination; live development route review |
| Source-control scope | Working tree, tracked content, practical commit-history pattern checks, and tracked filename review |
| Excluded / not implemented | Booking confirmation, Google Calendar, Google Meet, Google OAuth for visitors, outbound email delivery, password reset, OTP, payment, file upload, admin dashboard |

## Scope and Method

The audit covered the public React routes, Express server bootstrap, tRPC procedures, authentication/session scaffolding, database helpers and schema, static/proxy routes, browser storage use, source-control configuration, dependency metadata, built output patterns, and local production response behaviour. The audit also tested request-size handling, HTTP method controls, production security headers, HTTPS enforcement logic, validation and rate-limit behaviour through automated tests, and non-consenting analytics behaviour through browser inspection.

The current TRYCAT application is **not a Google Calendar, Google Meet, outbound email, or booking system**. “Book a call” is a contact request stored in the application database; it neither creates calendar events nor sends email. Therefore, calendar race conditions, Meet-link generation, booking idempotency, and email header injection are **not applicable to the implemented application**. They are mandatory design requirements before any such integration is introduced.

## Implemented Security Controls

| Control | Evidence / implementation | Status |
| --- | --- | --- |
| Sensitive public rate limits | Contact, privacy-consent, and rights procedures enforce **5 attempts per 15 minutes** against both a privacy-preserving HMAC of Express-derived client IP and a supplied identifier where applicable. Rejections use HTTP 429 via tRPC and the required neutral message. | Implemented |
| Shared rate-limit store | `rate_limit_windows` is a database-backed counter, so limits are shared across application instances rather than held in memory. Raw IP and email values are not stored in the limiter. | Implemented |
| Broad API protection | `/api` has a shared public rate-limit middleware; asset proxy traffic has a separate practical limit. | Implemented |
| Server validation | Public tRPC inputs use strict Zod object schemas with bounded names, emails, organisations, request text, allowed enums, UUIDs, and required consent booleans. | Implemented |
| Request-size limits | Server JSON and URL-encoded bodies are capped at 64 KB. Oversize payloads receive HTTP 413. | Implemented |
| Method controls | `/api/trpc` accepts only GET, POST, and OPTIONS. Unsupported methods receive HTTP 405 and `Allow`. | Implemented |
| Same-origin write protection | State-changing requests carrying an `Origin` header are checked against the request origin. This supplements cookie safeguards for public mutations. | Implemented; deployment origin verification required |
| Security headers | Production responses set CSP, HSTS on trusted HTTPS requests, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and `Cross-Origin-Opener-Policy`. `frame-ancestors 'none'` prevents framing. | Implemented; production-edge verification required |
| HTTPS gate | Production application traffic is rejected when the request is not recognised as HTTPS. | Implemented; trusted-proxy configuration must be verified |
| CORS | No permissive CORS middleware or wildcard origin is configured. The application is same-origin by design. | Implemented / reviewed |
| Error handling | tRPC formats unexpected server failures with a generic user message; request parser errors are generic or HTTP 413. Sensitive server details remain server-side. | Implemented |
| Secret handling | No high-confidence secret signature was found in tracked source, documentation, tests, or built output. Git history metadata/pattern checks found no evidence of committed credential values in the practical checked history. A filename-only inventory found no `.env*` files in the project directory. Managed project controls prevent direct environment-file inspection, so secret values were not read or exposed during this audit. | Reviewed — not a substitute for enterprise secret scanning |
| Source-control exclusions | `.gitignore` excludes local environment variants, credential directories, key/certificate material, service-account patterns, logs, local databases, builds, and tool artifacts. | Implemented |
| Browser identity persistence | Application-level persistence of `manus-runtime-user-info` in local storage was removed. | Implemented |
| Client error logging | Raw client API errors are only logged in development builds. | Implemented |
| SQL injection | Application writes use Drizzle parameterised APIs / SQL parameter bindings; no user input is interpolated into dynamic SQL. | Reviewed |
| XSS / output injection | Contact and rights request content is not rendered as HTML. React’s normal escaping is used. No user-controlled `dangerouslySetInnerHTML` path is part of the active TRYCAT flows. | Reviewed |
| SSRF | No TRYCAT public procedure fetches a visitor-supplied URL. | Not applicable to current features |
| File uploads | No public file-upload route exists. | Not applicable to current features |

## Findings

### CRITICAL

No critical unresolved application-level vulnerability was identified within the tested scope.

### HIGH

| Finding | Description | Affected component | Potential impact | Evidence | Recommended remediation | Status |
| --- | --- | --- | --- | --- | --- | --- |
| CAPTCHA / bot verification absent | Contact and rights forms have server rate limits and validation but no verified CAPTCHA or challenge service. | Public contact and rights forms | Targeted spam or distributed abuse may still consume rate-limit capacity or operational review time. | Source and route review. | Add verified server-side bot protection (for example, a privacy-reviewed provider), retain rate limits, and test failure-closed verification. | Open |
| Production security depends on trusted proxy configuration | HTTPS enforcement and HSTS are applied after the app detects HTTPS through Express/trusted proxy headers. | Deployment edge / Express | Incorrect proxy configuration could cause false rejects, missing HSTS, or incorrect client IP attribution. | Local production test with `X-Forwarded-Proto: https`; no production-edge configuration evidence available. | Verify the production load balancer strips untrusted forwarded headers, sets protocol correctly, forces HTTPS, and preserves expected host/origin. | Open |

### MEDIUM

| Finding | Description | Affected component | Potential impact | Evidence | Recommended remediation | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Framework preview session fallback uses browser session storage | The platform runtime can mirror a session token into `sessionStorage` to support environments that block iframe cookies. The code forwards it as a Bearer token. | Client runtime / authentication scaffold | An XSS issue could expose the fallback token in affected environments. | `client/src/main.tsx`. | Confirm whether preview-only fallback is present in production. Prefer secure HttpOnly cookies for production sessions and remove the fallback if platform configuration permits. | Open / platform review |
| Session lifetime is one year | The OAuth scaffold issues sessions for one year. | OAuth scaffold | Long-lived sessions increase risk if a token is compromised. | `server/_core/oauth.ts`. | Set a shorter production session lifetime, add rotation/re-authentication, and document revocation behaviour before enabling visitor accounts or admin access. | Open |
| Rate-limit table retention | Rate-limit counters expire logically but are not yet physically purged. | `rate_limit_windows` | Unbounded table growth over time. | Schema and counter implementation review. | Add an approved scheduled cleanup job or database TTL mechanism; review privacy retention. | Open |
| Public rate limits use database availability | The rate-limit store fails closed for protected public routes when the database is unavailable. | Public API availability | Reduced availability during database incidents, intentionally trading availability for abuse resistance. | `server/security.ts`. | Monitor database health and capacity; decide whether a managed Redis store is preferred at scale. | Accepted design trade-off |
| Header CSP requires regression testing for future integrations | The CSP is tailored to current self-hosted app resources, Google Fonts, generic HTTPS image delivery, and optional analytics. | Production headers | Future maps, CAPTCHA, calendar, payment, or chat scripts may fail closed until explicitly added. | `server/_core/index.ts`. | Update and test CSP as each approved third party is introduced; never broadly allow unknown origins. | Accepted design constraint |

### LOW

| Finding | Description | Affected component | Potential impact | Evidence | Recommended remediation | Status |
| --- | --- | --- | --- | --- | --- | --- |
| Environment template cannot be materialised in this managed project | The security requirement requests `.env.example`; project safety controls require secrets/environment updates through managed configuration rather than a directly edited environment file. | Project configuration | Operators need a separate, reviewed variable inventory. | Managed project restriction. | Maintain an approved variable inventory in deployment documentation and use the managed secret configuration flow. Do not place values in source control. | Open / operational |
| Dev debug collector exists | Vite debug collection is development-only but records browser console/network/session events into local logs. | Development tooling | Developers could collect unnecessary local debug material. | `vite.config.ts`. | Keep debug tooling disabled in production, exclude logs from source control, and avoid entering sensitive data in development forms. | Reviewed |
| Security logging maturity | Structured security-event logging exists for rate-limit, cross-origin, and rejected-request events, but there is no central production SIEM/alerting configuration in source. | Operational logging | Slow incident detection or incomplete retention. | `server/security.ts`; deployment configuration unavailable. | Route structured logs to an approved central service with retention, access control, and alerting policies. | Open / operational |

### INFORMATIONAL

| Finding | Description | Status |
| --- | --- | --- |
| Google OAuth, Calendar, Meet, email, and booking controls | The current public site does not implement these integrations. No Google client secrets, refresh tokens, Calendar IDs, or email credentials are present in the reviewed tracked source. | Non-applicable until feature introduction |
| SSRF and file-upload controls | No public URL-fetch or upload functionality exists in the current TRYCAT flows. | Non-applicable until feature introduction |
| Admin authorisation | Framework admin middleware exists, but no TRYCAT admin route is exposed. | Non-applicable to current routes |
| Database security | Application uses managed database configuration; connection encryption, least privilege, backup encryption, and public-network exposure cannot be verified from source. | Deployment verification required |

## Security Testing Evidence

| Test | Result |
| --- | --- |
| Type-check | Passed |
| Automated tests | Passed: 6 tests across authentication, privacy record persistence, purpose separation, fail-closed storage, and sensitive rate-limit rejection. |
| Production build | Passed |
| Production header probe, simulated trusted TLS | Confirmed CSP, HSTS, `X-Content-Type-Options`, frame denial, referrer policy, permissions policy, and COOP headers. |
| HTTP method probe | Confirmed PUT to tRPC route returns HTTP 405 with `Allow`. |
| Oversize body probe | Confirmed >64 KB JSON request returns HTTP 413. |
| Dependency audit | Completed; 72 findings recorded above. |
| Secret scan | Completed against tracked current content, built output signature patterns, credential-like filenames, and practical history patterns; no high-confidence signature found. |
| Browser testing | Previously confirmed optional analytics is absent before affirmative consent and privacy/contact/rights routes render on desktop and mobile. |

## REMAINING RISKS

| Issue | Severity | Why it remains | Recommended next action |
| --- | --- | --- | --- |
| CAPTCHA absent | High | No bot-verification provider or key has been selected/configured. | Select a privacy-reviewed provider, configure credentials through managed secrets, and fail closed on verification errors. |
| Production-edge HTTPS/proxy proof | High | Local test simulated a trusted TLS proxy; live edge configuration was not available for inspection. | Perform a deployed header scan and confirm load-balancer trust/redirect settings before release. |
| Platform session fallback | Medium | Runtime uses session storage fallback for constrained browser contexts. | Confirm production behaviour with platform owner; eliminate browser token fallback if possible. |
| Encryption and database infrastructure evidence | Medium | App source cannot prove data-at-rest, backup, key-management, or network controls. | Obtain formal infrastructure evidence and verify least-privilege database configuration. |
| Rate-limit data cleanup | Medium | No approved periodic cleanup process is defined. | Add a scheduled cleanup only after retention/legal approval, using the platform-supported scheduler. |

> **Dependency remediation update, 15 August 2026:** Unused template-only packages and tooling were removed. Axios, NanoID, PostCSS, Tailwind/Vite tooling, Vitest, esbuild, Drizzle ORM, Express, and type definitions were compatibility-tested and updated. The Express 5 wildcard routes were migrated to named/pathless equivalents. The final `pnpm audit --audit-level=low --prod` returned **“No known vulnerabilities found.”** This does not remove the need for future dependency scanning.

> **Conclusion:** No known unresolved critical application-level vulnerability was identified within the tested scope. The application must **not** be described as “100% secure.” Verified CAPTCHA and production-edge/infrastructure evidence remain release-gating work.

## Verification Update — 15 August 2026

This update supersedes the earlier **CAPTCHA absent** and **live edge unavailable** observations above. The original findings are retained as audit history.

| Verification | Evidence | Current status |
| --- | --- | --- |
| Public-form bot protection | Contact and data-rights forms now require a short-lived, single-use, server-stored proof-of-work response. The browser computes the response locally; the server validates nonce integrity, difficulty, expiry, and one-time use before it creates a request record. Rate limiting remains in place. The form reached “Form protection confirmed” in the live browser without a user-data submission. | Implemented and browser-verified |
| Proof-required persistence | The public form procedures reject missing proof payloads through strict schema validation, and the regression suite asserts proof verification runs before contact persistence. | Implemented and tested |
| Third-party privacy impact | The proof challenge is self-hosted. It does not load an external CAPTCHA, tracker, or third-party script. | Verified in source and browser route review |
| Deployed transport and headers | `https://trycatweb-nla462dd.manus.space` returned HSTS (`max-age=31536000; includeSubDomains; preload`), CSP, `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, strict referrer policy, and permissions policy. The `http://` equivalent returned `301` to HTTPS. | Deployed edge verified |
| Database transport | The managed database connection reported cipher `TLS_AES_128_GCM_SHA256` and `require_secure_transport=ON`. | Transport encryption verified |
| Tests and dependency posture | Type-check, production build, and 9 automated tests passed. The final production dependency audit reported no known vulnerabilities. | Verified |

The remaining release evidence is **operational**, not application-code work: database encryption at rest, encrypted backups, key-management process, database least privilege, central log retention/alerting, and the hosting platform’s handling of untrusted forwarded headers. These require an owner or platform attestation and cannot be inferred from the application source or an external header probe.

Managed production-log retrieval was also attempted on 15 August 2026 and returned a platform-level `cloudrun service not found` response. This does not demonstrate an application error, but it means central log delivery, retention, and alerting cannot be evidenced through this project session. The deployment owner should confirm the published service identifier and provide the logging/retention configuration before an enterprise security assertion is made.

### Proof-of-Work Test Detail

The proof-of-work verifier is now covered without mocking the verifier itself. Four focused tests exercise a valid fresh proof plus invalid, expired, and already-consumed proof rejection. A separate public-router integration test issues a real challenge, computes a valid proof, persists a contact request only after verification, then proves that a tampered proof returns the neutral verification error and creates **no** contact record. The full suite now passes **15 tests across 4 test files**.

> **Updated conclusion:** The site’s application-layer public-form protection, deployed web transport, and database connection transport have been verified. The application still must not be described as “100% secure”; the residual operational evidence items remain necessary for an enterprise security claim.

## PLATFORM / DEPLOYMENT VERIFICATION REQUIRED

> **Status rule:** None of the entries in this section are verified by this codebase. They remain open until the production deployment owner supplies current, environment-specific evidence. This section is intentionally platform-neutral so it can be used with Manus built-in hosting, Vercel, Netlify, or another approved provider.

| Unresolved item | Security importance | Evidence required before verification | Responsible owner / platform |
| --- | --- | --- | --- |
| Encryption at rest for production database and storage | Limits the impact of unauthorised infrastructure or media access. | Provider control statement or console evidence showing encryption at rest for the production database, object/file storage, and snapshots; identify the cipher/key service where disclosed. | Hosting/database/storage platform and deployment owner. |
| Encrypted, access-controlled backups and retention | Supports recovery without creating an unprotected secondary copy of personal data. | Backup policy, encryption status, retention period, access-control list/role evidence, restore-test record, and deletion/disposal process. | Database/storage platform and deployment owner. |
| Secret and key management | Prevents credentials, API keys, and signing material from reaching source control, logs, or frontend bundles. | Environment/secret inventory, access-role evidence, rotation/revocation process, and confirmation that production values are server-only where required. | Deployment owner and hosting platform secret/key-management service. |
| Database least privilege | Limits blast radius if an application credential is compromised. | Database user/grant review showing the application account has only required schema/table operations; separate migration/admin access; network-access configuration. | Database administrator or managed database platform. |
| Trusted proxy headers and client-IP handling | Prevents spoofed protocol/IP headers from bypassing HTTPS enforcement, origin checks, or rate limiting. | Load-balancer/CDN configuration showing HTTPS termination, HTTP redirect, forwarding of trusted protocol/client-IP headers, stripping or overwrite of inbound client-supplied forwarding headers, and the Express `trust proxy` compatibility decision. | Hosting/CDN/load-balancer platform and deployment owner. |
| Centralised logging, retention, access control, and alerting | Enables detection, investigation, and accountable response to security-relevant events. | Log destination, retention policy, encryption/access controls, alert rules for authentication, rate-limit, proof-verification, and server errors, plus an alert-delivery test. | Logging/observability platform and deployment owner. |

### Hosting Handoff Matrix

| Hosting choice | Application-code status | Platform evidence the owner must obtain | Security claim permitted before evidence |
| --- | --- | --- | --- |
| Manus built-in hosting | The current project is deployed on the managed domain and externally observed HTTP→HTTPS, HSTS, CSP, and header controls are recorded above. | Managed service/security documentation or support attestation for data at rest, backups, secrets, database roles, proxy trust, and central logs. | Only the observed deployed web-transport controls and application-level controls may be claimed. |
| Vercel | The Express/full-stack runtime, database integration, server-side secrets, and headers must be tested after deployment; do not assume parity with the managed project runtime. | Production project configuration, environment-scope/role record, proxy/header behavior, connected database/storage evidence, log retention/access controls, and incident-alert evidence. | No Vercel security control is verified by this audit until environment-specific evidence is supplied. |
| Netlify | The deployment model must be checked for compatibility with the Express/full-stack application and any server functions; do not assume a static-site deployment is sufficient. | Production site/function configuration, environment-scope/role record, proxy/header behavior, connected database/storage evidence, log retention/access controls, and incident-alert evidence. | No Netlify security control is verified by this audit until environment-specific evidence is supplied. |

The deployment owner should attach the evidence to the release record, date it, name the environment, and re-review it after material changes to hosting, database, storage, observability, identity, or network configuration. Frontend and application-code development may continue, but the project must not be presented as fully deployment-security-verified until this matrix is closed.
