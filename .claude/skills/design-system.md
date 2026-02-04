# Design System - Coucou IA

## Philosophy

**"Editorial Technique Français"** - Fusionner l'élégance éditoriale française avec une esthétique technique/analytique pour créer une identité visuelle distinctive dans l'espace SaaS.

### Design Principles

- **Clean and flat**: No gradients, solid colors only
- **Dark-first**: Deep zinc backgrounds let content shine
- **Dual accent**: Violet (primary) + Coral (secondary) for visual tension
- **Editorial typography**: Serif display font for impact, monospace as signature
- **Technical grids**: Gap-px layouts for data table aesthetic
- **Asymmetric layouts**: Bento grids and intentional imbalance
- **Data as art**: Transform stats into heroic visual elements

---

## Brand Color Palette

### Primary Colors (CSS Variables in `globals.css`)

```css
:root {
  /* Background - Deep zinc */
  --background: 9 9 11; /* #09090b */
  --foreground: 250 250 250; /* #fafafa */

  /* Cards - Elevated surfaces */
  --card: 24 24 27; /* #18181b */
  --card-foreground: 250 250 250;
  --card-hover: 39 39 42; /* #27272a */
  --popover: 24 24 27;
  --popover-foreground: 250 250 250;

  /* Primary/Accent - Violet #8B5CF6 (single accent color) */
  --primary: 139 92 246; /* #8b5cf6 - violet-500 */
  --primary-foreground: 250 250 250;

  /* Secondary - Zinc tone */
  --secondary: 39 39 42; /* #27272a */
  --secondary-foreground: 250 250 250;

  /* Muted - Zinc tones */
  --muted: 39 39 42; /* #27272a */
  --muted-foreground: 161 161 170; /* #a1a1aa - zinc-400 */

  /* Accent - Same as primary */
  --accent: 139 92 246;
  --accent-foreground: 250 250 250;
  --accent-muted: 139 92 246; /* Use with /12 opacity */

  /* Secondary Accent - Coral/Rose for editorial highlights */
  --secondary-accent: 255 77 109; /* #ff4d6d */
  --secondary-accent-foreground: 250 250 250;

  /* LLM colors - Neutralized (both gray) */
  --chatgpt: 113 113 122; /* #71717a - zinc-500 */
  --claude: 113 113 122; /* #71717a - zinc-500 */

  /* Semantic - Only for deltas */
  --success: 34 197 94; /* #22c55e - green-500 */
  --success-foreground: 250 250 250;
  --destructive: 239 68 68; /* #ef4444 - red-500 */
  --destructive-foreground: 250 250 250;
  --warning: 251 191 36; /* #fbbf24 - amber-400 */
  --warning-foreground: 9 9 11;

  /* Borders and inputs */
  --border: 39 39 42; /* #27272a */
  --input: 24 24 27; /* #18181b */
  --ring: 139 92 246; /* #8b5cf6 */
  --radius: 0.5rem; /* 8px */
}
```

### Semantic Mappings

| Semantic Token     | RGB Value   | Hex     | Usage                                    |
| ------------------ | ----------- | ------- | ---------------------------------------- |
| `primary`          | 139 92 246  | #8b5cf6 | CTAs, links, focus rings                 |
| `secondary-accent` | 255 77 109  | #ff4d6d | Editorial highlights, key stats, accents |
| `success`          | 34 197 94   | #22c55e | Positive deltas, cited states            |
| `destructive`      | 239 68 68   | #ef4444 | Negative deltas, errors                  |
| `warning`          | 251 191 36  | #fbbf24 | Warnings, caution states                 |
| `background`       | 9 9 11      | #09090b | Page background                          |
| `foreground`       | 250 250 250 | #fafafa | Primary text                             |
| `muted-foreground` | 161 161 170 | #a1a1aa | Secondary text                           |
| `card`             | 24 24 27    | #18181b | Card backgrounds                         |
| `border`           | 39 39 42    | #27272a | Default borders                          |

### Tailwind Usage

```tsx
// Primary button (solid violet)
<Button>Get Started</Button>
// → bg-primary text-primary-foreground hover:bg-primary/90

// Outline button
<Button variant="outline">Learn More</Button>
// → border border-input hover:bg-accent hover:text-accent-foreground

// Links
<a className="text-muted-foreground hover:text-primary transition-colors">

// Cards
<Card>
// → bg-card border-border

// Accent text
<span className="text-primary">

// Muted text
<span className="text-muted-foreground">
```

---

## Typography

### Fonts

| Family               | Variable         | Usage                                 | Weights       |
| -------------------- | ---------------- | ------------------------------------- | ------------- |
| **Inter**            | `--font-sans`    | Body text, UI                         | 400, 500, 600 |
| **Instrument Serif** | `--font-display` | Headlines, editorial titles (IMPACT!) | 400           |
| **JetBrains Mono**   | `--font-mono`    | Data, stats, badges, labels, code     | 400, 500, 600 |

**Typography Philosophy:**

- **Instrument Serif**: Used for massive editorial headlines (text-6xl+) to create immediate visual impact
- **JetBrains Mono**: Expanded role as signature visual identity - not just code, but stats, badges, labels
- **Inter**: Reliable workhorse for body text and UI elements

### Tailwind Classes

```tsx
<p className="font-sans">Body text with Inter</p>
<h1 className="font-display">Heading with Instrument Serif</h1>
<code className="font-mono">Code with JetBrains Mono</code>
```

### Type Scale

