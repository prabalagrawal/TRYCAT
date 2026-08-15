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
