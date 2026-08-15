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
- [x] Audit dependencies and source-control configuration; add a credential-safe managed-environment variable inventory and strengthen ignore rules where needed.
- [x] Implement server-side public-endpoint rate limiting with a 429 response, neutral user-facing message, and a documented production shared-store requirement.
- [x] Implement security headers, production HTTPS enforcement, safe JSON body limits, and appropriate public-endpoint error handling.
- [x] Add tests for rate limits, validation, and security controls; run build, test, and dependency checks.
- [x] Create `SECURITY_AUDIT.md` documenting implemented controls, booking/Google/email/calendar non-applicability or future requirements, residual risks, and deployment verification steps.
- [x] Triage and remediate all high-severity dependency audit findings in a compatibility-tested update branch.
- [ ] Add a privacy-reviewed, server-verified CAPTCHA or equivalent bot challenge to public forms and test failure-closed behaviour. (Blocked pending a valid provider credential pair.)
- [ ] Verify deployed TLS redirect, proxy trust, HSTS, database encryption, backup encryption, key management, least privilege, and central security logging before launch. (Requires deployment-owner evidence.)

# TRYCAT Originality and Motion Review

- [x] Audit the active visual system against the supplied originality constraints and document how the editorial rails, three-perspective grammar, typography, palette, diagnostic marks, and supplied master artwork remain proprietary to TRYCAT.
- [x] Confirm every visible cat treatment uses the approved three-cat master asset or a faithful derived vector layer, without mascot styling, stock illustration, or altered logo proportions.
- [x] Refine interaction and motion cues so Business, System, and Human states read as purposeful methodology interactions, with reduced-motion support and no generic SaaS/card-grid motifs.
- [x] Verify desktop and mobile rendering preserve the authored TRYCAT composition, persistent Book a Call CTA, and distinct brand recognition without relying on the wordmark alone.
- [x] Add the five-stage Diagnose / Clarify / Decide / Design / Deliver methodology journey as a functional, non-generic editorial progression connected to the three-perspective system.
- [x] Add the final dark convergence CTA that resolves the Business / System / Human story into Clarity, Decision, and Transformation without inventing client outcomes or replacing the approved artwork.
- [x] Verify keyboard interaction, hover behaviour, scroll story cues, and reduced-motion fallback across the master-artwork interaction and methodology journey.
