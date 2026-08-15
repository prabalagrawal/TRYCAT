# DPDP Compliance Implementation Checklist

- [x] Create and verify the local `compliance/dpdp` branch; do not push changes.
- [x] Inventory current personal-data collection points, third-party services, analytics scripts, cookies, and trackers.
- [x] Assess each discovered flow against purpose limitation, notice, consent, retention, rights, grievance, and security expectations; record decisions in `DPDP_PROGRESS.md`.
- [x] Upgrade the project architecture as needed to store consent and data-rights request records safely.
- [x] Add a Privacy Notice route with lawyer-review markers for scope, purposes, retention, third parties, rights, and grievance contact information.
- [x] Add an accessible consent banner that blocks non-essential analytics until a purpose-specific opt-in decision is made.
- [x] Add unticked, purpose-specific consent checkboxes to every personal-data entry point discovered in the audit.
- [x] Store durable consent records with version, purpose, timestamp, choice, and available contextual metadata.
- [x] Add a data-rights request form covering access, correction, erasure, and withdrawal requests; store each request safely.
- [x] Add a grievance contact to the footer and Privacy Notice.
- [x] Add a data-protection clause to the Terms route.
- [x] Create `BREACH_RUNBOOK.md` with a 72-hour Board-notice workflow and user-notice templates, marked for legal review.
- [x] Document discovered security gaps, including captcha verification, encryption failure behavior, HTTPS enforcement, and further observations.
- [x] Test the consent, routes, forms, tracker gate, build, and responsive layouts; summarize completed work, legal review items, and open work in `DPDP_PROGRESS.md`.

# Security Hardening Follow-up

- [x] Read and map the complete supplied security requirements to the actual TRYCAT feature set and record non-applicable integrations explicitly.
- [x] Audit public routes, tRPC procedures, authentication/session flows, client storage, input validation, output rendering, and request-size limits.
- [x] Scan the working tree, git-tracked files, relevant history, documentation, configuration, bundles, and environment-file names for committed secrets or insecure exposure patterns.
- [ ] Audit dependencies and source-control configuration; add a credential-safe `.env.example` and strengthen ignore rules where needed. (Dependency remediation and a managed-environment variable inventory remain open.)
- [x] Implement server-side public-endpoint rate limiting with a 429 response, neutral user-facing message, and a documented production shared-store requirement.
- [x] Implement security headers, production HTTPS enforcement, safe JSON body limits, and appropriate public-endpoint error handling.
- [x] Add tests for rate limits, validation, and security controls; run build, test, and dependency checks.
- [x] Create `SECURITY_AUDIT.md` documenting implemented controls, booking/Google/email/calendar non-applicability or future requirements, residual risks, and deployment verification steps.
- [ ] Triage and remediate all high-severity dependency audit findings in a compatibility-tested update branch.
- [ ] Add a privacy-reviewed, server-verified CAPTCHA or equivalent bot challenge to public forms and test failure-closed behaviour.
- [ ] Verify deployed TLS redirect, proxy trust, HSTS, database encryption, backup encryption, key management, least privilege, and central security logging before launch.
