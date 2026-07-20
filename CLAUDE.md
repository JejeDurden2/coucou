# Coucou IA: Working Contract

## Overview
Coucou IA is an AI consulting company for the French market (PME de 10 à 250 salariés and ETI). Two offers: **Audit & stratégie IA** (états des lieux, cartographie d'opportunités, business cases ROI, roadmaps) and **Développement IA sur mesure** (agents IA, RAG, automatisations, intégrations). Differentiator: **ouvrir le champ des possibles**: we show non-expert dirigeants what AI makes possible in their business and where to start, sans jargon, then ship it to production. ROI survives as method (business case chiffré avant d'engager, résultats mesurés), never as a guarantee: the word "garanti" is banned from all copy. The word "diagnostic" is banned too (medical connotation): the discovery call is called **"le point de départ"** (fallback noun in prose: **"ce premier échange"**). The site has one job: build credibility (dark enterprise-tech) and convert visitors into **booked "point de départ" calls**. Pricing is never published. 100% French, `vous`, no i18n.

## Stack (locked)
- Next.js 16+ (App Router), React 19, TypeScript `strict`
- Tailwind CSS v4 (`@theme` in `app/globals.css`, no `tailwind.config`) + shadcn/ui
- pnpm, deployed on Vercel
- Fonts via `next/font` (self-hosted, never `<link>` to Google)

## Commands
```bash
pnpm dev          # local dev
pnpm build        # production build
pnpm lint         # eslint
pnpm typecheck    # tsc --noEmit
```
Run `pnpm typecheck && pnpm lint` before declaring any task done.

## Architecture
- `app/`: App Router routes, `layout.tsx`, `page.tsx`, route groups. Server Components by default.
- `components/ui/`: shadcn primitives. **Never hand-edit for one-off styling.** Extend via composition or a new `cva` variant; theming comes from tokens only.
- `components/sections/`: page sections (`hero.tsx`, `services.tsx`, `method.tsx`, `proof.tsx`, `cta.tsx`). One section is one file.
- `components/`: shared composed components (`site-header.tsx`, `site-footer.tsx`, `metric-block.tsx`).
- `lib/`: `utils.ts` (`cn`), `metadata.ts`, helpers.
- `content/`: all French copy as typed TS modules (`services.ts`, `proof.ts`). Copy is data, not JSX literals scattered across components. Single source, reused.
- **Server Components by default.** Add `"use client"` only at the interactive leaf (a button with state, a scroll-reveal wrapper), never on a section or layout.
- Interactive/motion components are isolated leaves. Static sections render on the server.

## Code conventions
- TypeScript `strict`. No `any`: type the content models.
- **Named exports only.** Exception: Next.js files that require default export (`page`, `layout`, `route`, `error`, `loading`, `not-found`).
- **No barrel files** (`index.ts` re-exports). Import from the source path.
- Files kebab-case (`metric-block.tsx`); components PascalCase; hooks `use-*.ts`.
- Compose classes with `cn()`. Layout in `className`; color/typography come from tokens/variants, never overrides.
- Icons: one library, `data-icon` inside `Button`, no sizing classes on icons in components. No hand-rolled SVG icons.
- No new dependency for what a few lines do. Check `package.json` before importing.

## Design system
Full spec: **`docs/design-system.md`**. Tokens live in `app/globals.css` (`@theme`). Non-negotiables:
1. **Tokens only.** No arbitrary hex/rgb in components (`bg-[#2fb6ff]` banned). Use `bg-primary`, `text-muted-foreground`, etc.
2. **Dark-first, one theme.** The whole site is dark. No section inverts to light.
3. **Accent discipline.** ONE interactive accent (electric blue) on the whole page: CTAs, key metrics, focus rings, one signature motif. The violet `--accent-2` is atmosphere only (hero ambient glow, flow-field particles): never on actions, metrics, or body text. Never a third accent.
4. **No glow soup.** Glow allowed only as one ambient hero radial plus the primary CTA hover. No glow on every card, no purple/blue mesh gradients, no gradient text.
5. **One radius scale** (8px family) everywhere; pill only for badges/tags.
6. **Metrics are the hero.** ROI numbers use the metric-block spec (tabular-nums), never body-text-styled.
7. **Motion is motivated and reduced-motion safe.** No infinite loops, no animated logo, no count-up except one hero stat.

## Content & voice
- French only, `vous`. No i18n routing.
- **No em-dashes, ever.** All site copy is French and must never use em-dashes or en-dashes as sentence punctuation. Use French punctuation instead: deux-points (:), virgule, parenthèses, or restructure the sentence. Applies to copy, headings, buttons, alt text, and metadata.
- **Voice:** confident, direct, avec un clin d'œil. The name "Coucou" is an asset: playful but never unserious; expert without jargon-dumping. Short sentences. Address the reader's problem, then the outcome.
- **ROI claims must be concrete and measurable:** `-40 % de temps de traitement`, `3 j/semaine récupérés`, not `gagnez du temps` or `boostez votre productivité`. Every claim is either real, labeled as example, or cut.
- Pricing **never** on the site.
- **One CTA label, everywhere:** `Trouver mon point de départ` (nav, hero, footer, sections). No synonyms ("Contactez-nous", "Prendre RDV" are banned).

## Writing rules (Orwell)
These six rules govern **both** the French site copy **and** every word Claude Code writes back to the user (messages, commit copy, PR text, comments). Apply them by default; break one only under rule 6.
1. **No stale figures of speech.** Never use a metaphor, simile ou image que vous avez l'habitude de voir imprimée. Cliché AI-speak ("libérez tout le potentiel", "révolutionnez", "boostez") is banned by this rule, not just by voice.
2. **Short word over long.** Never use a long word where a short one does the job. `utiliser` over `mettre en œuvre` when they mean the same thing.
3. **Cut every word you can.** If a word can be removed without loss, remove it. First draft, then delete.
4. **Active over passive.** Prefer the active voice. "Nous chiffrons le business case" over "le business case est chiffré".
5. **No jargon.** Never use a foreign phrase, an anglicism, a scientific or jargon word when an everyday French equivalent exists. This is the copy side of "sans jargon": keep tech terms (RAG, agents IA) only when they are the plainest name for the thing.
6. **Never barbarous.** Break any of these five rules sooner than write something clearly ugly or unclear. Clarity wins over the rule.

## Never do
- Publish pricing, or invent client names/logos/testimonials as if real (label mock data).
- Add a second accent color, gradient text, glassmorphism, or purple/AI-cliché gradients.
- Hand-edit `components/ui/` primitives for styling, or bypass tokens with arbitrary values.
- Put `"use client"` on a layout, page, or whole section.
- Ship English copy, `tu`, unquantified ROI claims, a duplicate CTA label, or any em-dash.
- Skip `prefers-reduced-motion`, keyboard focus, or mobile collapse.
