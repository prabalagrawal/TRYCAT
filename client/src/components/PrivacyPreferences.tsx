import { useEffect, useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { getAnalyticsChoice, getOrCreatePrivacySubjectId, loadOptionalAnalytics, PRIVACY_NOTICE_VERSION, saveAnalyticsChoice } from "@/lib/privacy";

function removeOptionalAnalytics() {
  document.getElementById("trycat-umami")?.remove();
}

export default function PrivacyPreferences() {
  const [open, setOpen] = useState(false);
  const [analyticsChoice, setAnalyticsChoice] = useState<"granted" | "denied" | null>(null);
  const [error, setError] = useState("");
  const updateConsent = trpc.privacy.recordConsent.useMutation();

  useEffect(() => setAnalyticsChoice(getAnalyticsChoice()), []);

  const updateAnalytics = (next: "granted" | "denied") => {
    setError("");
    const recordChoice = next === "denied" && analyticsChoice === "granted" ? "withdrawn" : next;
    updateConsent.mutate({
      subjectId: getOrCreatePrivacySubjectId(),
      purpose: "analytics",
      choice: recordChoice,
      noticeVersion: PRIVACY_NOTICE_VERSION,
      source: "preference_center",
    }, {
      onSuccess: () => {
        saveAnalyticsChoice(next);
        setAnalyticsChoice(next);
        if (next === "granted") loadOptionalAnalytics();
        else removeOptionalAnalytics();
      },
      onError: () => setError("We could not save your updated privacy choice. Your existing setting has not changed."),
    });
  };

  return <>
    <button className="privacy-preferences-trigger" type="button" onClick={() => setOpen(true)}><ShieldCheck size={15} /> Privacy choices</button>
    {open && <div className="privacy-preferences-overlay" role="presentation" onMouseDown={() => setOpen(false)}><section className="privacy-preferences-panel" role="dialog" aria-modal="true" aria-labelledby="privacy-preferences-title" onMouseDown={(event) => event.stopPropagation()}><div className="privacy-preferences-top"><div><p className="eyebrow">Preference centre / {PRIVACY_NOTICE_VERSION}</p><h2 id="privacy-preferences-title">Your signals.</h2></div><button type="button" className="consent-close" onClick={() => setOpen(false)} aria-label="Close privacy choices"><X size={18} /></button></div><p>Necessary storage remembers this privacy setting. Optional analytics remains off unless you actively enable it.</p><div className="preference-row"><div><strong>Optional analytics</strong><small>Allow aggregate website measurement through Umami. This can be withdrawn here at any time.</small></div><button type="button" className={analyticsChoice === "granted" ? "preference-toggle is-on" : "preference-toggle"} onClick={() => updateAnalytics(analyticsChoice === "granted" ? "denied" : "granted")} disabled={updateConsent.isPending} aria-pressed={analyticsChoice === "granted"}>{analyticsChoice === "granted" ? <><Check size={14} /> Enabled</> : "Disabled"}</button></div>{error && <p className="consent-error" role="alert">{error}</p>}<p className="preference-note">{analyticsChoice === "granted" ? "Withdrawing will stop future optional analytics loading in this browser. Reload the page after withdrawal to clear any already-loaded analytics session." : "No optional analytics is enabled in this browser."}</p><a href="/privacy">Read the Privacy Notice</a></section></div>}
  </>;
}
