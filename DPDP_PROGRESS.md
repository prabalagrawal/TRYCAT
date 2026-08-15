# TRYCAT DPDP Compliance Progress

> **Working document — legal and operational review required before relying on these controls.** This implementation is designed around the DPDP Act’s notice, consent, rights, security-safeguard, erasure, grievance, and breach-intimation concepts. It is not a legal opinion and must be reviewed against the organisation’s final service model, processor contracts, published retention schedule, and any applicable rules or notifications.

## Delivery Scope and Decision Log

| Item | Decision | Status | Owner / review required |
| --- | --- | --- | --- |
| Working branch | Created and working locally on `compliance/dpdp`; no remote push will be performed. | Complete | Engineering |
| Consent persistence | The previous static site cannot safely retain auditable consent evidence or rights requests. The project has therefore been upgraded to use a server and database. | In progress | Engineering / privacy counsel |
| Data minimisation | Consent evidence will use a random browser subject token rather than an IP address. Rights requests will collect only name, email, request category, and optional request detail. | Approved implementation decision | Privacy counsel to validate against final workflow |
| Notice versioning | Each stored consent event will carry a notice version. The initial implementation uses `2026-08-15-draft`. | In progress | Legal to approve version and effective date |
| Analytics | Umami is configured in `client/index.html` and currently loads before a visitor makes a choice. It will be changed to load only after an explicit analytics opt-in. | In progress | Engineering |
| Fonts | Google Fonts are requested directly from `fonts.googleapis.com` and `fonts.gstatic.com`, which can expose technical request data to that provider. This remains a third-party disclosure requiring notice and a business decision on self-hosting. | Open | Product / legal |
| Rights and grievance | A public rights-request form, Privacy Notice route, Terms route, and footer grievance contact will be implemented. | In progress | Legal / operations to confirm contact owner and SLA |
| Incident response | A breach response runbook will use a conservative 72-hour internal/Board-notice target requested for this project. The final statutory timing, form, and notification workflow require counsel confirmation. | In progress | Legal / security |

## Current Personal-Data and Third-Party Inventory

| Surface or service | Data observed or likely processed | Purpose observed in code | Current state | DPDP implementation action |
| --- | --- | --- | --- | --- |
| Website CTA mail links | Email address, message subject, and any content voluntarily entered in the visitor’s email client | Start a commercial conversation / book a call | No app-side storage; recipient email provider and any configured mailbox processing must be documented separately. | Privacy Notice will disclose the site’s role and flag email-service details for confirmation. |
| Umami analytics script | Online identifiers and usage events as configured by the analytics service | Usage measurement | Script is injected in `client/index.html` before a choice is made. | Remove static injection; conditionally load only after explicit Analytics opt-in. |
| Google Fonts | IP address and technical request metadata may be sent to Google on font fetch | Typography delivery | Direct third-party font requests are active. | List as third party; decide whether to self-host before production. |
| Manus OAuth scaffolding | `openId`, name, email, login method, session data | Authentication if login is activated | Framework route and user table exist; the current public TRYCAT UI does not expose login. | Document as dormant / activate only with reviewed notice, retention, access controls, and user-facing sign-in flow. |
| Client storage in framework | Preview/runtime identity data and a bearer-token fallback in browser storage | Session / preview runtime support | Present in upgraded template, not a bespoke TRYCAT feature. | Record as a security and privacy review item; do not use this storage for new consent or rights data beyond a pseudonymous preference token. |
| Data-rights form (to be added) | Name, email, selected right, optional message, consent evidence | Receive and respond to statutory/privacy requests | New processing activity. | Add per-purpose consent, DB records, retention field, access-controlled handling, and Privacy Notice disclosure. |
| Consent record store (to be added) | Pseudonymous browser token, purpose, choice, notice version, timestamp, minimal context | Demonstrate notice and consent evidence; honour withdrawal | New processing activity. | Store events server-side; fail closed when database storage is unavailable. |

## Legal and Product Findings

The official DPDP Act provides that a consent request must be accompanied or preceded by a notice identifying the personal data and purpose, the way rights may be exercised, and how the individual may complain to the Board. It also describes consent as free, specific, informed, unconditional, unambiguous, and expressed through clear affirmative action, and requires withdrawal to be as easy as giving consent. [1]

