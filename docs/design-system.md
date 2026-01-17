# Design System - Coucou IA

## Overview

Modern, technological, and smart visual identity for a B2B SaaS tracking brand visibility in LLM responses.

---

## Color Palette

### Core Colors

| Token | RGB | Hex | Usage |
|-------|-----|-----|-------|
| `--background` | `8 10 18` | `#080a12` | Page background (deep space black) |
| `--foreground` | `237 242 247` | `#edf2f7` | Primary text |
| `--card` | `15 20 35` | `#0f1423` | Card backgrounds |
| `--card-foreground` | `237 242 247` | `#edf2f7` | Card text |

### Brand Colors

| Token | RGB | Hex | Usage |
|-------|-----|-----|-------|
| `--primary` | `6 182 212` | `#06b6d4` | Primary actions, CTAs (cyan-500) |
| `--primary-foreground` | `8 10 18` | `#080a12` | Text on primary |
| `--secondary` | `139 92 246` | `#8b5cf6` | Secondary accents (violet-500) |
| `--secondary-foreground` | `237 242 247` | `#edf2f7` | Text on secondary |

### Semantic Colors

| Token | RGB | Hex | Usage |
|-------|-----|-----|-------|
| `--success` | `34 197 94` | `#22c55e` | Success states (emerald-500) |
| `--destructive` | `244 63 94` | `#f43f5e` | Errors, delete actions (rose-500) |
| `--muted` | `30 40 60` | `#1e283c` | Muted backgrounds |
| `--muted-foreground` | `148 163 184` | `#94a3b8` | Secondary text (slate-400) |

### UI Colors

| Token | RGB | Hex | Usage |
|-------|-----|-----|-------|
| `--border` | `30 40 60` | `#1e283c` | Default borders |
| `--input` | `20 30 50` | `#141e32` | Input backgrounds |
| `--ring` | `6 182 212` | `#06b6d4` | Focus rings |
| `--accent` | `30 40 60` | `#1e283c` | Accent backgrounds |

### Gradients

```css
/* Primary gradient - CTAs */
bg-gradient-to-r from-cyan-500 to-cyan-600

/* Accent gradient - decorative */
bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500

/* Background orbs */
from-cyan-500/20 to-transparent
from-violet-500/20 to-transparent
```

### Glow Effects

```css
/* Cyan glow */
.glow-cyan {
  box-shadow: 0 0 20px rgb(6 182 212 / 0.3), 0 0 40px rgb(6 182 212 / 0.1);
}

/* Violet glow */
.glow-violet {
  box-shadow: 0 0 20px rgb(139 92 246 / 0.3), 0 0 40px rgb(139 92 246 / 0.1);
}
```

---

## Typography

### Font Families

| Family | Variable | Usage | Weights |
|--------|----------|-------|---------|
| **Inter** | `--font-sans` | Body text, UI | 400, 500, 600, 700 |
| **Space Grotesk** | `--font-display` | Headings, titles | 400, 500, 600, 700 |
| **JetBrains Mono** | `--font-mono` | Code, data | 400, 500, 600 |

### Tailwind Classes

```tsx
<p className="font-sans">Body text with Inter</p>
<h1 className="font-display">Heading with Space Grotesk</h1>
<code className="font-mono">Code with JetBrains Mono</code>
```

### Type Scale

| Size | Class | Usage |
|------|-------|-------|
| 48px | `text-5xl` | Hero titles |
| 36px | `text-4xl` | Page titles |
| 30px | `text-3xl` | Section titles, stat values |
| 24px | `text-2xl` | Card titles |
| 20px | `text-xl` | Subsections |
| 18px | `text-lg` | Large body |
| 16px | `text-base` | Body text |
| 14px | `text-sm` | Secondary text, labels |
| 12px | `text-xs` | Captions, badges |

### Text Colors

