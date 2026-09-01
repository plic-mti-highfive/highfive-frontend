---
name: HighFive!
description: A community corkboard for real-world projects — warm neutral paper, a hashed six-hue tag wheel, and a serif brand mark that never leaks into the UI around it.
colors:
  highfive-pink: "#ff4d8c"
  highfive-pink-light: "#ffe8f1"
  highfive-pink-dark: "#cc0055"
  tag-orange: "#ff6b1a"
  tag-orange-light: "#fff0e6"
  tag-orange-dark: "#aa3a00"
  tag-yellow: "#ffd600"
  tag-yellow-light: "#fffbe0"
  tag-yellow-dark: "#6a4e00"
  tag-apple: "#5ed651"
  tag-apple-light: "#edfce8"
  tag-apple-dark: "#1a7010"
  tag-sky: "#3ec6f5"
  tag-sky-light: "#e5f8ff"
  tag-sky-dark: "#0a6080"
  tag-purple: "#c24bff"
  tag-purple-light: "#f5e8ff"
  tag-purple-dark: "#7000b8"
  neutral-bg: "oklch(0.98 0.008 85)"
  neutral-fg: "oklch(0.2 0.015 30)"
  neutral-card: "oklch(1 0.005 85)"
  neutral-border: "oklch(0.88 0.01 85)"
  neutral-muted: "oklch(0.94 0.012 85)"
  neutral-muted-fg: "oklch(0.5 0.015 30)"
typography:
  display:
    fontFamily: "'Fraunces Variable', serif"
    fontStyle: "italic"
    fontWeight: 900
  heading-lg:
    fontFamily: "'Geist Variable', sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  heading-md:
    fontFamily: "'Geist Variable', sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: "'Geist Variable', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  body-md:
    fontFamily: "'Geist Variable', sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.65
  ui-md:
    fontFamily: "'Geist Variable', sans-serif"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
  label:
    fontFamily: "'Geist Variable', sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.14em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  pill: "100px"
spacing:
  comp-xs: "6px"
  comp-sm: "9px"
  comp-md: "13px"
  comp-lg: "18px"
  gap-sm: "8px"
  gap-md: "14px"
  gap-lg: "24px"
  gap-xl: "40px"
components:
  button-primary:
    backgroundColor: "{colors.neutral-fg}"
    textColor: "{colors.neutral-bg}"
    rounded: "{rounded.sm}"
    height: "36px"
    padding: "0 10px"
  button-outline:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.sm}"
    height: "36px"
    padding: "0 10px"
  tag-pill:
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "2px 8px"
  card:
    backgroundColor: "{colors.neutral-card}"
    rounded: "{rounded.xl}"
    padding: "16px 20px"
---

# Design System: HighFive!

## Overview

**Creative North Star: "The Community Corkboard"**

HighFive! is where scattered, half-organized projects — a community garden, a charity festival, a mural — get pinned up, colored in, and found by the people who'd want to help. The visual system reads that way on purpose: a warm, cream-toned paper canvas holds a lively wheel of six saturated accent hues, and nearly everything with an identity (a tag, a project, a user, an assignee) gets its own deterministic color, hashed from its own name so the same tag or project always lands on the same hue. It's playful and communal by design — closer to a corkboard full of colorful pinned notices than a sober SaaS dashboard, and deliberately not the generic corporate-blue-primary look that competing tools (Trello, Notion, generic dashboards) default to.

Sitting apart from that busy, colorful surface is a single quiet exception: the "HighFive!" wordmark itself, set in a bold italic serif (Fraunces) found nowhere else in the product. Every other headline, however large, uses the same grounded sans (Geist) as the body copy. The brand voice lives in one italic mark and a rose accent; the working interface — buttons, forms, kanban, nav — stays calm, flat, and neutral so the color wheel and the wordmark are what actually stand out.

**Key Characteristics:**

