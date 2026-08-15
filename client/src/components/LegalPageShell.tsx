import { ArrowLeft, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

const SYMBOL_ARTWORK = "/manus-storage/trycat-symbol_ab641ec7.png";

export function LegalPageShell({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro: string;
  children: ReactNode;
}) {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <a className="brand-lockup" href="/" aria-label="TRYCAT home">
          <img className="brand-symbol" src={SYMBOL_ARTWORK} alt="" />
          <span className="brand-wordmark">TRYCAT<span>™</span></span>
        </a>
        <div className="legal-header-links">
          <a href="/privacy">Privacy</a>
          <a href="/terms">Terms</a>
          <a className="legal-contact-link" href="/contact">Book a call <ArrowUpRight size={14} /></a>
        </div>
      </header>
      <main className="legal-main">
        <section className="legal-hero">
          <a className="back-link" href="/"><ArrowLeft size={15} /> Back to TRYCAT</a>
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="legal-intro">{intro}</p>
          <p className="legal-review-badge">WORKING LEGAL COPY / REVIEW REQUIRED BEFORE PUBLICATION</p>
        </section>
        <section className="legal-content">{children}</section>
      </main>
      <footer className="legal-footer">
        <span>TRYCAT™ / SEE THE WHOLE.</span>
        <span>Privacy & grievance contact: <a href="mailto:hello@trycat.com">hello@trycat.com</a></span>
      </footer>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="legal-section"><h2>{title}</h2><div>{children}</div></section>;
}
