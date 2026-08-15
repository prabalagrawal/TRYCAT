export const PRIVACY_NOTICE_VERSION = "2026-08-15-draft";

const SUBJECT_ID_KEY = "trycat-privacy-subject-id";
const ANALYTICS_CHOICE_KEY = "trycat-analytics-choice";

export type AnalyticsChoice = "granted" | "denied";

export function getOrCreatePrivacySubjectId() {
  const existing = window.localStorage.getItem(SUBJECT_ID_KEY);
  if (existing) return existing;

  const subjectId = window.crypto.randomUUID();
  window.localStorage.setItem(SUBJECT_ID_KEY, subjectId);
  return subjectId;
}

export function getAnalyticsChoice(): AnalyticsChoice | null {
  const choice = window.localStorage.getItem(ANALYTICS_CHOICE_KEY);
  return choice === "granted" || choice === "denied" ? choice : null;
}

export function saveAnalyticsChoice(choice: AnalyticsChoice) {
  window.localStorage.setItem(ANALYTICS_CHOICE_KEY, choice);
}

export function loadOptionalAnalytics() {
  const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
  const websiteId = import.meta.env.VITE_ANALYTICS_WEBSITE_ID;
  if (!endpoint || !websiteId || document.getElementById("trycat-umami")) return;

  const script = document.createElement("script");
  script.id = "trycat-umami";
  script.defer = true;
  script.src = `${endpoint.replace(/\/$/, "")}/umami`;
  script.dataset.websiteId = websiteId;
  document.head.appendChild(script);
}