- Warm cream/near-black neutral base (oklch), not stark white/black or cool gray.
- A six-hue accent wheel (rose, orange, yellow, green, blue, purple) deterministically hashed per tag/project/assignee — never manually assigned.
- Fraunces italic black is reserved exclusively for the "HighFive!" wordmark; all other headlines use Geist.
- Primary CTA buttons use the near-black neutral, not the rose accent — rose is a signal color, not an action color.
- Cards and kanban tickets are flat at rest; hover response is a shadow plus a ring tinted in that item's own accent color, never generic gray.

## Colors

The palette is a warm neutral base (paper cream light mode / deep violet-black dark mode) carrying a bright, evenly-weighted six-hue accent wheel used almost exclusively for identity and categorization rather than for UI chrome.

### Primary

- **Highfive Pink** (`#ff4d8c`): the one true brand accent. Appears in the logo's exclamation mark, the default user-avatar fallback, the logout affordance (styled as brand rose rather than alarm red, keeping account exit calm rather than alarming), and as one of six possible hashed tag/category colors. It is **not** used as the default button or CTA fill — see the Accent-Not-Action rule below.

### Secondary — the tag wheel

Five more hues complete the deterministic tag/category wheel alongside Highfive Pink, each carrying the same light/base/dark step pattern (light background + dark text for pills, full saturation for borders/rings):

- **Ember Orange** (`#ff6b1a`)
- **Signal Yellow** (`#ffd600`)
- **Fresh Apple** (`#5ed651`)
- **Open Sky** (`#3ec6f5`)
- **Electric Purple** (`#c24bff`)

A tag or project's color is computed by hashing its name and indexing into this six-color wheel (`getTagColor`, `getPaletteForId`) — the same tag string always resolves to the same hue everywhere it appears, and no hue is ever chosen by hand.

### Neutral

- **Paper background** (`oklch(0.98 0.008 85)`): the base app background — warm cream, not pure white.
- **Ink foreground** (`oklch(0.2 0.015 30)`): body text and the default (near-black) button fill.
- **Card surface** (`oklch(1 0.005 85)`): elevated surfaces sit one step lighter/whiter than the page.
- **Hairline border** (`oklch(0.88 0.01 85)`): dividers, input strokes, card borders.
- **Muted fill / muted text** (`oklch(0.94 0.012 85)` / `oklch(0.5 0.015 30)`): hover fills and secondary text.

In dark mode the same roles shift to a deep violet-black base (`oklch(0.15 0.02 280)`) rather than pure black, keeping the same warm-not-cold character; the six-hue tag wheel and Highfive Pink stay chromatically consistent across both themes via `deeper`/`mid` steps rather than a straight brightness invert.

### Named Rules

**The Accent-Not-Action Rule.** Highfive Pink is a signal color (identity, social action, hashed category), never the default action color. Primary buttons and links use the near-black/near-white neutral pair, not rose — this keeps the one brand accent rare and meaningful instead of diluted across every CTA.

**The Deterministic Tint Rule.** Any color assigned to a tag, project, or assignee is derived by hashing its name, never picked manually. The same project or tag always renders in the same hue everywhere in the product; don't hardcode a specific hue to a specific entity.

## Typography

**Display Font:** Fraunces Variable (serif, italic, weight 900) — wordmark only.
**Body/Heading Font:** Geist Variable (sans-serif) — every other headline and all body/UI text.

**Character:** Soft and inviting rather than assertive — Geist carries nearly everything at generous, readable weights, and the one moment of expressive serif italics (the logo) is precisely what makes it read as a brand mark rather than another label.

### Hierarchy