For the planned public rights form, the implementation will use **unticked** controls and separate the necessary request-handling permission from optional analytics. This is a practical implementation choice intended to support specific, purpose-limited consent; counsel should confirm the final lawful basis and wording for any inquiry received through email rather than the form. [1]

The Act requires reasonable security safeguards, breach intimation to the Board and affected individuals in the prescribed form and manner, erasure when consent is withdrawn or purpose is no longer served unless retention is required by law, published contact information for an appropriate responder, and an effective grievance-redressal mechanism. [1]

## Security Gaps and Remediation Decisions

| Severity | Finding | Evidence | Decision / remediation |
| --- | --- | --- | --- |
| High | Non-essential analytics loads before consent. | Static Umami tag is present in `client/index.html`. | Replace with runtime loader invoked only after explicit Analytics consent. |
| High | New public form would be spam-prone without verified bot protection and rate limiting. | No captcha verification or rate-limit middleware exists in the current server. | Add a server-side verification integration before production. The implementation will visibly flag the missing verified CAPTCHA and avoid claiming protection it does not have. |
| High | Existing DB helper returns `undefined` when the database is unavailable; this is a fail-open pattern unsuitable for recording consent or rights requests. | `server/db.ts` logs and returns when no DB is available. | New consent/rights operations will throw and return an error if persistence is unavailable; no success confirmation will be displayed unless storage completes. |
| High | HTTPS enforcement depends on request detection; the session cookie can be non-secure on HTTP. | `server/_core/cookies.ts` derives `secure` from the incoming request protocol / forwarded header. | Add production HTTPS redirect / reject handling, verify the trusted proxy configuration, and confirm an HTTP request cannot reach public forms or authenticate with a non-secure session cookie. Owner: platform/security. |
| High | **Encryption fail-open / unverified encryption gap.** The application has no verified application-level encryption configuration, no KMS/key-management evidence, and no startup or request guard that blocks privacy-record processing when transport or at-rest encryption assurance is absent. Source review cannot prove whether the platform encrypts database, backups, logs, or processor transfers. | No encryption policy, key reference, encryption-health check, or deployment TLS enforcement is present in the application source reviewed. | Treat encryption as **unverified and potentially fail-open**, not as implemented. Before release, obtain platform evidence for TLS enforcement, database and backup encryption, key custody/rotation, and access logs; add a deployment release gate that fails closed if mandatory transport controls are absent. Owner: platform/security with legal oversight. |
| Medium | Session configuration uses `SameSite=None`; any cross-site requirement must be validated with CSRF controls and trusted deployment domains. | `server/_core/cookies.ts`. | Flag for security review; do not change framework behaviour without platform compatibility testing. |
| Medium | No defined retention schedule exists for OAuth profiles, inquiry email, consent evidence, or privacy requests. | No application retention policy or cleanup job exists. | Publish provisional retention windows marked for legal review; do not schedule deletion without an approved policy. |
| Medium | No processor inventory or signed processor contracts are present in the codebase. | Google Fonts, analytics, hosting/auth infrastructure, and email operations require an external operational inventory. | Legal / procurement open item. |
| Low | The codebase had no Privacy Notice, Terms, dedicated grievance contact, rights form, or consent records. | Route and UI audit. | Implemented in this branch; exact legal copy and recipient details remain review items. |

## Open Legal / Operational Items

| Open item | Why it must be confirmed | Required decision |
| --- | --- | --- |
| Grievance contact | The site currently uses `hello@trycat.com`; ownership, monitored hours, escalation path, and named responsible person are not established in code. | Confirm the published address and accountable role before launch. |
| Retention | The site has no legal hold, contract, tax, or regulatory retention analysis. | Approve final periods for consent evidence, data-rights requests, mailbox inquiries, and dormant OAuth accounts. |
| Third parties | Final processor/sub-processor list and locations are not available in the codebase. | Confirm Umami hosting, Google Fonts decision, email provider, hosting/CDN, database, auth, and any calendar or CRM integrations before launch. |
| 72-hour Board notification | The project requests a 72-hour Board notice target. The Act text extracted for this audit requires breach intimation in a prescribed form and manner; counsel must validate the active rules, timing, and incident scope. [1] | Approve the operational timer and notification templates. |
| Child-data processing | The public site is not designed for children, but no age gate or parental-consent mechanism exists. | Confirm target audience and whether an age / child-data control is required. |
| Encryption | Platform-level encryption at rest, key management, backup encryption, and transit enforcement are not verified from source code. | Obtain infrastructure evidence and document the encryption control owner. |

