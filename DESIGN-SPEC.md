# DESIGN SPEC — Apply luisracosta.com Design Language to Paperclip UI

## Source of Truth

These values come directly from https://luisracosta.com/style.css — Luis's personal site. Match this exactly.

---

## Fonts

Import these in `ui/index.html` or the CSS entry point:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Instrument+Serif&display=swap" rel="stylesheet">
<link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet">
```

Font families:
```css
--font-display: 'Instrument Serif', Georgia, serif;   /* headings, titles */
--font-body: 'Satoshi', 'Inter', sans-serif;           /* everything else */
```

- Page titles, section headers, agent names in org chart → `font-display`
- All body text, sidebar, buttons, inputs, metadata → `font-body`
- Code blocks → keep `JetBrains Mono` or system monospace

## Colors — Dark Mode (Primary)

Apply to `.dark` in `ui/src/index.css`. Replace the oklch values with these hex values:

```css
.dark {
  --background: #0A0A0A;           /* near-black, warm */
  --foreground: #E8E6E3;           /* warm white */
  --card: #111111;                 /* surface - subtle lift */
  --card-foreground: #E8E6E3;
  --popover: #111111;
  --popover-foreground: #E8E6E3;
  --primary: #E8E6E3;              /* warm white */
  --primary-foreground: #0A0A0A;   /* black text on white buttons */
  --secondary: #161616;            /* surface-2 */
  --secondary-foreground: #E8E6E3;
  --muted: #161616;
  --muted-foreground: #8A8885;     /* muted text - warm gray */
  --accent: #161616;
  --accent-foreground: #E8E6E3;
  --destructive: oklch(0.637 0.237 25.331);
  --destructive-foreground: #E8E6E3;
  --border: #2A2A2A;               /* subtle borders */
  --input: #2A2A2A;
  --ring: #555350;                 /* focus ring - faint */
  --sidebar: #0A0A0A;
  --sidebar-foreground: #E8E6E3;
  --sidebar-primary: #E8E6E3;
  --sidebar-primary-foreground: #0A0A0A;
  --sidebar-accent: #161616;
  --sidebar-accent-foreground: #E8E6E3;
  --sidebar-border: #1E1E1E;      /* divider color */
  --sidebar-ring: #555350;
}
```

Key point: these are NOT pure black/white. They're warm — `#0A0A0A` not `#000000`, `#E8E6E3` not `#FFFFFF`. That warmth is what makes the site feel editorial, not technical.

## Colors — Light Mode (keep as secondary option)

```css
:root {
  --background: #FAFAF8;
  --foreground: #1A1A18;
  --card: #F3F2EE;
  --card-foreground: #1A1A18;
  --popover: #F3F2EE;
  --popover-foreground: #1A1A18;
  --primary: #1A1A18;
  --primary-foreground: #FAFAF8;
  --secondary: #EEEDEA;
  --secondary-foreground: #1A1A18;
  --muted: #EEEDEA;
  --muted-foreground: #6E6D6A;
  --accent: #EEEDEA;
  --accent-foreground: #1A1A18;
  --border: #D4D3CE;
  --input: #D4D3CE;
  --ring: #A8A7A3;
  --sidebar: #FAFAF8;
  --sidebar-foreground: #1A1A18;
  --sidebar-border: #E0DFDB;
}
```

## Shadows

Replace any existing box-shadow values. These are from the site:

```css
--shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
--shadow-md: 0 4px 12px rgba(0,0,0,0.4);
--shadow-lg: 0 12px 32px rgba(0,0,0,0.5);
```

Apply `--shadow-md` to:
- Cards (`.card` class in shadcn)
- Popovers and dropdowns
- Floating elements

This creates the "floating card" effect Luis wants. Cards should feel like they're hovering, not flat on the page.

## Border Radius

```css
--radius-sm: 0.375rem;   /* 6px - inputs, small buttons */
--radius-md: 0.5rem;     /* 8px - cards, medium elements */
--radius-lg: 0.75rem;    /* 12px - large cards, modals */
--radius-xl: 1rem;       /* 16px - featured cards */
```

IMPORTANT: The current config has `--radius-lg: 0px` and `--radius-xl: 0px`. Change these to the values above. Luis wants rounded corners and floating cards, not sharp edges.

## Typography Rules

From base.css:
```css
body {
  line-height: 1.6;
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  text-wrap: balance;
  line-height: 1.15;
  letter-spacing: -0.02em;
}

p, li, figcaption {
  text-wrap: pretty;
  max-width: 72ch;
}
```

Apply these:
- ALL headings in the UI (page titles, section labels, card titles) → `font-display` (Instrument Serif)
- ALL body text → `font-body` (Satoshi)
- Letter spacing on headings: `-0.02em`
- Body line-height: `1.6`

## Transition

All interactive elements should use:
```css
transition: 180ms cubic-bezier(0.16, 1, 0.3, 1);
```

This is the site's `--transition-interactive`. It makes hover states and clicks feel smooth and intentional.

## Spacing

From the site's spacing scale (apply to cards, sections, sidebar):
```
--space-2: 0.5rem    (8px)
--space-3: 0.75rem   (12px)
--space-4: 1rem      (16px)
--space-6: 1.5rem    (24px)
--space-8: 2rem      (32px)
--space-10: 2.5rem   (40px)
--space-12: 3rem     (48px)
```

Key spacing changes in the UI:
- Card internal padding: `var(--space-6)` (1.5rem / 24px)
- Gap between cards: `var(--space-6)` (1.5rem)
- Sidebar item padding: `var(--space-3)` vertical, `var(--space-4)` horizontal
- Page content padding: `var(--space-8)` on desktop
- Comment thread message spacing: `var(--space-6)` between messages

## Specific Component Changes

### Cards (ui/src/components/ui/card.tsx)
- Background: `var(--card)` (#111111 in dark)
- Border: `1px solid var(--border)` (#2A2A2A)
- Box-shadow: `var(--shadow-md)` — THIS is what makes cards float
- Border-radius: `var(--radius-lg)` (0.75rem)
- Padding: `var(--space-6)` (1.5rem)

### Sidebar
- Background should match `--background` (#0A0A0A), not a separate color
- Divider between sidebar and content: `1px solid #1E1E1E`
- Nav items on hover: background `#161616`, smooth transition

### Buttons
- Primary: background `#E8E6E3`, text `#0A0A0A`, radius `var(--radius-sm)`
- Secondary/ghost: transparent, text `#8A8885`, hover text `#E8E6E3`
- All buttons: `font-family: var(--font-body); font-weight: 500;`

### Scrollbar (already in index.css, update colors)
```css
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: #0A0A0A; }
::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #555350; }
```

## What This Should Feel Like

Open https://luisracosta.com in one tab. Open Paperclip in another. They should feel like they were made by the same person. Same warmth, same typography, same floating card aesthetic, same breathing room.

The site feels like a magazine. Paperclip should feel like the back office of that magazine — same design language, slightly more dense because it's a tool, but never cramped.

## Files to Modify

1. `ui/index.html` — add font imports
2. `ui/src/index.css` — all CSS variables (colors, radius, shadows, fonts)
3. `ui/src/components/ui/card.tsx` — add shadow and radius classes
4. `ui/src/components/ui/button.tsx` — font-family if needed
5. Any component using hardcoded colors or spacing instead of variables
