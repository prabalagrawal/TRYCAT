import { useEffect, useState } from "react";
import { Check, ChevronDown, ShieldCheck, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getAnalyticsChoice, getOrCreatePrivacySubjectId, loadOptionalAnalytics, PRIVACY_NOTICE_VERSION, saveAnalyticsChoice } from "@/lib/privacy";

export default function ConsentBanner() {
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [error, setError] = useState("");
  const recordConsent = trpc.privacy.recordConsent.useMutation();

  useEffect(() => {
    const existingChoice = getAnalyticsChoice();
    if (existingChoice === "granted") loadOptionalAnalytics();
    setVisible(!existingChoice);
    setReady(true);
  }, []);

  const saveChoice = (choice: "granted" | "denied") => {
    setError("");
    recordConsent.mutate({
      subjectId: getOrCreatePrivacySubjectId(),
      purpose: "analytics",
      choice,
      noticeVersion: PRIVACY_NOTICE_VERSION,
      source: "consent_banner",
    }, {
      onSuccess: () => {
        saveAnalyticsChoice(choice);
        if (choice === "granted") loadOptionalAnalytics();
        setVisible(false);
      },
      onError: () => setError("We could not save your privacy choice. No optional analytics has been enabled. Please try again."),
    });
  };

  if (!ready || !visible) return null;

  return (
    <aside className="consent-banner" aria-label="Privacy choices">
      <div className="consent-banner-heading"><span className="consent-icon"><ShieldCheck size={17} /></span><div><p className="eyebrow">Privacy choices / {PRIVACY_NOTICE_VERSION}</p><h2>Set your signal.</h2></div><button className="consent-close" type="button" onClick={() => saveChoice("denied")} aria-label="Use only necessary settings"><X size={18} /></button></div>
      <p>TRYCAT uses necessary storage to remember privacy choices. Optional analytics is off until you actively enable it.</p>
      <button className="consent-disclosure" type="button" onClick={() => setDetailsOpen((value) => !value)} aria-expanded={detailsOpen}>View purpose details <ChevronDown size={15} className={detailsOpen ? "is-open" : ""} /></button>
      {detailsOpen && <div className="consent-details"><label><input type="checkbox" checked={analyticsEnabled} onChange={(event) => setAnalyticsEnabled(event.target.checked)} /><span><strong>Optional analytics</strong><small>Allow aggregated usage measurement through Umami. This may process online identifiers and usage events. You can withdraw this choice later through a data-rights request.</small></span></label></div>}
      {error && <p className="consent-error" role="alert">{error}</p>}
      <div className="consent-actions"><button className="consent-secondary" type="button" disabled={recordConsent.isPending} onClick={() => saveChoice("denied")}>Only necessary</button><button className="consent-primary" type="button" disabled={recordConsent.isPending} onClick={() => saveChoice(analyticsEnabled ? "granted" : "denied")}>{recordConsent.isPending ? "Saving…" : <>{analyticsEnabled ? "Save choices" : "Save without analytics"} <Check size={15} /></>}</button></div>
      <a href="/privacy">Read the Privacy Notice</a>
    </aside>
  );
}
