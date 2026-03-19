# Portfolio Landing Design Guide

Use this as a design brief for recreating the feel of the Plexus landing page inside a portfolio page without copying the product content directly.

## Core Design Direction

The page feels like a premium technical product demo:

- Dark, cinematic, near-black background
- Thin white borders with very low opacity
- Frosted or glass-like surfaces, but restrained
- Large editorial typography with tight tracking
- Spacious layout with strong horizontal rhythm
- Product-first presentation instead of decorative marketing clutter
- Motion that feels calm, precise, and confidence-building

If you apply this to a portfolio, the result should feel like:

"A serious builder showing polished systems work, not a loud startup landing page."

## Visual Language

### Color System

Base palette pulled from the implementation:

- Background: `#07080a`
- Surface: `#0b0d10`
- Strong surface: `#11141a`
- Text: `#f3f6f9`
- Muted text: `#96a0ac`
- Border: `rgba(220, 228, 238, 0.1)`
- Accent glow 1: `rgba(122, 215, 255, 0.08)`
- Accent glow 2: `rgba(214, 255, 87, 0.09)`

Use mostly monochrome UI, then add only a tiny amount of cool cyan or lime glow in backgrounds and hover states.

### Background Treatment

The background is not flat. It layers:

1. A deep black base
2. Large radial glows near the top corners
3. A faint vertical highlight wash
4. Optional subtle grid/noise texture

Use this principle on your portfolio hero:

- Keep the page mostly dark and quiet
- Put visual energy behind the content, not inside every card
- Let glow and atmosphere do more work than bright colors

## Typography Style

The type system has two jobs:

- Display text feels bold, compressed, and editorial
- Labels/meta text feel technical and uppercase

Patterns to reuse:

- Hero headline: oversized, tight line-height, negative tracking
- Section headings: large but controlled, still elegant
- Eyebrows and labels: mono or mono-like, uppercase, high letter spacing
- Body copy: softened white at medium opacity, roomy line-height

For your portfolio:

- Make your hero heading feel like a statement, not a tagline
- Keep supporting copy narrower than the heading
- Use uppercase micro-labels for section intros, project stats, and tech metadata

## Layout System

The layout is built around a few consistent ideas:

- Content centered in a wide container
- Large hero block first
- Alternation between dense product panels and breathing space
- Rounded rectangular surfaces with a repeatable radius language
- Grid sections that feel modular and architectural

Recommended portfolio adaptation:

1. Hero
2. Capabilities strip
3. Featured projects grid
4. Deep-dive case study panel
5. Skills or workflow section
6. Contact/footer

## Surface Design

Cards and panels use a very specific treatment:

- Border: `border-white/8` to `border-white/10`
- Fill: `bg-white/[0.025]` or soft black overlay
- Radius: large, often `18px` to `28px`
- Shadow: long, soft, dark shadow
- Hover: slight lift, slightly brighter border, slightly brighter fill

What matters most is restraint:

- Don’t make cards fully transparent
- Don’t blur everything
- Don’t use heavy gradients on every component
- Keep hover states subtle and premium

## Animation Style

This landing page uses motion in three layers.

### 1. Entrance Motion

Sections reveal with:

- Small upward movement
- Blur reduction
- Opacity fade-in
- Staggered children
- Spring easing with light bounce

That creates a "settling into focus" effect.

For your portfolio, use this on:

- Hero badge
- Headline
- Subcopy
- CTA row
- Project cards
- Section headings

### 2. Text Reveal

The hero headline animates word-by-word:

- Each word starts slightly blurred and lowered
- Words resolve into place with a short stagger

Use this sparingly:

- Hero headline only
- Possibly one featured project heading

Avoid doing this on every heading or it will feel overdesigned.

### 3. Hover Motion

Hover behavior is subtle and tactile:

- Cards lift slightly upward
- Icons shift by a few pixels
- Borders brighten a little
- Background fill intensifies a little
- Interactive visualizations glow more when hovered

The rule for your portfolio:

"Hover should reward attention, not announce itself."

## Signature Motion Recipe

If you want one reusable rule set for Framer Motion, use this style:

```ts
const item = {
  hidden: { opacity: 0, filter: "blur(10px)", y: 16 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      type: "spring",
      bounce: 0.18,
      duration: 0.9,
    },
  },
};

const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};
```

Then add:

- Slightly slower hero timing
- Faster hover timing
- Reduced motion fallback for everything

## What Makes The Hero Work

The hero is strong because it combines:

- A slim announcement pill
- A giant headline
- A narrow supporting paragraph
- A clean CTA pair
- A large "product preview" frame underneath

For your portfolio page, translate that structure into:

- Small top pill: your role or positioning
- Large headline: what you build
- Supporting copy: what makes your work different
- CTA buttons: view work / contact / resume
- Featured visual frame: mock dashboard, case study preview, or project collage

## Best Part To Borrow For A Portfolio

