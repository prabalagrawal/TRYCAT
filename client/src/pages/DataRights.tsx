import { FormEvent, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { LegalPageShell, LegalSection } from "@/components/LegalPageShell";
import { trpc } from "@/lib/trpc";
import { getOrCreatePrivacySubjectId } from "@/lib/privacy";
import { ProofOfWorkChallenge, type BotProof } from "@/components/ProofOfWorkChallenge";

const rightOptions = [
  ["access", "Access personal data"],
  ["correction", "Correct personal data"],
  ["erasure", "Erase personal data"],
  ["withdrawal", "Withdraw consent"],
  ["grievance", "Raise a grievance"],
] as const;

export default function DataRights() {
  const [subjectId] = useState(() => getOrCreatePrivacySubjectId());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [requestType, setRequestType] = useState<(typeof rightOptions)[number][0]>("access");
  const [details, setDetails] = useState("");
  const [requestConsent, setRequestConsent] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [error, setError] = useState("");
  const [botProof, setBotProof] = useState<BotProof | null>(null);
  const submitRequest = trpc.rights.submit.useMutation();

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (!requestConsent) {
      setError("Please confirm that TRYCAT may use these details to handle your privacy request.");
      return;
    }
    if (!botProof) {
      setError("Form protection is still preparing. Please wait a moment and try again.");
      return;
    }
    submitRequest.mutate({ subjectId, name, email, requestType, details: details || undefined, requestHandlingConsent: true, botProof }, {
      onSuccess: (result) => setRequestId(result.requestId),
      onError: () => setError("We could not record your request. Please try again or email hello@trycat.com."),
    });
  };

  return <LegalPageShell eyebrow="DATA RIGHTS / REQUEST CENTRE" title={<>Your right.<br /><span>Your next move.</span></>} intro="Use this form to ask for access, correction, erasure, withdrawal of consent, or to raise a privacy grievance. We may need to verify your identity before acting on a request.">
    <LegalSection title="Make a request">
      {requestId ? <div className="form-success"><CheckCircle2 size={24} /><div><strong>Request received.</strong><p>Keep this reference: <code>{requestId}</code>. We will verify the request before disclosing, changing, or deleting personal data.</p></div></div> : <form className="privacy-form" onSubmit={onSubmit} noValidate>
        <div className="form-grid"><label>Full name<input required value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" /></label><label>Email used with TRYCAT<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></label></div>
        <label>What would you like to do?<select value={requestType} onChange={(event) => setRequestType(event.target.value as typeof requestType)}>{rightOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label>Request details <span className="field-optional">optional</span><textarea value={details} onChange={(event) => setDetails(event.target.value)} placeholder="Tell us enough to locate or understand your request. Please do not include unnecessary sensitive data." /></label>
        <div className="consent-field"><label><input required type="checkbox" checked={requestConsent} onChange={(event) => setRequestConsent(event.target.checked)} /><span><strong>Request-handling permission</strong><small>I agree that TRYCAT may use these details to verify and respond to this rights or grievance request under the <a href="/privacy">Privacy Notice</a>.</small></span></label></div>
        <ProofOfWorkChallenge subjectId={subjectId} onSolved={setBotProof} />
        {error && <p className="form-error" role="alert">{error}</p>}
        <button className="form-submit" type="submit" disabled={submitRequest.isPending || !botProof}>{submitRequest.isPending ? "Recording…" : <>Submit request <ArrowRight size={17} /></>}</button>
      </form>}
    </LegalSection>
    <LegalSection title="Verification and timing"><p>To protect your data, TRYCAT may ask for information reasonably necessary to verify your identity. The current draft operating period for privacy records is 36 months after closure. This period, response targets, escalation route, and any refusal grounds require legal and operational approval before launch.</p><p>You may also email <a href="mailto:hello@trycat.com">hello@trycat.com</a> for a privacy question or grievance.</p></LegalSection>
  </LegalPageShell>;
}
