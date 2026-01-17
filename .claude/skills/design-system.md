# Design System - Coucou IA

## Philosophy

**Clean, modern, and professional** - A dark-mode SaaS aesthetic for AI visibility tracking. Minimal, flat design with solid colors.

### Design Principles

- **Clean and flat**: No gradients, solid colors only
- **Dark-first**: Deep space backgrounds let content shine
- **Subtle accents**: Cyan for primary actions, violet for secondary
- **Smooth motion**: Simple transitions that feel premium

---

## Brand Color Palette

### Primary Colors (CSS Variables in `globals.css`)

```css
:root {
  /* Coucou IA Brand Colors */
  --background: 8 10 18;           /* #080a12 - deep space black */
  --foreground: 237 242 247;       /* #edf2f7 - primary text */
  --card: 15 20 35;                /* #0f1423 - card backgrounds */
  --card-foreground: 237 242 247;  /* #edf2f7 - card text */

  --primary: 6 182 212;            /* #06b6d4 - cyan-500, CTAs */
  --primary-foreground: 8 10 18;   /* #080a12 - text on primary */
  --secondary: 139 92 246;         /* #8b5cf6 - violet-500, accents */
  --secondary-foreground: 237 242 247;

  --success: 34 197 94;            /* #22c55e - emerald-500 */
  --destructive: 244 63 94;        /* #f43f5e - rose-500 */

  --muted: 30 40 60;               /* #1e283c - muted backgrounds */
  --muted-foreground: 148 163 184; /* #94a3b8 - slate-400, secondary text */

  --border: 30 40 60;              /* #1e283c - default borders */
  --input: 20 30 50;               /* #141e32 - input backgrounds */
  --ring: 6 182 212;               /* #06b6d4 - focus rings */
  --accent: 30 40 60;              /* #1e283c - accent backgrounds */
}
```

### Semantic Mappings

| Semantic Token       | RGB Value       | Hex       | Usage                    |
| -------------------- | --------------- | --------- | ------------------------ |
| `primary`            | 6 182 212       | #06b6d4   | CTAs, links, focus rings |
| `secondary`          | 139 92 246      | #8b5cf6   | Accents, badges          |
| `success`            | 34 197 94       | #22c55e   | Cited states             |
| `destructive`        | 244 63 94       | #f43f5e   | Absent states, errors    |
| `background`         | 8 10 18         | #080a12   | Page background          |
| `foreground`         | 237 242 247     | #edf2f7   | Primary text             |
| `muted-foreground`   | 148 163 184     | #94a3b8   | Secondary text           |

### Tailwind Usage

```tsx
// Primary button (solid cyan)
<Button>Get Started</Button>
// → bg-cyan-500 text-slate-900 hover:bg-cyan-400

// Outline button
<Button variant="outline">Learn More</Button>
// → border border-cyan-500/30 hover:bg-cyan-500/10

// Links
<a className="text-muted-foreground hover:text-cyan-400 transition-colors">

// Cards
<Card>
// → bg-card/80 backdrop-blur-sm border-cyan-500/10

// Accent text
<span className="text-cyan-400">
<span className="text-violet-400">

// Brand text (no gradients)
<h1 className="text-cyan-400">
```

---

## Typography

### Fonts

| Family              | Variable         | Usage                  | Weights         |
| ------------------- | ---------------- | ---------------------- | --------------- |
| **Inter**           | `--font-sans`    | Body text, UI          | 400, 500, 600, 700 |
| **Space Grotesk**   | `--font-display` | Headings, titles       | 400, 500, 600, 700 |
| **JetBrains Mono**  | `--font-mono`    | Code, data, technical  | 400, 500, 600 |

### Tailwind Classes

```tsx
<p className="font-sans">Body text with Inter</p>
<h1 className="font-display">Heading with Space Grotesk</h1>
<code className="font-mono">Code with JetBrains Mono</code>
```

### Type Scale

| Size  | Class      | Usage              |
| ----- | ---------- | ------------------ |
| 48px  | `text-5xl` | Hero titles        |
| 36px  | `text-4xl` | Page titles        |
| 30px  | `text-3xl` | Section titles, stat values |
| 24px  | `text-2xl` | Card titles        |
| 20px  | `text-xl`  | Subsections        |
| 18px  | `text-lg`  | Large body         |
| 16px  | `text-base`| Body text          |
| 14px  | `text-sm`  | Secondary text, labels |
| 12px  | `text-xs`  | Captions, badges   |

---

## Glass Effects

### Card Glass

```tsx
<Card>
// → rounded-xl border border-cyan-500/10 bg-[rgb(15_20_35/0.8)] backdrop-blur-sm
```