```tsx
<p className="text-foreground">Primary text</p>
<p className="text-muted-foreground">Secondary text</p>
<p className="text-cyan-400">Accent text</p>
<p className="gradient-text">Gradient text</p>
```

---

## Components

### Button Variants

| Variant | Usage |
|---------|-------|
| `default` | Primary actions - cyan gradient with glow |
| `secondary` | Secondary actions - violet style |
| `outline` | Tertiary actions - transparent with border |
| `ghost` | Subtle actions - no background |
| `destructive` | Delete, dangerous actions - rose |
| `link` | Text links |

```tsx
<Button>Primary Action</Button>
<Button variant="outline">Secondary</Button>
<Button variant="ghost">Subtle</Button>
<Button variant="destructive">Delete</Button>
```

### Cards

Glass morphism effect with subtle borders:

```tsx
<Card>
  {/* rounded-xl, border-cyan-500/10, bg-card/80, backdrop-blur */}
  <CardHeader>...</CardHeader>
  <CardContent>...</CardContent>
</Card>
```

### Badges

| Variant | Color | Usage |
|---------|-------|-------|
| `default` | Cyan | Default state |
| `secondary` | Violet | Alternative state |
| `success` | Emerald | Positive state (cited) |
| `destructive` | Rose | Negative state (absent) |
| `outline` | Border only | Neutral |
| `muted` | Muted | Disabled/inactive |

### Inputs

Dark backgrounds with cyan focus rings:

```tsx
<Input placeholder="Email" />
{/* bg-input, border-border, focus:ring-cyan-500/50 */}
```

---

## Spacing

Use Tailwind's default spacing scale:

| Scale | Value | Usage |
|-------|-------|-------|
| `1` | 4px | Tight spacing |
| `2` | 8px | Element gaps |
| `3` | 12px | Small padding |
| `4` | 16px | Default padding |
| `6` | 24px | Section padding |
| `8` | 32px | Large gaps |
| `12` | 48px | Section margins |
| `16` | 64px | Page sections |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | 12px | Base radius |
| `rounded-lg` | 12px | Cards, modals |
| `rounded-xl` | 16px | Large cards |
| `rounded-full` | 9999px | Pills, avatars |

---

## Shadows & Effects

### Glow Effects

```css
/* Button glow */
shadow-lg shadow-cyan-500/25

/* Card hover */
hover:border-cyan-500/20

/* Focus ring */
focus-visible:ring-2 focus-visible:ring-cyan-500/50
```

### Backdrop Blur

```css
backdrop-blur-sm   /* Subtle blur for cards */
backdrop-blur-md   /* Medium blur for modals */
backdrop-blur-xl   /* Heavy blur for overlays */
```

---

## Animations

### Built-in

```tsx
animate-fade-in     // Opacity 0 → 1
animate-slide-up    // Translate Y with fade
animate-pulse-slow  // Slow pulsing glow
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

This design system is dark-mode only. The color scheme meta tag is set to `dark`:

```tsx
<meta name="color-scheme" content="dark" />
```

All colors are optimized for dark backgrounds with high contrast ratios for accessibility.

---

## Accessibility

### Color Contrast

- Primary text (`foreground`) on background: >7:1
- Secondary text (`muted-foreground`) on background: >4.5:1
- Interactive elements have clear focus states

### Focus States

All interactive elements have visible focus rings:

```css
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-cyan-500/50
focus-visible:ring-offset-2
focus-visible:ring-offset-background
```

### Motion

Respect user preferences for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Usage Examples

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
// Positive
<Badge variant="success" className="gap-1">
  <Check className="h-3 w-3" />
  <span>Cited #1</span>
</Badge>

// Negative
<Badge variant="destructive" className="gap-1">
  <X className="h-3 w-3" />
  <span>Absent</span>
</Badge>
```

### Gradient Text

```tsx
<h1 className="gradient-text font-display text-5xl font-bold">
  Track Your AI Visibility
</h1>
```
