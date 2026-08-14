# TRYCAT — Design Direction

## Three Initial Directions

### Theme Name: Quiet Strategy Room
Very Brief Intro: A warm, tactile editorial system that feels like a private strategy room: paper, annotations, measured diagrams, and generous negative space. It makes complex thinking feel calm, human, and considered.

Probability: 0.04

### Theme Name: Signal / Structure
Very Brief Intro: A sharper intelligence-led direction built around dark indigo, exact grid logic, and restrained orange signals. It positions TRYCAT as a business intelligence system with a design studio's eye.

Probability: 0.07

### Theme Name: Field Notes for Change
Very Brief Intro: A more expressive research-journal direction combining warm ivory, terracotta marks, and visual evidence trails. It feels exploratory without becoming playful or informal.

Probability: 0.02

## Chosen Direction: Signal / Structure

### Design Movement

TRYCAT will follow a **neo-grotesk editorial systems** movement: part Swiss information design, part business intelligence interface, part independent design studio. The page should feel authored, not templated, with the supplied three-cat artwork acting as the primary visual instrument rather than a decorative mascot.

### Core Principles

1. **See the system before acting.** Every major section should reveal relationships, tensions, or decisions rather than presenting isolated claims.
2. **Use restraint as a signal of intelligence.** Carbon, ivory, grey, ginger, and indigo are used with discipline; whitespace and line-work carry as much meaning as colour.
3. **Keep the artwork exact and the motion quiet.** The approved three-cat composition remains the source of truth for silhouette, proportion, and colour. Animation is layered around it through opacity, transform, stroke, and interface response—never through replacement illustrations.
4. **Turn complexity into a clear next move.** The visual rhythm should travel from observation to alignment to action, with “BOOK A CALL” visible early and often.

### Color Philosophy

Warm Ivory (#F5F2EA) is the working surface: a calm field for thinking, reading, and seeing relationships. Carbon Black (#0D0D0D) provides structure, navigation, and decisive contrast. Ginger Orange (#F27B13) is the human/action signal and the signature brand colour; it should appear as a precise intervention, not a wash. Analyst Grey (#979697) carries evidence, research, and business reality. Deep Indigo (#263B63) is reserved for systems, intelligence, data, and moments where the page needs to feel more infrastructural. Warm Peach (#F2C6A0) and Terracotta (#D97A43) soften transitions without turning the interface into a rainbow.

### Layout Paradigm

The page will use a **rail-and-field composition** rather than a centered marketing stack. A narrow left rail will carry section indices, perspective labels, or live state; the main field will alternate between wide editorial statements, asymmetrical split layouts, and bounded system diagrams. On mobile, the rail becomes a horizontal index and the content keeps its offset rhythm instead of collapsing into identical cards.

### Signature Elements

- **Perspective rail:** slim vertical or horizontal labels such as BUSINESS / SYSTEM / HUMAN that orient the visitor through the methodology.
- **Evidence threads:** thin animated lines, nodes, registration marks, and small monospace metadata cues that connect one idea to the next.
- **Three-cat convergence:** the supplied grey, black, and ginger cats remain visible as a living system. Hover, focus, or click activates one perspective; activating all three resolves into CLARITY → DECISION → TRANSFORMATION.

### Interaction Philosophy

Interactions should feel like inspection, not entertainment. Hovering or focusing a cat reveals its role and related evidence while keeping the silhouette stable. Cursor proximity can influence a restrained gaze marker or micro-shift, but the cats never bounce, dance, or behave like cartoon mascots. The interface should reward curiosity with context: a user explores a perspective, sees the related problem set, then follows a clear route to the methodology or call booking.

### Animation

Motion is built from small, layered changes with natural timing: a 2.4–4.8 second breathing cycle, occasional staggered blinks, low-amplitude ear or tail movement, and gentle 180–280ms hover transitions. Section entrances use opacity plus a 12–20px translate on a strong ease-out; diagrams draw in with short delays between nodes. The three-cat artwork should enter with a slight stagger that preserves its exact arrangement, then settle into an almost still state. All non-essential motion is disabled or substantially reduced under `prefers-reduced-motion`.

### Typography System

Use **Geist** for display, navigation, and labels, with **IBM Plex Mono** for small metadata, indices, and evidence cues. If Geist is unavailable, use Inter only as the fallback. Major headlines are uppercase, tightly controlled, and oversized with generous line-height; supporting paragraphs stay sentence case with a readable 1.5–1.65 line-height. Labels use compact tracking and a clear hierarchy rather than decorative treatments.

### Brand Essence

**Positioning:** TRYCAT is a business problem-solving and transformation methodology for organisations that need to understand the whole problem before making a consequential move.

**Personality:** precise, curious, composed.

### Brand Voice

Headlines should be direct, intelligent, and slightly provocative. CTAs should sound like an invitation to think with someone, not a conversion trick. Microcopy should be short, specific, and useful; avoid generic filler such as “Welcome to our website” or “Get started today.”

Example headline: “The fastest route forward is rarely the first answer.”

Example CTA line: “Bring the messy version. We’ll map the whole.”

### Wordmark & Logo

The supplied TRYCAT wordmark and three-cat composition are the source of truth and should not be redrawn. For responsive use, the system will expose the full supplied lockup, the wordmark-only treatment, and the three-cat symbol as compact marks. The generated compact symbol will be used only as a faithful, no-text responsive mark and favicon; it must preserve the original three-cat order and colours rather than becoming a new icon.

### Signature Brand Color

**Ginger Orange — #F27B13.** This is the ownable TRYCAT signal: the colour of the human perspective becoming action, used for the decisive dot, primary CTA accents, active states, and the final turn from insight to movement.

## Implementation Commitments

The first delivery will use the supplied artwork directly for the full logo lockup and will layer a responsive SVG-like interaction system around it through transforms, opacity, cursor state, and CSS motion. The page will include a sticky CTA, a methodology interaction, a problems-we-solve section, a work/insights area, an about section, a booking panel, and a responsive footer. Generated support assets will remain abstract and editorial; no stock cat illustrations will be introduced.