### Navigation Glass

```tsx
<header className="bg-background/80 backdrop-blur-xl border-b border-cyan-500/10">
```

### Section Background

```tsx
<section className="bg-[rgb(12_15_25)]">
```

---

## Component Patterns

### Buttons

```tsx
// Primary (default) - solid color, no gradient
<Button>Primary Action</Button>
// → bg-cyan-500 text-slate-900 hover:bg-cyan-400 font-semibold

// Outline
<Button variant="outline">Secondary</Button>
// → border border-cyan-500/30 bg-transparent hover:bg-cyan-500/10

// Ghost
<Button variant="ghost">Subtle</Button>
// → hover:bg-cyan-500/10 hover:text-cyan-400

// Destructive
<Button variant="destructive">Delete</Button>
// → bg-rose-500 text-white hover:bg-rose-600

// Secondary
<Button variant="secondary">Secondary</Button>
// → bg-violet-500 text-white hover:bg-violet-400
```

### Badges

```tsx
// Default (cyan)
<Badge>Default</Badge>
// → bg-cyan-500/20 text-cyan-400 border border-cyan-500/30

// Secondary (violet)
<Badge variant="secondary">Secondary</Badge>
// → bg-violet-500/20 text-violet-400 border border-violet-500/30

// Success (emerald)
<Badge variant="success">Cité #1</Badge>
// → bg-emerald-500/20 text-emerald-400 border border-emerald-500/30

// Destructive (rose)
<Badge variant="destructive">Absent</Badge>
// → bg-rose-500/20 text-rose-400 border border-rose-500/30
```

### Cards

```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>
// → rounded-xl border-cyan-500/10 bg-card/80 backdrop-blur-sm hover:border-cyan-500/20
```

### Inputs

```tsx
<Input placeholder="Email" />
// → bg-input border-border rounded-lg focus:ring-2 focus:ring-cyan-500/50
```

### Stat Card

```tsx
<Card>
  <CardContent className="p-6">
    <div className="flex items-start justify-between">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Label</p>
        <p className="text-3xl font-bold tracking-tight">42%</p>
      </div>
      <div className="rounded-xl bg-cyan-500/10 p-3 border border-cyan-500/20">
        <Icon className="h-6 w-6 text-cyan-400" />
      </div>
    </div>
  </CardContent>
</Card>
```

### Citation Badge

```tsx
// Cited
<Badge variant="success" className="gap-1">
  <Check className="h-3 w-3" aria-hidden="true" />
  <span>Cité #1</span>
</Badge>

// Absent
<Badge variant="destructive" className="gap-1">
  <X className="h-3 w-3" aria-hidden="true" />
  <span>Absent</span>
</Badge>
```

### Progress Bars

```tsx
// Solid color, no gradient
<div className="h-2 rounded-full bg-muted overflow-hidden">
  <div className="h-full rounded-full bg-cyan-500" style={{ width: '75%' }} />
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

| Token         | Value   | Usage           |
| ------------- | ------- | --------------- |
| `--radius`    | 12px    | Base radius     |
| `rounded-lg`  | 12px    | Cards, modals   |
| `rounded-xl`  | 16px    | Large cards     |
| `rounded-full`| 9999px  | Pills, avatars  |

---

## Animations

```typescript
animation: {
  'fade-in': 'fadeIn 0.5s ease-out',
  'slide-up': 'slideUp 0.5s ease-out',
  'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
}
```

### Transitions

```tsx
transition-colors   // Color changes
transition-all      // All properties
duration-200        // Fast (200ms)
duration-300        // Normal (300ms)
duration-500        // Slow (500ms)
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
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-cyan-500/50
focus-visible:ring-offset-2
focus-visible:ring-offset-background
```

### Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Key Rules

1. **No gradients**: Use solid colors only for buttons, backgrounds, and progress bars
2. **Text colors**: Use `text-foreground` for primary, `text-muted-foreground` for secondary
3. **Accent colors**: Cyan (`cyan-400/500`) for primary, violet (`violet-400/500`) for secondary
4. **CTAs**: Use solid `bg-cyan-500` with `text-slate-900`
5. **Links**: Use `text-muted-foreground hover:text-cyan-400`
6. **Cards**: Use glass effect with `bg-card/80 backdrop-blur-sm border-cyan-500/10`
7. **Transitions**: Always `duration-200` or `duration-300`
8. **Borders**: Use `border-cyan-500/10` for subtle, `border-cyan-500/30` for emphasis
9. **Spacing**: Generous - sections get `py-20`, cards get `p-6`
10. **Focus rings**: Use `ring-cyan-500/50`
11. **Icons**: Always add `aria-hidden="true"` to decorative icons
