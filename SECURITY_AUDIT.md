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
| Dependency vulnerabilities require remediation | The package-manager audit reported **72 vulnerabilities: 17 high, 47 moderate, 8 low**. The audit identified affected package families including `tar`, `vite`, `esbuild`, and `pnpm`; an example chain was `streamdown → mermaid`. | Dependency tree / build toolchain | Known vulnerable dependency behaviour may become exploitable depending on deployment and use. | `pnpm audit --audit-level=low --prod`, 15 Aug 2026. | Review each advisory, update direct/transitive packages in a compatibility branch, rebuild, and retest. Do not publish until high-severity advisories are dispositioned. | Open |
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
| Dependency audit findings | High | Security upgrades were not applied blindly because they may require compatibility changes. | Triage every advisory, update in a dedicated dependency branch, retest, and record accepted exceptions. |
| CAPTCHA absent | High | No bot-verification provider or key has been selected/configured. | Select a privacy-reviewed provider, configure credentials through managed secrets, and fail closed on verification errors. |
| Production-edge HTTPS/proxy proof | High | Local test simulated a trusted TLS proxy; live edge configuration was not available for inspection. | Perform a deployed header scan and confirm load-balancer trust/redirect settings before release. |
| Platform session fallback | Medium | Runtime uses session storage fallback for constrained browser contexts. | Confirm production behaviour with platform owner; eliminate browser token fallback if possible. |
| Encryption and database infrastructure evidence | Medium | App source cannot prove data-at-rest, backup, key-management, or network controls. | Obtain formal infrastructure evidence and verify least-privilege database configuration. |
| Rate-limit data cleanup | Medium | No approved periodic cleanup process is defined. | Add a scheduled cleanup only after retention/legal approval, using the platform-supported scheduler. |

> **Conclusion:** No known unresolved critical application-level vulnerability was identified within the tested scope. The application must **not** be described as “100% secure.” The high-severity dependency findings, CAPTCHA gap, and production-edge verification remain release-gating work.
