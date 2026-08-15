import { ArrowRight, ExternalLink } from "lucide-react";
import { LegalPageShell, LegalSection } from "@/components/LegalPageShell";

const noticeVersion = "2026-08-15-draft";

export default function PrivacyNotice() {
  return (
    <LegalPageShell
      eyebrow="PRIVACY NOTICE / VERSION 2026-08-15-DRAFT"
      title={<>Your data.<br /><span>Your view.</span></>}
      intro="This draft notice explains how TRYCAT handles personal data when you use this website or contact us. It is written for review before publication and should be read with the final processor register and retention schedule."
    >
      <div className="legal-callout"><strong>What this notice is for.</strong> It describes the data currently processed through this site, why it is used, the choices available to you, and how to exercise your privacy rights. <em>Legal review must confirm the final data fiduciary identity, registered address, governing language, and any regulated retention duties.</em></div>

      <LegalSection title="1. Who is responsible">
        <p>TRYCAT is the organisation responsible for deciding why and how personal data is processed through this website. For privacy questions, grievances, or rights requests, contact <a href="mailto:hello@trycat.com">hello@trycat.com</a>.</p>
        <p className="legal-review">Review required: confirm the legal entity name, postal address, responsible role, and whether a Data Protection Officer or other authorised contact must be identified.</p>
      </LegalSection>

      <LegalSection title="2. Personal data we may process">
        <div className="legal-table-wrap"><table className="legal-table"><thead><tr><th>Situation</th><th>Data</th><th>Why</th></tr></thead><tbody>
          <tr><td>Contact or booking request</td><td>Name, business email, company (if supplied), message, and the purpose you select.</td><td>To respond to your request and discuss a possible engagement.</td></tr>
          <tr><td>Privacy or grievance request</td><td>Name, email, right requested, optional detail, and limited request-tracking information.</td><td>To verify, respond to, document, and improve the handling of your privacy request.</td></tr>
          <tr><td>Consent preferences</td><td>Pseudonymous browser identifier, purpose, choice, notice version, and timestamp.</td><td>To remember your choice and demonstrate consent or withdrawal where consent is the basis for processing.</td></tr>
          <tr><td>Website measurement — optional</td><td>Online identifiers and usage information as configured by the analytics service.</td><td>To understand aggregate website use only after you opt in.</td></tr>
          <tr><td>Authentication — only if enabled</td><td>Account identifier, name, email, login method, and session data.</td><td>To provide account access. The public TRYCAT site does not currently present sign-in as a normal visitor flow.</td></tr>
        </tbody></table></div>
      </LegalSection>

      <LegalSection title="3. Why we use personal data and our consent approach">
        <p>We use personal data only for the specific purpose described when it is collected, or where another lawful basis clearly applies. For contact and rights requests, the form asks for a clear, unticked confirmation before submission. Optional analytics does not load until you choose it through the consent banner.</p>
        <p>You can change or withdraw your optional analytics consent at any time using the consent controls or by submitting a rights request. Withdrawing consent does not affect processing already completed before withdrawal, and certain processing may continue if it is required by law.</p>
        <p className="legal-review">Review required: counsel must approve the lawful-basis language, the final notice version, and the language/localisation process required for the intended audience.</p>
      </LegalSection>

      <LegalSection title="4. Retention and deletion">
        <p>Draft operational retention periods are: consent events for 24 months after the latest preference change; contact/booking requests for 12 months after last meaningful interaction; and privacy/grievance requests for 36 months after closure. We will delete or anonymise data sooner when the purpose is no longer served, unless a longer period is required to meet a legal obligation, resolve a dispute, or establish, exercise, or defend legal claims.</p>
        <p className="legal-review">Review required: these periods are implementation defaults, not legal advice. Approve them against contracts, finance/tax obligations, litigation holds, employment rules, and the final processor configuration.</p>
      </LegalSection>

      <LegalSection title="5. Third parties and disclosures">
        <p>The current site may use: website hosting, database and authentication infrastructure; an email provider for messages sent to TRYCAT; Google Fonts for typography; and Umami analytics only if you opt in. We may also use service providers that help operate, secure, support, or improve the site. We will disclose personal data to a processor only under an appropriate contractual arrangement and only for the stated purpose.</p>
        <p className="legal-review">Review required: publish the verified processor/sub-processor list, service locations, data-transfer conditions, analytics hosting configuration, email provider, and whether Google Fonts are self-hosted before launch.</p>
      </LegalSection>

      <LegalSection title="6. Your choices and rights">
        <p>You can ask TRYCAT to provide access to information about personal data we process, correct inaccurate or incomplete data, erase data where applicable, withdraw consent, or raise a grievance. Use the <a href="/rights">Data Rights Request form <ExternalLink size={14} /></a> or email <a href="mailto:hello@trycat.com">hello@trycat.com</a>. We may request information reasonably necessary to verify a request and protect personal data from unauthorised disclosure.</p>
        <a className="legal-action" href="/rights">Make a data-rights request <ArrowRight size={17} /></a>
      </LegalSection>

      <LegalSection title="7. Security and incidents">
        <p>We are implementing reasonable technical and organisational safeguards designed to protect personal data. If a personal-data breach occurs, we will follow the applicable incident process, assess affected data and individuals, and provide notifications where required.</p>
        <p className="legal-review">Review required: validate the final breach-notice timing, Board notification form, individual-notice content, security control evidence, encryption configuration, and incident-response responsibilities.</p>
      </LegalSection>

      <LegalSection title="8. Questions, grievances, and updates">
        <p>For questions, grievances, or requests, write to <a href="mailto:hello@trycat.com">hello@trycat.com</a>. We will update this notice when our processing changes. The current implementation notice version is <strong>{noticeVersion}</strong>.</p>
      </LegalSection>
    </LegalPageShell>
  );
}
