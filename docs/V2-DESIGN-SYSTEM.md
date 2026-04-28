# Namico V2 Design System
## Inspired by Linktree's Modern SaaS Aesthetic

> This document defines the visual language, component patterns, and layout principles
> for the Namico V2 redesign. It adapts Linktree's bold, section-based, conversion-focused
> design philosophy to Namico's naming contest platform.

---

## 1. Design Philosophy

### Core Principles (Adapted from Linktree)

| Principle | Linktree Approach | Namico V2 Adaptation |
|---|---|---|
| **Bold Color Blocking** | Each section uses a distinct, full-bleed background color | Each tier (Business/Team/Personal) owns a section color palette |
| **Conversion-First** | CTA repeated in every section, always visible | "Start Your Contest" CTA in every section |
| **Social Proof Forward** | User testimonials, brand logos, "70M+ users" | Contest stats, success stories, "12,000+ contests" |
| **Progressive Disclosure** | Simple hero > features > proof > pricing > FAQ | Simple hero > how it works > segments > proof > pricing > FAQ |
| **Light Mode Default** | Clean, bright backgrounds with dark text | Switch from V1's dark theme to a light, energetic aesthetic |

### V1 vs V2 Direction

| Aspect | V1 (Current) | V2 (New) |
|---|---|---|
| Theme | Dark (#0a0a0a background) | Light (white/cream backgrounds with color sections) |
| Layout | Single-tone, card-heavy | Bold section-based color blocks |
| Typography | Inter only, standard weights | Custom display font + Inter for body |
| Buttons | Ghost/outline style | Solid, pill-shaped, high contrast |
| Animations | fadeUp, float, pulse-glow | Scroll-triggered section reveals, carousels |
| Sections | Blended, glassmorphic | Distinct, full-width color blocks |

---

## 2. Color System

### Primary Palette

```
Background Light:    #FAFAF5  (warm off-white, main page background)
Background Cream:    #E8E8D8  (warm cream, alternate sections)
Text Primary:        #1A1A2E  (near-black, headings & body)
Text Secondary:      #6B6B7B  (muted gray, descriptions)
Text Muted:          #9B9BA8  (light gray, captions)
```

### Tier Accent Colors (Carried from V1, refined for light mode)

```
Business Yellow:     #E8EC06  (hero CTAs, primary accent - Linktree-inspired lime-yellow)
Business Dark:       #254F1A  (dark green for text on yellow backgrounds)
Team Purple:         #8B5CF6  (secondary sections)
Personal Green:      #10B981  (tertiary sections)
```

### Section Background Colors (Linktree-inspired color blocking)

```
Hero Section:        #E8EC06  (bright lime-yellow, like Linktree hero)
Feature Section 1:   #2538D4  (royal blue, like Linktree's "Create and customize")
Feature Section 2:   #8B1A32  (deep crimson, like Linktree's "Share anywhere")
Analytics Section:   #E8E8D8  (warm cream, like Linktree's "Analyze" section)
Social Proof:        #FAFAF5  (light neutral)
FAQ Section:         #8B1A32  (deep crimson with light text)
Final CTA:           #7C3AED  (vivid purple)
Footer:              #7C3AED  (purple with light footer card)
```

### Semantic Colors

```
Success:             #10B981
Warning:             #F59E0B
Error:               #EF4444
Info:                #3B82F6
```

---

## 3. Typography

### Font Stack

```css
/* Display / Headlines */
--font-display: 'Plus Jakarta Sans', 'Inter', sans-serif;

/* Body / UI */
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Mono / Code / Data */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

| Element | Size | Weight | Line Height | Letter Spacing | Usage |
|---|---|---|---|---|---|
| Hero H1 | 72px / 4.5rem | 800 (ExtraBold) | 1.07 | -0.02em | Landing page hero headline |
| Section H2 | 48px / 3rem | 700 (Bold) | 1.15 | -0.01em | Section headlines |
| Card H3 | 28px / 1.75rem | 600 (SemiBold) | 1.3 | 0 | Card titles, feature names |
| Body Large | 20px / 1.25rem | 400 (Regular) | 1.6 | 0 | Hero subtext, lead paragraphs |
| Body | 16px / 1rem | 400 (Regular) | 1.6 | 0 | General body text |
| Body Small | 14px / 0.875rem | 400 (Regular) | 1.5 | 0 | Captions, meta text |
| Label | 12px / 0.75rem | 600 (SemiBold) | 1.4 | 0.05em | Badges, tags, overlines |

### Responsive Type

```css
/* Mobile (< 768px) */
Hero H1:     40px / 2.5rem
Section H2:  32px / 2rem
Card H3:     22px / 1.375rem
Body Large:  18px / 1.125rem
```

---

## 4. Spacing & Layout

### Spacing Scale (8px base)

```
--space-1:    4px     (0.25rem)
--space-2:    8px     (0.5rem)
--space-3:    12px    (0.75rem)
--space-4:    16px    (1rem)
--space-5:    20px    (1.25rem)
--space-6:    24px    (1.5rem)
--space-8:    32px    (2rem)
--space-10:   40px    (2.5rem)
--space-12:   48px    (3rem)
--space-16:   64px    (4rem)
--space-20:   80px    (5rem)
--space-24:   96px    (6rem)
--space-32:   128px   (8rem)
```

### Section Spacing

```
Section Padding (Desktop):  96px top/bottom, max-width 1280px centered
Section Padding (Mobile):   48px top/bottom, 16px left/right
Content Max Width:          1280px
Text Content Max Width:     640px (for readability)
```

### Grid System

```
Columns:     12-column CSS Grid
Gutter:      24px (desktop), 16px (mobile)
Breakpoints:
  --mobile:    480px
  --tablet:    768px
  --desktop:   1024px
  --wide:      1280px
  --ultrawide: 1440px
```

---

## 5. Border Radius

Linktree uses heavily rounded, pill-like shapes. We adopt a similar approach:

```
--radius-sm:    6px     (small inputs, tags)
--radius-md:    12px    (cards, containers)
--radius-lg:    16px    (feature cards, images)
--radius-xl:    24px    (large cards, sections)
--radius-2xl:   32px    (hero images, testimonial cards)
--radius-full:  999px   (buttons, pills, badges, nav bar)
```

---

## 6. Components

### 6.1 Navigation Bar

**Linktree pattern:** Floating pill-shaped navbar with rounded corners, white background, centered nav links, action buttons on right.

```
Style:
  - Background: white with subtle shadow
  - Border radius: 999px (pill shape)
  - Position: sticky top with 16px margin from edges
  - Padding: 8px 8px 8px 24px
  - Backdrop: none (solid white, not glassmorphic)

Links:
  - Font: 16px, weight 500
  - Color: #1A1A2E
  - Hover: underline or subtle color shift

Buttons:
  - "Log in": ghost/outline, pill shape, dark border
  - "Sign up free": solid dark (#1A1A2E), white text, pill shape
```

### 6.2 Buttons

**Primary CTA (Hero/Section)**
```
Background:       #254F1A (dark green) or tier-specific color
Text:             white
Padding:          16px 32px
Border Radius:    999px (pill)
Font:             16px, weight 600
Hover:            darken 10%, subtle scale(1.02)
Active:           darken 15%, scale(0.98)
```

**Secondary CTA**
```
Background:       #F0D0E8 (soft pink/lavender) or section-complementary
Text:             #1A1A2E
Padding:          14px 28px
Border Radius:    999px
Font:             16px, weight 500
```

**Ghost/Outline**
```
Background:       transparent
Border:           2px solid currentColor
Text:             inherit
Padding:          14px 28px
Border Radius:    999px
```

### 6.3 Cards

**Feature Cards (2-column grid)**
```
Background:       section-specific color (lime, blue, pink, etc.)
Border Radius:    24px
Padding:          40px
Min Height:       400px
Content:          illustration/mockup + bold heading + description
```

**Testimonial Cards**
```
Background:       #FAFAF5
Border Radius:    32px
Padding:          48px
Content:          large avatar (circle) + quote (bold italic) + name/role
Navigation:       left/right arrow buttons
```

**Stats Cards (Analytics section)**
```
Background:       tier-specific muted color
Border Radius:    16px
Padding:          24px
Content:          icon + large number + label
Layout:           2x2 grid with varied sizes
```

### 6.4 FAQ Accordion

**Linktree pattern:** dark section background, lighter card rows with expand/collapse.

```
Container:
  Background:     #8B1A32 (deep crimson)
  Padding:        96px section padding

Items:
  Background:     rgba(255,255,255,0.08) (slightly lighter than container)
  Border Radius:  12px
  Padding:        24px 32px
  Margin Bottom:  12px
  Text Color:     #FFD0E0 (soft pink on dark)

Chevron:
  Color:          #FFD0E0
  Transition:     transform 0.3s ease
  Rotate:         180deg when open

Answer:
  Color:          rgba(255,255,255,0.7)
  Padding Top:    16px
  Font Size:      16px
```

### 6.5 Form Inputs

**Username/Email Input (Hero)**
```
Background:       white
Border:           none (relies on contrast against colored section)
Border Radius:    999px (pill, matching button)
Padding:          16px 24px
Font Size:        16px
Placeholder:      #9B9BA8
Focus:            subtle shadow ring in section accent color
```

**Standard Form Inputs (Brief Builder, Auth)**
```
Background:       #F5F5F0
Border:           1px solid #E0E0D8
Border Radius:    12px
Padding:          12px 16px
Focus Border:     tier accent color
Focus Shadow:     0 0 0 3px rgba(accent, 0.15)
```

### 6.6 Badges & Tags

```
Background:       tier accent color at 15% opacity
Text:             tier accent color
Border Radius:    999px
Padding:          4px 12px
Font:             12px, weight 600, uppercase, 0.05em spacing
```

---

## 7. Section Layout Patterns

### Pattern 1: Hero Section
```
Layout: 2 columns (text left, image carousel right)
Background: solid lime-yellow (#E8EC06)
Left Column: headline + subtext + input+CTA combo
Right Column: rotating lifestyle images with rounded corners
Text Color: dark green (#254F1A)
```

### Pattern 2: Feature Showcase (alternating)
```
Layout: 2 columns, alternates text-left/image-right
Background: bold solid color (blue, crimson, etc.)
Content: bold italic heading + description + CTA button
Image: product mockup/screenshot with subtle shadow
Text Color: white or cream on dark backgrounds
```

### Pattern 3: Bento Grid
```
Layout: 2-column grid, cards of varying heights
Background: neutral (#FAFAF5)
Cards: colored backgrounds (lime, pink, blue, dark)
Each card: illustration + bold heading + short description
```

### Pattern 4: Social Proof Carousel
```
Layout: horizontal scrolling card carousel
Background: neutral
Cards: large rounded images of users/brands
Center: rotating text "trusted by 70M+ [creators/brands/artists]"
```

### Pattern 5: Testimonial Spotlight
```
Layout: centered, full-width
Background: neutral with large circular avatar above
Content: large bold quote + name + role
Navigation: minimal arrow buttons below
```

### Pattern 6: Final CTA
```
Layout: centered text, full-bleed color section
Background: vivid purple or gradient
Content: bold headline + input + CTA button
Decorative: abstract illustration/silhouette behind text
```

---

## 8. Animation & Motion

### Scroll Animations
```css
/* Section entrance - elements fade up as they enter viewport */
.section-enter {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}
.section-enter.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Carousel/Swiper
```
Auto-play:       4500ms interval
Transition:      300ms slide
Pause on hover:  true
Navigation:      minimal arrow buttons (not dots)
```

### Micro-interactions
```
Button hover:    scale(1.02), 200ms ease
Button active:   scale(0.98), 100ms
Card hover:      translateY(-4px), subtle shadow increase, 300ms
Link hover:      underline slide-in from left, 200ms
Chevron rotate:  180deg, 300ms ease-in-out
Nav scroll:      background opacity transition on scroll
```

### Page Transitions
```
Route change:    fade out 200ms > fade in 300ms
Modal open:      backdrop fade 200ms + content slide up 300ms
Modal close:     reverse of open, 200ms total
```

---

## 9. Responsive Breakpoints

| Breakpoint | Width | Nav | Grid | Hero |
|---|---|---|---|---|
| Mobile | < 480px | Hamburger | 1 col | Stacked, smaller type |
| Tablet | 480-768px | Hamburger | 1-2 col | Stacked |
| Desktop | 768-1024px | Full nav | 2 col | Side by side |
| Wide | 1024-1280px | Full nav | 2-3 col | Side by side |
| Ultrawide | > 1280px | Full nav, centered | 2-3 col | Side by side, max-width |

---

## 10. Landing Page Section Map (V2)

```
1. NAVIGATION BAR         - Floating pill navbar (white, sticky)
2. HERO                   - Lime-yellow bg, headline + CTA + image carousel
3. HOW IT WORKS           - Blue bg, 3-step visual flow
4. SEGMENT SELECTOR       - Cream bg, 3 interactive tier cards (Business/Team/Personal)
5. FEATURE BENTO          - White bg, 2x2 bento grid of feature cards
6. SOCIAL PROOF CAROUSEL  - White bg, brand logos + rotating "trusted by" text
7. TESTIMONIAL            - Neutral bg, large avatar + quote + arrows
8. PRICING                - White bg, 3 tier pricing cards
9. FAQ                    - Crimson bg, accordion items
10. FINAL CTA             - Purple bg, bold headline + signup input + CTA
11. FOOTER                - Purple bg with white footer card, 4-column links
```

---

## 11. Iconography

```
Library:          Phosphor Icons (keep from V1)
Style:            Regular weight for UI, Bold for emphasis
Size:             20px (inline), 24px (buttons), 32px (feature cards), 48px (hero features)
Color:            inherit from parent text color
```

---

## 12. Shadows & Elevation

```
--shadow-sm:    0 1px 2px rgba(0,0,0,0.05)
--shadow-md:    0 4px 12px rgba(0,0,0,0.08)
--shadow-lg:    0 8px 24px rgba(0,0,0,0.12)
--shadow-xl:    0 16px 48px rgba(0,0,0,0.16)
--shadow-nav:   0 2px 16px rgba(0,0,0,0.06)  (floating navbar)
--shadow-card:  0 2px 8px rgba(0,0,0,0.04)   (resting cards)
```

---

## 13. Image Treatment

```
Border Radius:    24px for hero/feature images
Aspect Ratios:    16:9 (hero), 4:3 (feature cards), 1:1 (avatars)
Avatars:          Circle (border-radius: 50%), 80-120px
Testimonial:      Large circle avatar, 200-300px
Decorative:       Subtle rotation (2-5deg) on floating product mockups
```

---

## 14. CSS Custom Properties (Token Sheet)

```css
:root {
  /* Colors */
  --color-bg:              #FAFAF5;
  --color-bg-alt:          #E8E8D8;
  --color-text:            #1A1A2E;
  --color-text-secondary:  #6B6B7B;
  --color-text-muted:      #9B9BA8;

  --color-accent-yellow:   #E8EC06;
  --color-accent-green:    #254F1A;
  --color-accent-purple:   #8B5CF6;
  --color-accent-emerald:  #10B981;
  --color-accent-blue:     #2538D4;
  --color-accent-crimson:  #8B1A32;
  --color-accent-pink:     #F0D0E8;
  --color-accent-vivid:    #7C3AED;

  --color-tier-business:   #E8EC06;
  --color-tier-team:       #8B5CF6;
  --color-tier-personal:   #10B981;

  /* Typography */
  --font-display:          'Plus Jakarta Sans', sans-serif;
  --font-body:             'Inter', sans-serif;
  --font-mono:             'JetBrains Mono', monospace;

  /* Spacing */
  --space-section:         96px;
  --space-section-mobile:  48px;
  --max-width:             1280px;
  --max-width-text:        640px;

  /* Radius */
  --radius-sm:             6px;
  --radius-md:             12px;
  --radius-lg:             16px;
  --radius-xl:             24px;
  --radius-2xl:            32px;
  --radius-full:           999px;

  /* Shadows */
  --shadow-nav:            0 2px 16px rgba(0,0,0,0.06);
  --shadow-card:           0 2px 8px rgba(0,0,0,0.04);
  --shadow-md:             0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg:             0 8px 24px rgba(0,0,0,0.12);

  /* Motion */
  --ease-default:          cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast:         150ms;
  --duration-normal:       300ms;
  --duration-slow:         600ms;
}
```

---

## 15. Key Differences from V1

| Area | V1 | V2 |
|---|---|---|
| **Overall Mood** | Dark, techy, developer-focused | Bright, friendly, creator-focused |
| **Backgrounds** | #0a0a0a dark throughout | Color-blocked sections, light base |
| **Cards** | Glassmorphic with holographic shimmer | Solid colored, large rounded corners |
| **Buttons** | Ghost/outline with ripple | Solid pills with scale hover |
| **Nav** | Dark glassmorphic sticky bar | White floating pill shape |
| **Typography** | Inter only, standard hierarchy | Display font for headlines + Inter body |
| **Sections** | Blended, same dark tone | Distinct, bold color blocks per section |
| **Trust/Proof** | Scrolling marquee | Carousel + "featured in" logo bar |
| **FAQ** | Dark cards | Colored section with semi-transparent items |
| **Footer** | Standard dark footer | Colored section with embedded white card |
| **Overall Feel** | Prototype / wireframe | Production SaaS marketing site |

---

## Implementation Notes

- **Tech stack stays the same**: React + Vite + React Router
- **Replace globals.css and tokens.css** with new V2 token system
- **Keep all business logic**: voting algorithms, journey tracking, data models
- **Landing page is priority**: redesign LandingPage.jsx + Hero.jsx first
- **Existing pages** (BriefBuilder, VotingInterface, Results, etc.) will be updated incrementally after landing page is complete
- **No Tailwind**: continue with custom CSS, but better organized using CSS custom properties
- **Mobile-first**: design mobile layouts first, enhance for desktop

---

*Document version: 2.0*
*Created: 2026-03-30*
*Branch: v2-redesign*