- **Display** (weight 900, italic, `font-display`): the "HighFive!" wordmark exclusively. Never applied to page headlines, hero titles, or any other UI text.
- **Heading Large** (weight 700, 36px, line-height 1.05, `-0.02em`): auth page titles and comparable single, large page headers — set in Geist, not Fraunces.
- **Heading Medium** (weight 700, 18px, line-height 1.3): section titles ("Projets tendance", form section headers).
- **Body Large** (16px, line-height 1.65): lead paragraphs, form field labels, primary descriptive copy.
- **Body Medium** (14px, line-height 1.65): default body copy, menu items, card metadata.
- **UI Medium** (weight 600, 13px): compact interactive labels (menu triggers, small buttons).
- **Label** (weight 600, 10px, `0.14em` letter-spacing, uppercase): kanban tag chips and other small categorical badges.

### Named Rules

**The Wordmark-Only Serif Rule.** Fraunces italic is reserved for the literal "HighFive!" logotype. Every headline, no matter how large or prominent (auth titles, hero card names, section headers), is set in Geist. If a design needs a page to feel "branded," reach for the rose accent or the logo itself — never for the serif.

## Layout

The primary experience is a three-column feed: a sticky left profile rail (`260px`), a fluid center column bordered on both sides (`xl:border-x`) once the viewport is wide enough for the rail, and a sticky right rail of trending users/tags (`280px`), all inside a `max-w-[100rem]` page container. Vertical rhythm between feed sections is generous (`gap-11`, `py-10`), and sidebars stick just below the header (`top: 6.25rem`).

Navigation is two stacked sticky bars: a `56px` header (logo, centered search, actions) directly above a `44px` pill-style category nav bar that auto-hides on scroll-down and reappears on scroll-up, keeping category browsing available without permanently taxing vertical space.

Simpler task-oriented surfaces (auth) drop the three-column feed entirely for a centered, single-column form (`max-w-md`) beside a full-bleed image panel — the feed layout is a home/discovery pattern, not a universal page shell.

## Elevation & Depth

Flat at rest, everywhere. Cards, kanban tickets, inputs, and popovers carry at most a barely-visible `shadow-sm`. Depth is not ambient — it is a direct response to interaction, and when it appears it is never a neutral gray shadow alone.

### Shadow Vocabulary

- **Resting** (`shadow-sm`): the default state for every card, ticket, and popover surface.
- **Feed card hover** (`0 2px 10px -2px rgb(0 0 0 / 0.15), 0 0 0 2px var(--card-accent)`): soft lift plus a 2px ring tinted in that card's own deterministic accent color.
- **Hero card hover** (`0 4px 16px -4px rgb(0 0 0 / 0.15), 0 0 0 2px var(--card-accent)`): the same tinted-ring mechanic, scaled up for the larger hero card.
- **Kanban ticket hover** (`0 6px 20px rgba(0,0,0,0.09)` light / `0 6px 20px rgba(0,0,0,0.3)` dark, plus `-translate-y-0.5`): shadow, lift, and a border-color shift together.
- **Popover/menu** (`shadow-lg`): the one place a plain, untinted shadow is used — transient overlay surfaces (menus, search dropdown) rather than persistent content cards.

### Named Rules

**The Tinted Lift Rule.** A card's hover elevation is never generic. It pairs a soft shadow with a 2px ring in that specific card's own deterministic accent color (`--card-accent`, from the same hash used for its background tint) — depth and identity color appear together, or not at all.

## Shapes

Corners scale with a surface's importance: small interactive controls (buttons, inputs) use the tightest radius (8px), cards step up through 12–20px, and anything meant to read as a badge or avatar (tag pills, assignee initials, the user-menu trigger) is fully round. There are no sharp (0px) corners anywhere in the system, and no visible borders on colored surfaces — card and pill boundaries are made of color/shadow, not stroke, except for the deliberately flat kanban ticket and input controls, which do carry a hairline border.

## Components

Buttons, inputs, and cards read as **soft and inviting**: generous radii, light borders over heavy ones, and transitions that ease rather than snap.

### Buttons

