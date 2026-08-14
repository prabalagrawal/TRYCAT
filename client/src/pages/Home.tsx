// TRYCAT style reminder: Signal / Structure — neo-grotesk editorial systems design, warm ivory field, carbon structure, ginger action signals, selective indigo intelligence, and the supplied three-cat artwork as the immutable visual source.
import { useEffect, useState } from "react";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Check,
  CircleDot,
  Menu,
  MoveRight,
  Plus,
  ScanLine,
  X,
} from "lucide-react";

const MASTER_ARTWORK = "/manus-storage/trycat-master_d17077f1.png";
const SYMBOL_ARTWORK = "/manus-storage/trycat-symbol_ab641ec7.png";

type PerspectiveKey = "business" | "system" | "human";

const perspectives: Record<
  PerspectiveKey,
  {
    number: string;
    label: string;
    role: string;
    title: string;
    copy: string;
    proof: string[];
    color: string;
  }
> = {
  business: {
    number: "01",
    label: "BUSINESS",
    role: "The Analyst",
    title: "What is true in the market?",
    copy: "We surface the evidence beneath the noise: the customer, commercial, and performance realities shaping the decision.",
    proof: ["Research", "Commercial reality", "Performance"],
    color: "grey",
  },
  system: {
    number: "02",
    label: "SYSTEM",
    role: "The Navigator",
    title: "What keeps the problem in place?",
    copy: "We map the operating conditions, choices, and dependencies that turn a local issue into a system-wide pattern.",
    proof: ["Processes", "Decision-making", "Transformation"],
    color: "black",
  },
  human: {
    number: "03",
    label: "HUMAN",
    role: "The Designer",
    title: "What does change need to feel like?",
    copy: "We bring people, behaviour, and experience into the room so the right answer can actually be used.",
    proof: ["Customers", "Behaviour", "Experience"],
    color: "orange",
  },
};

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function Header({ onMenu }: { onMenu: () => void }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="brand-lockup" href="#top" aria-label="TRYCAT home">
          <img className="brand-symbol" src={SYMBOL_ARTWORK} alt="" />
          <span className="brand-wordmark">TRYCAT<span>™</span></span>
        </a>
        <nav className="desktop-nav" aria-label="Primary navigation">
          <a href="#methodology">Methodology</a>
          <a href="#problems">Problems we solve</a>
          <a href="#work">Work</a>
          <a href="#insights">Insights</a>
          <a href="#about">About</a>
        </nav>
        <a className="header-cta" href="mailto:hello@trycat.com?subject=Book a Call with TRYCAT">
          Book a call <ArrowUpRight size={15} strokeWidth={2.2} />
        </a>
        <button className="menu-button" type="button" onClick={onMenu} aria-label="Open navigation">
          <Menu size={21} />
        </button>
      </div>
    </header>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  const links = [
    ["methodology", "Methodology"],
    ["problems", "Problems we solve"],
    ["work", "Work"],
    ["insights", "Insights"],
    ["about", "About"],
  ];
  return (
    <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      <div className="mobile-menu-top">
        <span className="eyebrow">NAVIGATION / 00</span>
        <button type="button" className="close-button" onClick={onClose} aria-label="Close navigation">
          <X size={21} />
        </button>
      </div>
      <div className="mobile-menu-links">
        {links.map(([id, label], index) => (
          <a key={id} href={`#${id}`} onClick={onClose}>
            <span>0{index + 1}</span>
            {label}
            <ArrowUpRight size={18} />
          </a>
        ))}
      </div>
      <a className="mobile-menu-cta" href="mailto:hello@trycat.com?subject=Book a Call with TRYCAT" onClick={onClose}>
        Book a call <ArrowRight size={17} />
      </a>
    </div>
  );
}

