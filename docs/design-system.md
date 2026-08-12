# Coucou IA: Design System

The build implements this spec exactly. Values are the source of truth; components derive from tokens, never from ad-hoc styling.

## 1. Brand personality
Light enterprise-tech that **means business**: near-white surfaces, dark ink typography, a single deep electric-blue signal used with discipline. The reference points are Linear (light), Stripe, Notion: restraint, clarity, engineering credibility. The switch from dark to light is a conversion decision: the audience is dirigeants de PME/ETI, not developers, and a bright, open page reads as trustworthy and legible where near-black read as "tech demo". The wink lives in the name "Coucou" and in one or two precise, confident details, never in decoration. Serious expertise, human edge. Every pixel says *measured, shipped, profitable*, not *AI demo*.

---

## 2. Color system

Light-first. Defined in OKLCH in `app/globals.css` under `:root` (the site's only theme) and mirrored in `@theme inline` as `--color-*`. All ratios below verified against `--background`.

### Accent choice: deep electric blue `#0074c1` / `oklch(0.54 0.155 245)`
Direction: **ink and one blue signal** on a near-white, faintly cool page. Blue reads as engineering credibility and is dark enough to carry both as a button fill (with near-white text) and as link/metric text at AA contrast. `--primary` is the ONE accent on the site: CTA, key metric, focus ring, active marks, and the three sanctioned ambient glows (§5) at low alpha.

**The violet is retired.** The dark theme kept a second "atmosphere" violet (`--accent-2`); on a light ground a violet wash turns pastel and lands squarely in the AI-startup cliché this brand bans. All ambient light now derives from `--primary`. No second accent exists, atmospheric or otherwise.

### Tokens

| Token | OKLCH | Hex | Role |
|---|---|---|---|
| `--background` | `0.985 0.002 260` | `#f9fafb` | Page (near-white, faint cool cast) |
| `--card` | `1 0 0` | `#ffffff` | Card / raised surface (white above the grey page) |
| `--popover` / elevated | `1 0 0` | `#ffffff` | Popover, dropdown, tooltip |
| `--muted` | `0.955 0.004 260` | `#eef0f3` | Muted fills, code, inactive |
| `--foreground` | `0.210 0.015 260` | `#14181f` | Primary text (near-black ink, cool cast) |
| `--muted-foreground` | `0.480 0.015 260` | `#595e66` | Secondary text, labels, lede |
| `--foreground-dim` | `0.580 0.015 260` | `#757b83` | Tertiary: captions, meta (large/non-essential only) |
| `--border` | `0.900 0.006 260` | `#dcdee2` | Hairline separators, card edges |
| `--input` | `0.850 0.008 260` | `#cbced3` | Input borders |
| `--primary` | `0.540 0.155 245` | `#0074c1` | Accent: CTA, key metric, focus ring |
| `--primary-foreground` | `0.985 0.002 260` | `#f9fafb` | Text/icon on blue fills |
| `--accent` | `0.955 0.012 240` | `#e9f1f8` | Subtle blue-tinted hover surface |
| `--accent-foreground` | `0.210 0.015 260` | `#14181f` | Text on `--accent` |
| `--secondary` | `0.965 0.004 260` | `#f2f3f6` | Secondary button surface |
| `--ring` | `0.540 0.155 245` | `#0074c1` | Focus ring = primary |
| `--success` | `0.520 0.140 158` | `#008048` | Positive delta, confirmed state |
| `--warning` | `0.550 0.120 75` | `#9a6500` | Caution |
| `--destructive` | `0.550 0.190 25` | `#c92f33` | Error / form validation |

`--success` sits at hue 158 (green) so it never reads as the blue accent (hue 245); use it only for functional state (deltas, form success), never as a second brand color.

### Contrast (WCAG, verified vs `--background`)
| Pair | Ratio | Grade |
|---|---|---|
| `foreground` / background | 16.97:1 | AAA |
| `muted-foreground` / background | 6.26:1 | AA (AAA for large text) |
| `foreground-dim` / background | 4.10:1 | AA large (large / non-essential text only) |
| `primary` (blue) text / background | 4.73:1 | AA |
| `primary-foreground` / `primary` (button) | 4.73:1 | AA |
| `success` / background | 4.82:1 | AA |
| `warning` / background | 4.74:1 | AA |
| `destructive` / background | 5.12:1 | AA |
| `ring` (blue) / background | 4.73:1 | AA (non-text, ≥3:1 req.) |

On `--card` (pure white) every ratio above is equal or slightly higher, so tokens are safe on both surfaces. `--border` is a decorative hairline (1.29:1), not a text or control-state color, so no 3:1 requirement; perceivable boundaries come from surface contrast, shadows and the focus ring.

Verification script: OKLCH → sRGB → WCAG relative luminance. Re-run it whenever a token moves; the table above is generated, not estimated.

---

## 3. Typography

Self-hosted via `next/font`. Three roles, all free:

- **Display: Space Grotesk** (headlines, hero, big metrics). A grotesque with techy DNA (derived from Space Mono) and just enough character to carry the wink, without the neutrality of Inter/Geist. Weights 500 & 700.
- **Body / UI: Geist Sans**. Vercel's workhorse: neutral, precise, excellent at small sizes and dense UI. The credibility face. Weights 400, 500, 600.
- **Data / labels: Geist Mono**. ROI figures (`tabular-nums`), eyebrows, code, metric labels. Shares geometry with the other two.

CSS vars: `--font-display`, `--font-sans`, `--font-mono`.

### Type scale (rem @ 16px base)
| Role | Size (mobile to desktop) | Line-height | Tracking | Font / weight |
|---|---|---|---|---|
| Display / H1 (hero) | 3rem to 4.5rem (48/72) | 1.02 | -0.03em | Space Grotesk 700 |
| H2 (section) | 2rem to 2.75rem (32/44) | 1.08 | -0.02em | Space Grotesk 700 |
| H3 | 1.5rem (24) | 1.2 | -0.01em | Space Grotesk 500 |
| H4 | 1.25rem (20) | 1.3 | -0.01em | Geist Sans 600 |
| Lede | 1.125rem to 1.25rem (18/20) | 1.6 | 0 | Geist Sans 400, `muted-foreground` |
| Body | 1rem (16) | 1.6 | 0 | Geist Sans 400, max `65ch` |
| Small | 0.875rem (14) | 1.5 | 0 | Geist Sans 400/500 |
| Label / eyebrow | 0.75rem (12) | 1.4 | +0.12em, uppercase | Geist Mono 500, `muted-foreground` |
| Metric (stat) | 2.5rem to 4rem (40/64) | 1.0 | -0.02em | Space Grotesk 700, `tabular-nums` |

Rules: headlines `text-balance`; body/lede `text-pretty`, capped `max-w-[65ch]`. Numbers always `tabular-nums`. Emphasis inside a headline uses bold/italic of the **same** family, never a swapped font.

---

## 4. Spacing, radius, borders, elevation

- **Spacing:** 4px base scale (Tailwind default: `2, 3, 4, 6, 8, 12, 16, 20, 24, 32`). Component internals use `gap-*`, never `space-y/x-*`.
- **Radius:** committed **8px family**. `--radius: 0.5rem`. Buttons, cards, inputs, popovers all `rounded-lg`/`rounded-md` off that base. **Exception (the one documented rule):** badges/tags/pills are `rounded-full`. No other mixing. Not sharp-zero (too brutalist), not big-rounded (too consumer); tight and precise says "engineering".
- **Borders:** 1px, `--border`. Hairlines carry structure; prefer `border` / `border-t` and negative space over shadows for grouping. Inputs use `--input` (slightly darker) so the field is perceivable.
- **Shadows / elevation:** on light, elevation comes from **white surface + hairline + soft low-alpha shadow**, in that order of importance. `--card` (white) already lifts off the grey page; when a shadow is needed (popover, dropdown, floating card) it is soft, blurred and faint: black at **5-10% alpha** (e.g. `0 8px 24px rgb(0 0 0 / 0.08)`), always paired with a 1px border. Never a hard or dark shadow; anything above ~15% alpha reads as a smudge on white.

---

## 5. Signature visual motifs

Two motifs, cleanly split by role: the hero owns one large moving signature; every other section only ever gets the quiet, static "tracé" grid.

**(a) "La carte des possibles": the hero centerpiece.** A full-viewport ambient flow-field particle canvas (fine grey trailing strokes, ~10% of particles blue, trails fading, masked out toward the bottom of the viewport) runs behind the hero copy, with one blue radial glow top-right (the largest ambient light on the page) and four thin corner frame marks. On the right, a map-like SVG fans faint rays from a blue origin point out to small dots and six arrowed rays, each pointing to a use-case card. Every 2.6s, one ray and its card light up in blue, the single moving blue signal on the page, then hand off to the next ray/card. This is the one place the brand allows sustained, looping motion (see §6); nowhere else on the site moves like this.

**(b) "Le tracé": a faint measurement grid, for proof and guarantee sections only.** ROI is measurement; the motif is a plotting grid (`.trace-grid` in `app/globals.css`). It does **not** appear in the hero, which uses the flow-field/carte motif above instead.

- **Grid field:** a very low-contrast square grid (`--input` at ~50% via a `background-image` linear-gradient), used behind the guarantee/proof section and the pSEO spoke pages (secteurs, cas d'usage) only. It mixes from `--input`, not `--border`: a border-tinted line at partial alpha drops below perception on the near-white page. Fades out with a radial mask so it never fills the whole viewport. Never on every section.
- **The blue signal:** accent used as precise marks: a 2px blue underline/tick under a key metric, a thin blue left-border on a quoted result, the active nav indicator, the focus ring. Small, surgical, high-signal.
- **Metric / ROI display:** the brand's centerpiece for proof sections. Big `Space Grotesk` `tabular-nums` figure (`--foreground`), a Geist Mono uppercase label above in `muted-foreground`, and an optional delta badge (`success` + `▲`). See §7.

**Ambient glow (blue, `--primary`):** a **closed list of three** page-level ambient glows, all built from the one `.trace-glow` radial (`--primary` at **10%** alpha, blur-heavy, then sized/placed/dimmed per use via `className` + `opacity`), and nothing else:
1. **Hero, top-right** (`opacity` up to 100%, the largest): the page's opening light.
2. **Final CTA, bottom-left, overflowing the viewport** (`opacity` ~40-50%, below the hero): the page closes on the light it opened with (a "bookend"). Decentred, bright core off-screen, never a centred halo, never directly under a running paragraph.
3. **Services diptych hinge, behind the desktop FoldMark** (`opacity` ~40%, `overflow-hidden`-clipped to the ~72px fold channel, desktop only): a thin vertical bloom, as if the fold concentrated the light.

No fourth ambient glow, ever; nothing else on the page gets one. The 10% alpha is deliberate: the dark theme ran 20%, but a saturated wash on white turns pastel fast. Separate from this list, two motivated **functional** blue accents stay allowed: the active carte card/ray's outline glow during its 2.6s highlight, and the soft blue shadow behind the primary CTA on hover.

**Gradients/glows must NOT:** tint text (no gradient or accent-tinted text), stack multiple colored glows, appear on cards/buttons by default, or become a multi-color mesh background. If in doubt, remove it.

---

## 6. Motion

Principles: motion communicates hierarchy, sequence, or feedback, never decoration. Subtle and fast; the site should feel instant and precise.

- **Durations:** micro (hover, press) 120-160ms; entrances/reveals 240-320ms.
- **Easing:** entrances `cubic-bezier(0.16, 1, 0.3, 1)` (ease-out-expo); hover/press `ease-out`.
- **What animates:** hero entrance (short opacity+`y` stagger), section scroll-reveal (`whileInView`, `once: true`, `y: 16` to `0`), CTA hover (`-translate-y-px` plus subtle blue shadow), nav background blur-in on scroll.
- **The one sanctioned loop:** the hero's ambient flow-field canvas and its 2.6s "carte des possibles" ray/card cycle run continuously. This is the single, deliberate exception to the no-infinite-loop rule below, allowed because it reads as low-contrast, slow ambient signal (one moving element at a time) rather than decoration.
- **What never animates:** the logo/wordmark, body text, metric numbers, anything on an infinite loop outside the hero exception above. No marquees. No parallax.
- **`prefers-reduced-motion`:** disable all transforms and scroll-reveals; render final state. The hero canvas falls back to one static pre-rendered frame (no particle motion) and the carte shows a static state with the first ray/card lit, no cycling. Use Motion's `useReducedMotion`.
- Continuous values (scroll, pointer) use Motion values, never `useState`.

---

## 7. Component specs

**Button** (shadcn `Button`, extend via `cva` variants, don't hand-style):
- `primary` (default): `bg-primary text-primary-foreground`, `rounded-lg`, `font-medium`. Hover `-translate-y-px` plus soft blue shadow; active `scale-[0.98]`. The `Trouver mon point de départ` CTA.
- `secondary`: `bg-secondary text-foreground border border-border`, hover `bg-accent`.
- `ghost`: transparent, hover `bg-accent`.
- `link`: blue text, underline on hover.
- Sizes: `sm` (h-9), `default` (h-10), `lg` (h-12, hero CTA). Icons via `data-icon`. Label ≤ 3 words, one line. Focus-visible: 2px blue ring plus 2px offset.

**Card:** `bg-card border border-border rounded-lg p-6`. Full composition (`CardHeader/Title/Description/Content/Footer`). Use cards only where elevation means hierarchy (service offers, proof); otherwise group with `border-t` plus spacing. Optional hover: `border` darkens to `--input`; no lift, no glow.

**Nav / Header:** sticky, height 64px (max 80px), single line at `lg`. Transparent over hero, then on scroll `bg-background/80 backdrop-blur border-b border-border`. Left: wordmark. Center/right: 3 or 4 links (Services, Méthode, Résultats). Far right: secondary CTA (the hero CTA is the only primary button above the fold). Mobile: Sheet drawer, hamburger; le CTA vit dans le drawer (un CTA pleine largeur en bas de la nav), le header ne garde que la marque et le burger.

**Footer:** `border-t border-border`, `bg-background`, `py-16`. Columns: wordmark plus one-line positioning; nav links; legal (Mentions légales, Confidentialité); the CTA repeated once. Muted text, hairline dividers. No newsletter unless briefed.

**Section rhythm:** container `max-w-[1200px] mx-auto px-6`. Vertical padding `py-20` (mobile) to `py-28`/`py-32` (desktop), consistent across sections. Each section: one focused message, optional single eyebrow (max 1 per 3 sections total), H2, ≤ 25-word sub, then content. No two sections share the same layout family; max 2 consecutive image+text splits.

**Metric / stat block:** vertical stack. Geist Mono uppercase label (`muted-foreground`, 12px), then big Space Grotesk `tabular-nums` figure, then optional `success` delta badge with `▲`. In a `grid grid-cols-1 sm:grid-cols-3 gap-8`, separated by negative space or hairlines, never boxed cards. This is where the brand's ROI proof lives, so give it room.

**Testimonials:** quote ≤ 3 lines, real typographic quotes or none, thin blue left-border. Attribution always name + role + company. No em-dashes as flourish. Max one per row on mobile, 2 or 3 grid on desktop.

**Logo wall ("Ils nous font confiance"):** real SVG marks (Simple Icons or supplied), single-color to render on light (`foreground`/`muted-foreground`), even sizing, `grid`/marquee-free row. Logos only, no category labels underneath. **If clients are placeholders, label the section mock and use generated monograms, never fake real company names as real.**

---

## 8. Accessibility

- Contrast: all body/UI text ≥ 4.5:1 (see §2); `foreground-dim` restricted to large/non-essential text.
- **Focus-visible:** 2px `--ring` (blue) outline plus 2px offset on every interactive element. Never remove outlines without a visible replacement. Blue ring gives ≥4.7:1 on light (non-text minimum is 3:1).
- **Targets:** interactive elements ≥ 44×44px (buttons min `h-10`; pad small icon buttons to `size-11`).
- Every section collapses to one column < 768px, declared per component. Hero fits the initial viewport (headline ≤ 2 lines, sub ≤ 20 words, CTA visible without scroll).
- Semantic HTML; images have alt; the hero flow-field canvas, the carte des possibles cycle, and scroll-reveals all respect reduced motion.

---

## 9. Do / Don't (kill the AI-startup template)

**Do**
- Near-white plus neutral greys plus one disciplined deep-blue signal. Let 90% of the page be quiet.
- Lead with ROI: real, measurable numbers in metric blocks.
- Tight 8px radius, hairline borders, precise type, generous whitespace.
- The three sanctioned ambient blue glows at 10% and no more (hero top-right, final CTA bottom-left, services hinge), one tracé grid field on proof/spoke pages, surgical blue accents.
- Shadows faint (≤10% black alpha), always with a hairline border.

**Don't**
- Reintroduce the violet, anywhere: the dark theme's atmosphere accent is retired. One blue, period.
- Gradient or accent-tinted text; rainbow mesh backgrounds; stacked colored glows; pastel washes.
- Glassmorphism soup: no frosted blur on every card.
- A second accent color, or blue creeping onto body copy.
- Dark or hard shadows (>15% alpha reads as a smudge on white); no dark sections inverting the theme.
- Three identical feature cards; centered-hero-over-mesh default; an eyebrow above every section.
- Fake-precise invented specs, div-based fake screenshots, count-ups everywhere, infinite marquees.
- Any arbitrary hex in a component; tokens only.