- **Shape:** rounded-sm to rounded-md depending on size (8–12px), never square.
- **Primary:** near-black fill (`neutral-fg`) with inverted text — deliberately neutral, not the rose accent (see Accent-Not-Action Rule).
- **Outline / Secondary / Ghost:** transparent or `secondary` fill with a hairline border; ghost has no border until hover, when it picks up a muted fill.
- **Destructive:** low-opacity destructive-red fill rather than a solid red block — kept quiet, matching the system's general avoidance of loud alarm colors (compare: logout uses rose, not this destructive variant, for a softer exit affordance).
- **Hover / Active:** background opacity/shade shift plus a 1px downward press (`active:translate-y-px`); focus uses a 3px ring at 50% opacity of the current border color.

### Tags / Chips

- **Style:** fully round (`rounded-full`) pill, light-tinted background with dark-tinted text in the same hue, sized `10–11px` label text.
- **Color:** always the deterministic hash color for that tag string — see the Deterministic Tint Rule.
- **Interactive tags** (clickable, e.g. in the category nav bar): add a `ring-1 ring-current/20` when active; otherwise transparent with a muted hover fill.

### Cards / Containers

- **Corner Style:** 12px (`ProjectFeedCard`) to 20px (`HeroCard`) — larger, more prominent cards get a larger radius.
- **Background:** each card is internally banded (header/body/footer strips), all derived from `color-mix(in srgb, <accent> X%, var(--card))` at different mix strengths — never a flat single fill.
- **Shadow Strategy:** see Elevation & Depth — flat at rest, tinted lift on hover.
- **Border:** none; the color bands and hover ring carry the boundary instead of a stroke.
- **Internal Padding:** compact cards use `20px` horizontal / `16px` vertical; the hero card scales up to `32px` / `28px`.

### Inputs / Fields

- **Style:** `rounded-md` (12px), hairline border, transparent/background fill, `36px` height.
- **Focus:** border shifts to the ring color plus a 3px, 50%-opacity ring — no glow or shadow-based focus state.
- **Error:** border and ring shift to the destructive token; no icon change.

### Navigation

- **Header:** sticky, `56px`, sits on the `sidebar` neutral token (a step darker/cooler than the page background), logo left, search absolutely centered, actions right.
- **Category nav bar:** sticky pill row directly beneath the header; active pill takes on that category's hashed tag color plus a soft ring; inactive pills are plain text with a muted hover fill. Auto-hides on scroll-down, reappears on scroll-up.

### Avatar (signature component)

Circular; renders the real photo when available, and otherwise deterministic initials-on-tint (`hsl(hue, 45%, 80%)` background / `hsl(hue, 45%, 30%)` text, hue derived from the person's name) with a subtle `ring-1 ring-black/10`. The same fallback mechanic and hue-from-name logic used for card tints and tag colors is reused here for people, keeping the "everything gets its own deterministic color" idea consistent across projects, tags, and users alike.

## Do's and Don'ts

### Do:

- **Do** derive any per-entity color (tag, project, assignee, avatar fallback) from a deterministic hash of its name — never hardcode a hue to a specific entity.
- **Do** pair a hover shadow with a tinted ring in that item's own accent color on cards and tickets (The Tinted Lift Rule), rather than a plain gray shadow.
- **Do** keep the primary CTA fill neutral (near-black), reserving Highfive Pink for identity and social-action moments.
- **Do** keep card and pill boundaries made of color/tint and shadow rather than visible borders.

### Don't:

- **Don't** apply the Fraunces display serif to anything other than the literal "HighFive!" wordmark — all headlines, including large ones, use Geist (The Wordmark-Only Serif Rule).
- **Don't** default to a corporate SaaS blue as a primary or accent color — the system's identity color is warm rose, its neutrals are warm cream/ink, not cool gray-blue.
- **Don't** add ambient/resting shadows to cards or tickets; elevation only appears as a direct response to hover.
- **Don't** manually assign a specific hue to a specific tag, project, or user — always go through the deterministic hash so the same name always resolves the same way.