function HeroArtwork({ active, onActivate }: { active: PerspectiveKey | null; onActivate: (key: PerspectiveKey | null) => void }) {
  return (
    <div className={`artwork-stage ${active ? `is-${active}` : ""}`}>
      <div className="artwork-meta artwork-meta-top">
        <span>MASTER ARTWORK / 01</span>
        <span className="meta-live"><CircleDot size={10} /> LIVE SYSTEM</span>
      </div>
      <div className="artwork-frame">
        <img className="master-artwork" src={MASTER_ARTWORK} alt="TRYCAT three-cat logo: analyst grey, navigator black, and designer ginger" />
        <div className="artwork-grid-lines" aria-hidden="true" />
        <div className="cat-hotspots" aria-label="Explore the three TRYCAT perspectives">
          <button className="cat-hotspot cat-hotspot-business" type="button" onMouseEnter={() => onActivate("business")} onMouseLeave={() => onActivate(null)} onFocus={() => onActivate("business")} onBlur={() => onActivate(null)} onClick={() => onActivate(active === "business" ? null : "business")} aria-label="Explore Business perspective" />
          <button className="cat-hotspot cat-hotspot-system" type="button" onMouseEnter={() => onActivate("system")} onMouseLeave={() => onActivate(null)} onFocus={() => onActivate("system")} onBlur={() => onActivate(null)} onClick={() => onActivate(active === "system" ? null : "system")} aria-label="Explore System perspective" />
          <button className="cat-hotspot cat-hotspot-human" type="button" onMouseEnter={() => onActivate("human")} onMouseLeave={() => onActivate(null)} onFocus={() => onActivate("human")} onBlur={() => onActivate(null)} onClick={() => onActivate(active === "human" ? null : "human")} aria-label="Explore Human perspective" />
        </div>
        <div className="artwork-signal signal-one" aria-hidden="true" />
        <div className="artwork-signal signal-two" aria-hidden="true" />
      </div>
      <div className="artwork-meta artwork-meta-bottom">
        <span>BUSINESS / SYSTEM / HUMAN</span>
        <span>VECTOR MOTION LAYER <ScanLine size={13} /></span>
      </div>
    </div>
  );
}

function SectionRail({ number, label, dark = false }: { number: string; label: string; dark?: boolean }) {
  return (
    <div className={`section-rail ${dark ? "section-rail-dark" : ""}`}>
      <span>{number}</span>
      <i />
      <span>{label}</span>
    </div>
  );
}