## Implementation Completed in This Branch

| Control | Implementation | Verification status |
| --- | --- | --- |
| Privacy Notice | Added `/privacy` with personal-data categories, purposes, draft retention windows, third-party treatment, individual rights, grievance channel, and visible legal-review markers. | Route captured and reviewed in-browser. |
| Terms clause | Added `/terms` with a data-protection and privacy clause, link to the Privacy Notice, and legal-review markers. | Route captured and reviewed in-browser. |
| Public contact path | Replaced site booking CTAs with `/contact`, a form that separately captures necessary contact-request permission and optional marketing choice. | Route captured; submission logic covered by unit tests. |
| Data-rights requests | Added `/rights` for access, correction, erasure, withdrawal, and grievance requests; requests are stored with status, notice version, and retention date. | Route captured; persistence flow covered by unit tests. |
| Consent evidence | Added purpose, choice, source, notice version, timestamp, and retention fields. Contact processing, rights handling, analytics, and marketing are separate purpose values. | Database migration applied; unit tests pass. |
| Non-essential analytics | Removed the static Umami tag. Analytics is loaded dynamically only after the visitor enables the optional analytics checkbox and the affirmative choice is stored. | Browser inspection confirmed no Umami script is present before consent and optional checkbox is unchecked. |
| Consent withdrawal | Added an always-available Privacy Choices control. A visitor can withdraw analytics consent; the update is recorded as `withdrawn` and the optional analytics script is removed for the current page. | Build and type-check pass; final operational/counsel review required. |
| Fail-closed persistence | New privacy record helpers throw when the database is unavailable, so the visitor-facing forms do not report success without durable storage. | Unit test covers failing consent persistence. |
| Grievance contact | Published `hello@trycat.com` in the footer and Privacy Notice; it also appears in the data-rights flow. | Visible in all new privacy route captures. |
| Breach response | Added `BREACH_RUNBOOK.md` with an incident timeline, 72-hour internal Board-notice target, Board template, user template, roles, closure criteria, and known readiness gaps. | Document created; counsel review required. |

## Current Readiness Position

The implementation now provides a working privacy notice, terms route, rights and contact forms, consent evidence storage, an analytics opt-in gate, and a withdrawal mechanism. It is **not ready to be represented as legally complete or production-hardened** until the open legal, provider, security, and operational items below are completed.

| Priority | Open item | Why it blocks a compliance claim |
| --- | --- | --- |
| P0 | Confirm `hello@trycat.com` ownership, monitoring, grievance role, escalation, and response SLA. | A published address alone is not an effective grievance-redressal mechanism. |
| P0 | Add and verify server-side CAPTCHA/bot verification and rate limiting for public forms. | The current form endpoints have no verified anti-automation control. |
| P0 | Verify deployment HTTPS redirect/enforcement and secure-cookie behaviour at the production edge. | Source code derives cookie security from request protocol; the deployment layer has not been evidenced. |
| P0 | Obtain infrastructure evidence for encryption in transit, at rest, backup encryption, key management, and access logging; configure a release gate for encryption assurance. | Encryption is currently treated as unverified and potentially fail-open because the application does not prove or enforce it. |
| P1 | Approve data-fiduciary identity, address, legal copy, language/localisation, final lawful bases, rights workflow, and retention schedule. | Draft copy and provisional periods require qualified legal review. |
| P1 | Complete a verified processor/sub-processor register and contractual assessment. | The source reveals analytics and font delivery, while final email, hosting, database, authentication, and any future calendar/CRM services need operational confirmation. |
| P1 | Confirm the final Board/user breach-notification rule requirements and 72-hour operating target. | The runbook deliberately treats 72 hours as an internal target pending legal confirmation. |
| P2 | Add an approved retention-deletion job and evidence process after retention periods are signed off. | The schema stores retention dates but there is no scheduled deletion process in this branch. |

## References

[1] [Government of India, *Digital Personal Data Protection Act, 2023*](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf)
