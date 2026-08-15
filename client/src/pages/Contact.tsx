import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { LegalPageShell, LegalSection } from "@/components/LegalPageShell";
import { trpc } from "@/lib/trpc";
import { getOrCreatePrivacySubjectId } from "@/lib/privacy";

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [message, setMessage] = useState("");
  const [contactConsent, setContactConsent] = useState(false);
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [error, setError] = useState("");
  const submitContact = trpc.contact.submit.useMutation();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!contactConsent) {
      setError("Please confirm that TRYCAT may process this request so we can respond.");
      return;
    }
    submitContact.mutate({ subjectId: getOrCreatePrivacySubjectId(), name, email, organisation: organisation || undefined, message, contactProcessingConsent: true, marketingOptIn }, {
      onSuccess: (result) => setRequestId(result.requestId),
      onError: () => setError("We could not submit your request. No confirmation has been recorded. Please try again or email hello@trycat.com."),
    });
  };

  return <LegalPageShell eyebrow="BOOK A CALL / PRIVACY-AWARE CONTACT" title={<>Bring the problem.<br /><span>We’ll map the whole.</span></>} intro="Share the working version of the challenge. Your information is used to respond to this request; optional future updates are a separate choice.">
    <LegalSection title="Start a conversation">
      {requestId ? <div className="form-success"><CheckCircle2 size={24} /><div><strong>Request received.</strong><p>We recorded your reference as <code>{requestId}</code>. TRYCAT will use the details you supplied to respond to your enquiry.</p></div></div> : <form className="privacy-form" onSubmit={onSubmit} noValidate>
        <div className="form-grid"><label>Full name<input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label><label>Business email<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label></div>
        <label>Organisation <span className="field-optional">optional</span><input value={organisation} onChange={(event) => setOrganisation(event.target.value)} autoComplete="organization" /></label>
        <label>What would you like to explore?<textarea required minLength={10} value={message} onChange={(event) => setMessage(event.target.value)} /></label>
        <div className="consent-field"><label><input required type="checkbox" checked={contactConsent} onChange={(event) => setContactConsent(event.target.checked)} /><span><strong>Contact-request permission</strong><small>I agree that TRYCAT may use the information above to respond to my request. See the <a href="/privacy">Privacy Notice</a>.</small></span></label><label><input type="checkbox" checked={marketingOptIn} onChange={(event) => setMarketingOptIn(event.target.checked)} /><span><strong>Optional future updates</strong><small>I would like to receive occasional TRYCAT insights and updates. This is optional and is not needed for a reply.</small></span></label></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="form-submit" type="submit" disabled={submitContact.isPending}>{submitContact.isPending ? "Submitting…" : <>Send request <ArrowRight size={17} /></>}</button>
      </form>}
    </LegalSection>
    <LegalSection title="What happens next"><p>Your request is stored for up to 12 months after the last meaningful interaction under the current draft retention schedule. You can ask to correct, erase, or withdraw consent for this information using the <a href="/rights">Data Rights Request form</a>.</p><p className="legal-review">Operational review required: this public form has no verified CAPTCHA or abuse-prevention service in the current build. Do not treat it as production-hardened until server-side bot verification and rate limiting are deployed.</p></LegalSection>
  </LegalPageShell>;
}