function PerspectivePanel({ active, onActivate }: { active: PerspectiveKey; onActivate: (key: PerspectiveKey) => void }) {
  const data = perspectives[active];
  return (
    <div className={`perspective-panel panel-${data.color}`}>
      <div className="panel-topline">
        <span className="panel-number">{data.number}</span>
        <span>{data.role}</span>
        <span className="panel-active"><CircleDot size={10} /> ACTIVE LENS</span>
      </div>
      <div className="panel-main">
        <div>
          <p className="panel-kicker">{data.label} / PERSPECTIVE</p>
          <h3>{data.title}</h3>
        </div>
        <div className="panel-copy">
          <p>{data.copy}</p>
          <div className="proof-list">
            {data.proof.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
      </div>
      <div className="perspective-switcher" aria-label="Switch perspective">
        {(Object.keys(perspectives) as PerspectiveKey[]).map((key) => (
          <button key={key} className={active === key ? "active" : ""} type="button" onClick={() => onActivate(key)}>
            <span className={`perspective-dot dot-${perspectives[key].color}`} />
            {perspectives[key].label}
            {active === key && <Check size={14} />}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activePerspective, setActivePerspective] = useState<PerspectiveKey>("business");
  const [selectedProblem, setSelectedProblem] = useState(0);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const problemItems = [
    { label: "THE FOG", title: "You have a lot of information, but not enough clarity.", copy: "The data is everywhere. The signal is not. TRYCAT helps teams find the pattern beneath competing narratives, opinions, and urgent requests." },
    { label: "THE GAP", title: "The strategy makes sense. The system does not move.", copy: "The work between decision and delivery is where transformation gets stuck. We make the dependencies visible so movement becomes designed, not hoped for." },
    { label: "THE LOOP", title: "The same problem keeps returning in a new disguise.", copy: "Recurring problems are rarely single-point failures. We connect business conditions, human behaviour, and system mechanics to change the pattern itself." },
    { label: "THE MOMENT", title: "A consequential choice needs more than a quick answer.", copy: "When the stakes rise, speed without understanding creates expensive noise. We create the shared view that makes the next move more deliberate." },
  ];

  return (
    <div id="top" className={`site-shell ${scrollY > 32 ? "has-scrolled" : ""}`}>
      <Header onMenu={() => setMobileOpen(true)} />
      <MobileMenu open={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main>
        <section className="hero-section">
          <div className="hero-texture" aria-hidden="true" />
          <div className="hero-inner page-width">
            <div className="hero-copy">
              <div className="eyebrow hero-eyebrow"><span className="eyebrow-dot" />Business problem-solving & transformation methodology</div>
              <h1>See<br /><em>the whole.</em></h1>
              <p className="hero-lede">Understand the real problem.<br />Make the right decisions.<br />Drive meaningful transformation.</p>
              <p className="hero-description">TRYCAT helps organisations understand complex problems through <strong>Business, Human, and System</strong> perspectives — then turn insight into a clear direction.</p>
              <div className="hero-actions">
                <a className="button button-primary" href="mailto:hello@trycat.com?subject=Book a Call with TRYCAT">Book a call <ArrowUpRight size={17} /></a>
                <button className="text-link" type="button" onClick={() => scrollToId("methodology")}>Explore the methodology <ArrowRight size={16} /></button>
              </div>
              <div className="hero-footnote"><span>TRYCAT™ / 2026</span><span>THREE PERSPECTIVES. ONE CLEAR DIRECTION.</span></div>
            </div>
            <div className="hero-visual-wrap">
              <HeroArtwork active={activePerspective} onActivate={(key) => key && setActivePerspective(key)} />
              <div className="hero-visual-note"><span>01</span><span>LOOK CLOSER <ArrowDownRight size={14} /></span></div>
            </div>
          </div>
        </section>

        <section className="perspective-intro section-light">
          <div className="page-width intro-grid">
            <SectionRail number="01" label="THE LENS" />
            <div className="intro-statement"><p className="eyebrow">A better question changes the answer</p><h2>Don’t rush to the solution.<br /><span>Understand the problem first.</span></h2></div>
            <div className="intro-note"><span className="note-line" /> <p>TRYCAT is built for organisations navigating decisions where the obvious answer is rarely the whole answer.</p></div>
          </div>
        </section>

        <section id="methodology" className="methodology-section section-dark">
          <div className="method-map-bg" aria-hidden="true" />
          <div className="page-width methodology-inner">
            <SectionRail number="02" label="THE METHOD" dark />
            <div className="methodology-heading"><div><p className="eyebrow eyebrow-light">Three perspectives / One clear direction</p><h2>A problem has<br /><span>more than one shape.</span></h2></div><p className="methodology-lede">The three cats are not mascots. They are a working system for seeing what a business problem is made of — and what it will take to move.</p></div>
            <div className="methodology-system">
              <div className="system-art"><div className="system-ring ring-one" /><div className="system-ring ring-two" /><div className="system-ring ring-three" /><div className="system-crosshair"><span /><span /></div><div className="system-label system-label-business">BUSINESS</div><div className="system-label system-label-system">SYSTEM</div><div className="system-label system-label-human">HUMAN</div><div className="system-center">CLARITY<br /><span>→</span><br />DIRECTION</div></div>
              <PerspectivePanel active={activePerspective} onActivate={setActivePerspective} />
            </div>
            <div className="methodology-bottom"><span>01 / FIND THE SIGNAL</span><span>02 / MAP THE SYSTEM</span><span>03 / DESIGN THE MOVE</span><span className="methodology-arrow"><MoveRight size={18} /></span></div>
            <div className="triad-evidence"><img src={SYMBOL_ARTWORK} alt="" /><span>THE SAME THREE LENSES<br /><strong>TRAVEL THROUGH THE WORK.</strong></span><div className="triad-line" /><span className="triad-outcome">CLARITY <b>→</b> DECISION <b>→</b> TRANSFORMATION</span></div>
          </div>
        </section>

        <section id="problems" className="problems-section section-light">
          <div className="page-width problems-inner">
            <SectionRail number="03" label="THE PROBLEMS" />
            <div className="problems-heading"><p className="eyebrow">Where TRYCAT earns its place</p><h2>Useful when the<br /><span>answer is not obvious.</span></h2><p className="section-intro-copy">From a stalled transformation to a strategy that cannot travel, we work at the point where complexity needs to become a shared, usable view.</p></div>
            <div className="problem-layout">
              <div className="problem-list" role="tablist" aria-label="Problems TRYCAT helps solve">
                {problemItems.map((item, index) => <button key={item.label} className={selectedProblem === index ? "active" : ""} type="button" onClick={() => setSelectedProblem(index)} role="tab" aria-selected={selectedProblem === index}><span>{String(index + 1).padStart(2, "0")}</span><span>{item.label}</span><ArrowRight size={16} /></button>)}
              </div>
              <div className="problem-detail" role="tabpanel">
                <div className="problem-detail-top"><span className="problem-detail-index">0{selectedProblem + 1}</span><span className="problem-pulse"><CircleDot size={10} /> PATTERN DETECTED</span></div>
                <h3>{problemItems[selectedProblem].title}</h3>
                <p>{problemItems[selectedProblem].copy}</p>
                <a className="text-link" href="mailto:hello@trycat.com?subject=Explore a TRYCAT problem">Explore this problem <ArrowUpRight size={15} /></a>
              </div>
            </div>
          </div>
        </section>

        <section id="work" className="work-section section-peach">
          <div className="work-structure" aria-hidden="true"><span /><span /><span /><i /></div>
          <div className="page-width work-inner"><SectionRail number="04" label="THE WORK" /><div className="work-copy"><p className="eyebrow">Not a case study library</p><h2>Real work begins<br /><span>before the brief.</span></h2><p>TRYCAT is brought in when a team needs a different way to look: at the start of a transformation, in the middle of a strategic tension, or before a choice becomes expensive to reverse.</p><a className="button button-dark" href="mailto:hello@trycat.com?subject=Talk about TRYCAT work">Talk about the work <ArrowUpRight size={17} /></a></div><div className="work-index"><span>FIELD NOTE / 04</span><span className="work-index-line" /><span>OBSERVE → ORIENT → MOVE</span></div></div>
        </section>

        <section id="insights" className="insights-section section-light">
          <div className="page-width insights-inner"><SectionRail number="05" label="THE INSIGHTS" /><div className="insights-heading"><p className="eyebrow">A point of view, not a content machine</p><h2>Keep the thinking<br /><span>in the room.</span></h2></div><div className="insight-list"><a href="mailto:hello@trycat.com?subject=Insight: The problem before the plan" className="insight-row"><span>01 / FIELD NOTE</span><strong>The problem before the plan</strong><span>Read the note <ArrowUpRight size={15} /></span></a><a href="mailto:hello@trycat.com?subject=Insight: The cost of a narrow view" className="insight-row"><span>02 / WORKING PAPER</span><strong>The cost of a narrow view</strong><span>Read the note <ArrowUpRight size={15} /></span></a><a href="mailto:hello@trycat.com?subject=Insight: Design the decision" className="insight-row"><span>03 / OBSERVATION</span><strong>Design the decision</strong><span>Read the note <ArrowUpRight size={15} /></span></a></div></div>
        </section>

        <section id="about" className="about-section section-indigo"><div className="page-width about-inner"><SectionRail number="06" label="THE STUDIO" dark /><div className="about-copy"><p className="eyebrow eyebrow-light">Business intelligence / Design practice</p><h2>See the whole.<br /><span>Move with intent.</span></h2><p>TRYCAT is a methodology and a way of working for the moments that ask more of a team than an answer. We connect analysis, systems thinking, and human understanding to make the next move clearer.</p><a className="text-link text-link-light" href="mailto:hello@trycat.com?subject=Meet TRYCAT">Meet TRYCAT <ArrowUpRight size={16} /></a></div><div className="about-mark"><img src={SYMBOL_ARTWORK} alt="" /><span>TRYCAT™<br />SEE THE WHOLE.</span></div></div></section>

        <section className="contact-section section-light"><div className="page-width contact-inner"><div><p className="eyebrow">Start with the messy version</p><h2>Bring the problem.<br /><span>We’ll map the whole.</span></h2></div><div className="contact-action"><p>Tell us where the system feels stuck. We’ll start there — not with a pre-packaged answer.</p><a className="button button-primary" href="mailto:hello@trycat.com?subject=Book a Call with TRYCAT">Book a call <ArrowUpRight size={17} /></a></div></div></section>
      </main>

      <footer className="site-footer"><div className="page-width footer-inner"><div className="footer-top"><div className="footer-brand"><span className="footer-wordmark">TRYCAT<span>™</span></span><p>Business Problem-Solving<br />& Transformation Methodology</p></div><div className="footer-tagline">SEE THE<br /><em>WHOLE.</em></div></div><div className="footer-bottom"><span>© TRYCAT 2026</span><span>BUSINESS / HUMAN / SYSTEM</span><a href="mailto:hello@trycat.com">hello@trycat.com <ArrowUpRight size={14} /></a></div></div></footer>
      <button className="floating-cta" type="button" onClick={() => window.location.href = "mailto:hello@trycat.com?subject=Book a Call with TRYCAT"}><Plus size={17} /> <span>Book a call</span></button>
    </div>
  );
}