The most transferable idea is the large preview frame below the hero.

Instead of using a generic screenshot, build a curated portfolio showcase panel:

- Left: featured project visual or browser mockup
- Right: project outcomes, stack, role, and impact
- Bottom: quick metrics or tags

This keeps the page feeling productized and intentional.

## Section Style Rules

Use these repeated patterns:

- Every major section starts with a small uppercase label
- Headings are short and assertive
- Paragraphs stay muted and readable
- Cards use the same radius family
- Spacing is generous
- Sections alternate between full-width panels and card grids

This repetition is what makes the page feel designed as a system.

## Portfolio-Specific Translation

Here is how to map Plexus-style design to a portfolio:

### Hero

- Replace product headline with a builder/designer/developer statement
- Keep the dramatic type scale
- Use a real project preview instead of abstract artwork

### Signal Strip -> Capabilities Strip

Replace the feature strip with 4 compact capability blocks like:

- Product Design
- Frontend Systems
- Motion Design
- Full-Stack Delivery

### Workflow Section -> Project Principles

Use 3 cards to explain how you work:

- Strategy
- Execution
- Refinement

### Preview Section -> Featured Work

Turn the workspace panel into a featured case study:

- Large primary project
- Supporting detail cards beside it

### Export Section -> Outcomes

Translate exports into results:

- Conversion lift
- Performance improvements
- Design system coverage

### Audience Section -> Fit

Translate "audience" into who you help best:

- Founders
- Startups
- Product teams

## Micro-Interaction Guidance

Use:

- `translateY(-4px)` to `translateY(-6px)` on hover
- Border opacity increase by a small amount
- Background opacity increase by a small amount
- Icon shift of `2px` to `4px`
- Ambient glow on focal showcase elements

Avoid:

- Big scale effects
- Long float animations everywhere
- Overuse of blur
- Neon accents on every surface
- Bouncy consumer-app motion

## CSS / Tailwind Direction

Useful style patterns to keep:

```css
background:
  radial-gradient(circle at top left, rgba(122, 215, 255, 0.08), transparent 24%),
  radial-gradient(circle at 78% 8%, rgba(214, 255, 87, 0.09), transparent 18%),
  linear-gradient(180deg, rgba(255, 255, 255, 0.02), transparent 16%),
  #07080a;
```

```txt
rounded-[18px] to rounded-[28px]
border-white/8
bg-white/[0.025]
text-white/50 for secondary copy
tracking-[-0.04em] to tracking-[-0.08em] for large headlines
uppercase tracking-[0.18em] to tracking-[0.22em] for labels
shadow-[0_30px_120px_-50px_rgba(0,0,0,0.95)]
```

## Do And Don't

Do:

- Keep the page dark, minimal, and editorial
- Lead with one strong visual showcase
- Animate entrances with blur + rise + stagger
- Keep hover states crisp and understated
- Use typography as the main source of drama

Don’t:

- Turn it into a flashy SaaS template
- Add too many colors
- Use giant glowing gradients on every card
- Animate all text and all components equally
- Let portfolio content become harder to scan than the design itself

## Portfolio Prompt You Can Reuse

```md
Design my portfolio landing page using a dark, cinematic, premium product aesthetic inspired by the Plexus landing page.

Requirements:
- Near-black background with subtle radial glow accents
- Large editorial hero typography with tight tracking
- Thin translucent borders and soft glass-like surfaces
- A strong featured-project showcase directly under the hero
- Motion should feel calm and precise: fade + slight upward movement + blur-to-sharp entrance animations with stagger
- Hover states should use subtle lift, border brightening, and small icon movement
- Section labels should be uppercase with wide tracking
- The page should feel like a high-end technical product presentation, not a generic portfolio template

Sections:
- Hero
- Capability strip
- Featured projects
- Project principles
- Results/outcomes
- Contact footer

Tone:
- Confident
- Technical
- Minimal
- Credible
- Design-forward without being flashy
```

## Source Files To Reference

If you want to pull details directly from the implementation again later, these are the key files:

- [frontend/app/page.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/app/page.tsx)
- [frontend/components/landing/HeroIntro.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/landing/HeroIntro.tsx)
- [frontend/components/landing/HeroHeader.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/landing/HeroHeader.tsx)
- [frontend/components/landing/LandingSections.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/landing/LandingSections.tsx)
- [frontend/components/landing/SignalStrip.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/landing/SignalStrip.tsx)
- [frontend/components/ui/animated-group.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/ui/animated-group.tsx)
- [frontend/components/ui/text-effect.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/ui/text-effect.tsx)
- [frontend/app/globals.css](/Users/andrewvasquez/repos/Plexus/plexus/frontend/app/globals.css)

## Short Version

If you only remember three things, make it these:

1. Use a dark atmospheric backdrop with very restrained glow.
2. Let typography and one showcase panel carry the page.
3. Keep motion soft, staggered, and slightly blurred on entry.
