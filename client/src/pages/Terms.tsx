import { LegalPageShell, LegalSection } from "@/components/LegalPageShell";

export default function Terms() {
  return (
    <LegalPageShell
      eyebrow="TERMS / VERSION 2026-08-15-DRAFT"
      title={<>Terms with<br /><span>clear boundaries.</span></>}
      intro="These draft terms establish the website-use and data-protection framework for review. They are not a substitute for a service agreement, statement of work, or legal advice."
    >
      <div className="legal-callout"><strong>Draft only.</strong> These terms need review and completion with TRYCAT’s legal entity information, jurisdiction, commercial terms, intellectual-property provisions, and any client-service terms.</div>

      <LegalSection title="1. Website use">
        <p>This website provides information about TRYCAT’s business problem-solving and transformation methodology. You may use it for lawful, legitimate business purposes. You must not interfere with the site, attempt unauthorised access, introduce malicious code, or use the site in a way that infringes the rights of others.</p>
      </LegalSection>

      <LegalSection title="2. Intellectual property">
        <p>Unless otherwise stated, the TRYCAT name, brand assets, content, design system, and materials on this website are owned by or licensed to TRYCAT. No licence is granted except as necessary to view the site for personal or internal business evaluation.</p>
        <p className="legal-review">Review required: confirm ownership, permitted uses, trademarks, and any open-source notices.</p>
      </LegalSection>

      <LegalSection title="3. Data protection and privacy">
        <p>TRYCAT will handle personal data collected through this website in accordance with the <a href="/privacy">Privacy Notice</a>, applicable law, and the specific purpose described when data is collected. Where consent is used, the site presents a clear affirmative choice and provides a practical way to withdraw optional consent. TRYCAT will maintain reasonable safeguards, handle privacy requests through its published process, and take appropriate action if a personal-data incident occurs.</p>
        <p>By using a contact or data-rights form, you confirm that the information you submit is accurate and that you have authority to submit it. You should not submit sensitive, confidential, or third-party information unless it is necessary for your request and you are authorised to do so.</p>
        <p className="legal-review">Review required: confirm statutory references, data-fiduciary identity, international-transfer wording, liability allocation, retention obligations, and whether a separate client data-processing agreement is required.</p>
      </LegalSection>

      <LegalSection title="4. Third-party services">
        <p>Some site functions may rely on third-party services, including hosting, authentication, email delivery, optional analytics, and font delivery. Those services may have their own terms and privacy practices. TRYCAT will identify relevant processing in its Privacy Notice and seek to use appropriate contractual controls for processors.</p>
      </LegalSection>

      <LegalSection title="5. Disclaimers and contact">
        <p>Website materials are provided for general information and do not create a consulting engagement. To discuss work with TRYCAT, use the <a href="/contact">booking contact form</a>. For privacy or grievance matters, email <a href="mailto:hello@trycat.com">hello@trycat.com</a>.</p>
        <p className="legal-review">Review required: add governing law, dispute resolution, limitation of liability, termination, and notice provisions.</p>
      </LegalSection>
    </LegalPageShell>
  );
}
