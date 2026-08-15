# TRYCAT Personal Data Breach Runbook

> **Working incident-response document — legal, security, and operations review required before adoption.** This runbook uses a conservative **72-hour internal target for Board notification** because that is the project requirement. The DPDP Act requires a Data Fiduciary to notify the Data Protection Board of India and each affected Data Principal in the prescribed form and manner after a personal-data breach; final timing, notification form, severity threshold, and rules applicability must be confirmed by qualified Indian privacy counsel. [1]

## 1. Scope and Trigger

A personal-data breach includes unauthorised processing, accidental disclosure, acquisition, sharing, use, alteration, destruction, or loss of access that compromises confidentiality, integrity, or availability of personal data. [1]

This runbook applies to suspected or confirmed events affecting TRYCAT-controlled website data, including consent records, contact requests, data-rights requests, authentication data, analytics data where configured, backups, logs, and processors handling those data sets.

| Trigger | Immediate action | Owner |
| --- | --- | --- |
| Unexpected database access, export, or privilege change | Preserve evidence, revoke or rotate affected access, open incident ticket. | Security lead / platform owner |
| Public form abuse or suspected data exfiltration | Disable the affected form path if needed, preserve request logs, assess exposure. | Engineering lead |
| Lost, misdirected, or compromised email containing personal data | Recall where possible, restrict recipient access, collect message metadata. | Grievance contact / operations |
| Processor or vendor alert | Record the vendor notice, seek scope/timing details, activate response team. | Privacy lead / vendor manager |
| Data unavailable, corrupted, or deleted | Stabilise service, preserve backups, determine whether availability of personal data was compromised. | Engineering lead |

## 2. Incident Roles

| Role | Minimum responsibilities |
| --- | --- |
| Incident commander | Opens the incident record, coordinates containment, runs decision meetings, preserves the timeline. |
| Security / engineering lead | Investigates root cause, scopes systems and data, contains access, validates recovery, keeps technical evidence. |
| Privacy / grievance lead | Assesses Data Principal impact, maintains notice drafts, coordinates rights and support workflow. |
| Legal counsel | Confirms legal classification, notification obligations, wording, privilege strategy, and regulator/Board process. |
| Communications lead | Coordinates approved external notices and support messaging. |
| Executive sponsor | Approves material notifications and remediation commitments. |

> **Operational dependency:** The published grievance address is currently `hello@trycat.com`. Before launch, assign named primary and backup owners with monitored hours and escalation contact details.

## 3. First 24 Hours: Contain, Preserve, Assess

| Window | Required action | Evidence to retain |
| --- | --- | --- |
| 0–1 hour | Declare suspected incident; assign incident commander; record time detected, reporter, and affected service. | Ticket ID, timestamp, initial report, access logs. |
| 0–4 hours | Contain safely: disable compromised credentials, revoke sessions/tokens, restrict risky endpoints, pause unsafe processor connections. Do not destroy evidence. | Change records, command history, screenshots, audit logs. |
| 4–12 hours | Identify affected records, data categories, time range, systems, recipients, and whether data was accessed, altered, deleted, or merely exposed. | Query outputs, access-log extracts, vendor statements. |
| 12–24 hours | Convene privacy/legal assessment; determine affected Data Principals, likely harm, remediation steps, and notification path. | Written assessment, legal advice, approval record. |

## 4. 72-Hour Board-Notice Target

TRYCAT will work to have a legally reviewed Board-notice decision and, if notice is required, a submitted notice within 72 hours of awareness. This is an internal target, not a statement that 72 hours is the final statutory deadline.

| Deadline | Gate | Required output |
| --- | --- | --- |
| By 24 hours | Initial scope confirmed | Incident timeline, systems/data inventory, containment status, preliminary affected-person count. |
| By 48 hours | Legal and executive decision | Draft Board notice, draft user notice, processor updates, remediation plan. |
| By 72 hours | Notification action | Submission to the Board if required or a written, counsel-approved basis for a different approach; preserved receipt and final notice record. |

### Board Notice Draft — Review Before Use

```text
Subject: Personal Data Breach Intimation — TRYCAT [Incident Reference]

To: Data Protection Board of India

TRYCAT is providing this intimation regarding a [suspected/confirmed] personal data breach identified on [date/time, time zone].

1. Incident reference: [ID]
2. Date and time detected: [details]
3. Systems/processors involved: [details]
4. Personal data categories involved: [details]
5. Estimated affected Data Principals: [number/range and method]
6. Nature of unauthorised processing, disclosure, acquisition, sharing, alteration, destruction, or loss of access: [details]
7. Containment and remediation already taken: [details]
8. Potential impacts and support offered to affected individuals: [details]
9. Data Fiduciary contact: [name, role, email, phone]
10. Further information and update timetable: [details]

This notice is submitted subject to ongoing investigation. TRYCAT will provide material updates as appropriate.
```

## 5. Data Principal Notice

Notify each affected person where required, using direct channels that are appropriate to the circumstances. Do not conceal material facts, speculate about unverified impact, or request credentials, payment, or sensitive data in a breach notice.

### User Notice Draft — Review Before Use

```text
Subject: Important information about your personal data — TRYCAT [Incident Reference]

Hello [Name],

We are writing to let you know about a [suspected/confirmed] incident involving personal data connected with TRYCAT. We identified it on [date].

What happened: [clear, factual summary].

Information involved: [data categories that apply to this person].

What we have done: [containment, security steps, restoration, and relevant notifications].

What you can do: [specific, proportionate protective actions — only where genuinely useful].

Support and questions: Contact [grievance contact] with reference [ID]. You may also use [rights-request URL] to make a privacy request.

We regret this incident and will continue to provide material updates where appropriate.

TRYCAT
```

## 6. Recovery, Closure, and Learning

Containment is not closure. Before closing an incident, the incident commander must confirm that access is secured, compromised secrets are rotated, affected records are restored or remediated, notifications are logged, and corrective actions have named owners and dates.

| Closure item | Evidence required |
| --- | --- |
| Containment validated | Security sign-off and post-fix access review. |
| Notification record complete | Board submission/receipt if applicable, user-notice logs, and approved communications. |
| Processor follow-up complete | Contractual incident reports and corrective commitments. |
| Root cause and prevention plan | Written post-incident review with owners and due dates. |
| Retention / deletion follow-up | Confirm any emergency data copies, exports, or diagnostics are retained only as necessary and then disposed of securely. |

## 7. Known Readiness Gaps

This branch documents but does not eliminate the following launch blockers: verified CAPTCHA is not implemented; public-form rate limiting is not implemented; transport enforcement must be verified at deployment; platform encryption-at-rest and key-management evidence is not verified in source; and a final processor register, grievance owner, and retention schedule have not yet been approved.

## References

[1] [Government of India, *Digital Personal Data Protection Act, 2023*](https://www.meity.gov.in/static/uploads/2024/06/2bf1f0e9f04e6fb4f8fef35e82c42aa5.pdf)