| Size | Class       | Usage                       |
| ---- | ----------- | --------------------------- |
| 48px | `text-5xl`  | Hero titles                 |
| 36px | `text-4xl`  | Page titles                 |
| 30px | `text-3xl`  | Section titles, stat values |
| 24px | `text-2xl`  | Card titles                 |
| 20px | `text-xl`   | Subsections                 |
| 18px | `text-lg`   | Large body                  |
| 16px | `text-base` | Body text                   |
| 14px | `text-sm`   | Secondary text, labels      |
| 12px | `text-xs`   | Captions, badges            |

---

## Component Patterns

### Buttons

```tsx
// Primary (default) - solid violet
<Button>Primary Action</Button>
// → bg-primary text-primary-foreground hover:bg-primary/90

// Outline
<Button variant="outline">Secondary</Button>
// → border border-input bg-background hover:bg-accent

// Ghost
<Button variant="ghost">Subtle</Button>
// → hover:bg-accent hover:text-accent-foreground

// Destructive
<Button variant="destructive">Delete</Button>
// → bg-destructive text-destructive-foreground hover:bg-destructive/90

// Secondary
<Button variant="secondary">Secondary</Button>
// → bg-secondary text-secondary-foreground hover:bg-secondary/80
```

### Badges

```tsx
// Default
<Badge>Default</Badge>
// → bg-primary text-primary-foreground

// Secondary
<Badge variant="secondary">Secondary</Badge>
// → bg-secondary text-secondary-foreground

// Outline
<Badge variant="outline">Outline</Badge>
// → border text-foreground

// Destructive
<Badge variant="destructive">Error</Badge>
// → bg-destructive text-destructive-foreground
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
// → rounded-lg border bg-card text-card-foreground
```

### Inputs

```tsx
<Input placeholder="Email" />
// → bg-input border-border rounded-md focus-visible:ring-ring
```

### Stat Card

```tsx
<Card>
  <CardContent className="p-6">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Label</p>
        <p className="text-3xl font-bold tracking-tight tabular-nums">42%</p>
      </div>
      <div className="rounded-xl bg-primary/10 p-3">
        <Icon className="size-6 text-primary" />
      </div>
    </div>
  </CardContent>
</Card>
```

### Citation Status

```tsx
// Cited (positive)
<span className="text-success">Cité #1</span>

// Absent (negative)
<span className="text-destructive">Absent</span>

// Delta positive
<span className="text-success">+5</span>

// Delta negative
<span className="text-destructive">-3</span>
```

### Progress Bars

```tsx
// Solid color, no gradient
<div className="h-2 rounded-full bg-muted overflow-hidden">
  <div className="h-full rounded-full bg-primary" style={{ width: '75%' }} />
</div>
```

---

## Spacing

| Scale | Value | Usage           |
| ----- | ----- | --------------- |
| `1`   | 4px   | Tight spacing   |
| `2`   | 8px   | Element gaps    |
| `3`   | 12px  | Small padding   |
| `4`   | 16px  | Default padding |
| `6`   | 24px  | Section padding |
| `8`   | 32px  | Large gaps      |
| `12`  | 48px  | Section margins |
| `16`  | 64px  | Page sections   |

---

## Border Radius

| Token          | Value  | Usage          |
| -------------- | ------ | -------------- |
| `--radius`     | 0.5rem | Base radius    |
| `rounded-md`   | 6px    | Inputs         |
| `rounded-lg`   | 8px    | Cards, modals  |
| `rounded-xl`   | 12px   | Large cards    |
| `rounded-full` | 9999px | Pills, avatars |

---

## Animations

```css
/* Custom animations in globals.css */
@keyframes wave { ... }
@keyframes count-up { ... }
@keyframes glow-pulse { ... }

.animate-wave       /* 0.5s ease-in-out */
.animate-count-up   /* 0.5s ease-out */
.animate-glow-pulse /* 2s infinite */
```

### Transitions

```tsx
transition - colors; // Color changes
transition - all; // All properties
duration - 200; // Fast (200ms)
duration - 300; // Normal (300ms)
duration - 500; // Slow (500ms)
```

---

## Dark Mode

This design system is **dark-mode only**. The color scheme meta tag is set:

```tsx
<meta name="color-scheme" content="dark" />
<meta name="theme-color" content="#080a12" />
```

---

## Accessibility

### Color Contrast

- Primary text (`foreground`) on background: >7:1
- Secondary text (`muted-foreground`) on background: >4.5:1
- Interactive elements have clear focus states

### Focus States

```css
:focus-visible {
  @apply outline-none ring-2 ring-primary/50 ring-offset-2 ring-offset-background;
}
```

### Reduced Motion

Respect `prefers-reduced-motion` for animations.

---

## Key Rules

1. **No gradients**: Use solid colors only for buttons, backgrounds, and progress bars
2. **Single accent**: Violet (`primary`) for all interactive elements
3. **Text colors**: Use `text-foreground` for primary, `text-muted-foreground` for secondary
4. **Semantic colors**: `success`/`destructive` only for deltas and status indicators
5. **CTAs**: Use `bg-primary text-primary-foreground`
6. **Links**: Use `text-muted-foreground hover:text-primary`
7. **Cards**: Use `bg-card border-border`
8. **Transitions**: Always `duration-200` or `duration-300`
9. **Borders**: Use `border-border` for default, `border-primary/20` for emphasis
10. **Spacing**: Generous - sections get `py-20`, cards get `p-6`
11. **Focus rings**: Use `ring-primary/50`
12. **Icons**: Always add `aria-hidden="true"` to decorative icons
13. **Numbers**: Use `tabular-nums` for data alignment
