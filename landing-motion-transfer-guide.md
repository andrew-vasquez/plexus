# Landing Motion Transfer Guide

Use this file to recreate the Plexus landing page's interaction language on another landing page without copying its color palette.

This guide captures the motion premise, timing, hover behavior, navbar blur treatment, and the "section dims / CTA comes forward" pattern from the current Plexus implementation.

## Core Premise

The Plexus landing page does not use flashy motion. It feels:

- calm first
- responsive on hover
- slightly elevated, never floaty
- blurred on entry, then sharpened into place
- layered with glassy blur only where navigation or focus needs depth

Think "premium studio interface" rather than "animated marketing page."

## Motion Personality

There are really three motion moods in the landing page:

1. Reveal motion
- used for hero text, section blocks, and content entering the viewport
- starts with opacity `0`, blur, and a short downward offset
- settles in with a soft spring

2. Surface hover motion
- used for cards, buttons, and logo pieces
- small upward lift only
- border brightens slightly
- background lightens slightly
- shadow grows a little

3. Focus takeover motion
- used for the signal strip hover where the grid dims and `Explore the studio` fades/scales in
- the background content loses prominence
- the CTA gains prominence
- both transitions happen together over the same duration

## Exact Timing Language

These are the values currently used in the Plexus codebase and worth porting directly.

### Buttons and brand micro-motion

Source:
- [frontend/components/ui/button.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/ui/button.tsx)
- [frontend/components/shared/PlexusLogo.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/shared/PlexusLogo.tsx)
- [frontend/app/globals.css](/Users/andrewvasquez/repos/Plexus/plexus/frontend/app/globals.css#L272)

Use:

```css
--ease-ui: cubic-bezier(0.4, 0, 0.2, 1);
--dur-ui: 300ms;
```

Use this for:
- navbar links
- buttons
- logo hover pieces
- icon nudges
- card hover lift

### Section and card surface motion

Source:
- [frontend/app/globals.css](/Users/andrewvasquez/repos/Plexus/plexus/frontend/app/globals.css#L272)

Use:

```css
--ease-surface: cubic-bezier(0.16, 1, 0.3, 1);
--dur-surface: 460ms;
--dur-surface-soft: 500ms;
```

Use this for:
- larger cards
- panels
- section containers
- anything that should feel more atmospheric than button-like

### Reveal motion

Source:
- [frontend/components/ui/animated-group.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/ui/animated-group.tsx)
- [frontend/components/ui/text-effect.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/ui/text-effect.tsx)
- [frontend/components/landing/constants.ts](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/landing/constants.ts)

Use:

```ts
const revealItem = {
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

const heroRevealItem = {
  hidden: { opacity: 0, filter: "blur(12px)", y: 14 },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
    transition: {
      type: "spring",
      bounce: 0.22,
      duration: 1.1,
    },
  },
};
```

Use this for:
- hero heading
- hero copy
- first CTA row
- major section wrappers

## Reusable Tokens

If you want a portable version for another site, use this token set:

```css
:root {
  --landing-ease-ui: cubic-bezier(0.4, 0, 0.2, 1);
  --landing-ease-surface: cubic-bezier(0.16, 1, 0.3, 1);
  --landing-ease-reveal: cubic-bezier(0.22, 1, 0.36, 1);

  --landing-dur-ui: 300ms;
  --landing-dur-surface: 460ms;
  --landing-dur-surface-soft: 500ms;
  --landing-dur-overlay: 500ms;

  --landing-lift-sm: -1px;
  --landing-lift-md: -2px;
}
```

## Hover Recipes

### 1. Primary / secondary button hover

Source:
- [frontend/components/ui/button.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/ui/button.tsx)

Behavior:
- lift by `-2px`
- brighten border
- brighten background slightly
- do not overscale
- keep text crisp

Portable recipe:

```css
.landing-button {
  transition:
    transform var(--landing-dur-ui) var(--landing-ease-ui),
    border-color var(--landing-dur-ui) var(--landing-ease-ui),
    background-color var(--landing-dur-ui) var(--landing-ease-ui),
    box-shadow var(--landing-dur-ui) var(--landing-ease-ui),
    color var(--landing-dur-ui) var(--landing-ease-ui);
}

.landing-button:hover {
  transform: translateY(var(--landing-lift-md));
}
```

### 2. Card hover

Source:
- [frontend/components/landing/LandingSections.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/landing/LandingSections.tsx)
- [frontend/components/landing/HeroIntro.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/landing/HeroIntro.tsx#L221)

Behavior:
- lift by `-1px` or `-1.5px`
- border becomes slightly brighter
- panel fill becomes slightly brighter
- no dramatic scale

Portable recipe:

```css
.landing-card {
  transition:
    transform var(--landing-dur-ui) var(--landing-ease-ui),
    border-color var(--landing-dur-ui) var(--landing-ease-ui),
    background-color var(--landing-dur-ui) var(--landing-ease-ui),
    box-shadow var(--landing-dur-ui) var(--landing-ease-ui);
}

.landing-card:hover {
  transform: translateY(-1px);
}

.landing-card.is-emphasized:hover {
  transform: translateY(-1.5px);
}
```

### 3. Tiny icon nudge

Source:
- [frontend/components/landing/HeroIntro.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/landing/HeroIntro.tsx#L39)
- [frontend/components/landing/LandingSections.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/landing/LandingSections.tsx#L39)

Behavior:
- icon shifts by about `0.5px` to `1px`
- never spins
- never scales dramatically

Portable recipe:

```css
.landing-icon {
  transition: transform var(--landing-dur-ui) var(--landing-ease-ui);
}

.group:hover .landing-icon {
  transform: translateX(0.5px);
}
```

## Navbar Blur System

Source:
- [frontend/components/landing/HeroHeader.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/landing/HeroHeader.tsx)

This is one of the signature effects worth preserving.

### Behavior

At rest:
- navbar is mostly open and minimal
- little to no heavy container treatment

When scrolled or mobile menu opens:
- container narrows visually
- gets rounded corners
- adds border
- adds dark translucent fill
- adds backdrop blur
- adds a soft lifted shadow

### Key values

```css
border: 1px solid rgba(255,255,255,0.10);
background: rgba(0,0,0,0.60);
backdrop-filter: blur(12px);
box-shadow: 0 22px 60px -38px rgba(0,0,0,0.88);
transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

Responsive version in Plexus becomes a little lighter and blurrier on larger screens:

```css
background: rgba(0,0,0,0.44);
backdrop-filter: blur(20px);
```

### Portable implementation

```css
.landing-nav-shell {
  transition:
    max-width var(--landing-dur-ui) var(--landing-ease-ui),
    border-color var(--landing-dur-ui) var(--landing-ease-ui),
    background-color var(--landing-dur-ui) var(--landing-ease-ui),
    box-shadow var(--landing-dur-ui) var(--landing-ease-ui),
    backdrop-filter var(--landing-dur-ui) var(--landing-ease-ui);
}

.landing-nav-shell[data-condensed="true"] {
  border: 1px solid rgba(255,255,255,0.10);
  background: rgba(0,0,0,0.55);
  box-shadow: 0 22px 60px -38px rgba(0,0,0,0.88);
  backdrop-filter: blur(16px);
}
```

### Important note

The navbar blur works because it is paired with:
- a restrained border
- a dark translucent fill
- a very soft shadow

If you use blur without those three, it will look cheap.

## Hero Reveal Choreography

Source:
- [frontend/components/landing/HeroIntro.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/landing/HeroIntro.tsx)

The hero reveal order is:

1. top announcement pill
2. heading word-reveal
3. supporting paragraph
4. CTA row
5. preview shell
6. stats

### Stagger values

Plexus uses:

- child stagger around `0.04` to `0.08`
- CTA delay children `0.08`
- preview delay children `0.12`
- word-level stagger in heading `0.035`

This is enough to feel orchestrated without becoming theatrical.

## The "Dim The Whole Section" Pattern

Source:
- [frontend/components/landing/SignalStrip.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/landing/SignalStrip.tsx)

This is the `Explore the studio` behavior you called out.

### What happens

On group hover:
- the CTA layer fades in and scales from `0.95` to `1`
- the underlying icon grid fades down to `0.45` opacity
- both pieces animate over `500ms`

### Why it works

The CTA does not fly in from far away.
The background does not disappear.
The section simply reprioritizes attention.

### Portable recipe

```css
.focus-strip {
  position: relative;
}

.focus-strip-cta {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.95);
  transition:
    opacity 500ms var(--landing-ease-surface),
    transform 500ms var(--landing-ease-surface);
}

.focus-strip-grid {
  transition:
    opacity 500ms var(--landing-ease-surface),
    transform 500ms var(--landing-ease-surface);
}

.focus-strip:hover .focus-strip-cta {
  opacity: 1;
  transform: scale(1);
}

.focus-strip:hover .focus-strip-grid {
  opacity: 0.45;
}
```

## Blur-On-Entry Language

This is another important part of the Plexus feel.

Elements do not just fade in. They:

- fade in
- sharpen from blur
- settle upward a short distance

Use:

```ts
hidden: {
  opacity: 0,
  filter: "blur(10px)",
  y: 16,
}
```

Do not use:

- large scale-up reveals
- long slides from off-screen
- over-bouncy spring values

## Recommended Transfer Rules

If you are applying this to another landing page, keep these rules:

1. Reuse the motion timings, not the Plexus colors.
2. Keep hover movement between `-1px` and `-2px`.
3. Use blur on entry, not blur on hover.
4. Keep icons on hover to tiny nudges only.
5. Use backdrop blur only on nav, overlays, or focus shells.
6. Use section dimming only when a single CTA needs to temporarily take focus.
7. Use staggered reveals for hero sections and major blocks, not every little item.

## Drop-In Framer Motion Presets

```ts
export const landingMotion = {
  ui: {
    duration: 0.3,
    ease: [0.4, 0, 0.2, 1],
  },
  surface: {
    duration: 0.46,
    ease: [0.16, 1, 0.3, 1],
  },
  surfaceSoft: {
    duration: 0.5,
    ease: [0.16, 1, 0.3, 1],
  },
  reveal: {
    type: "spring",
    bounce: 0.18,
    duration: 0.9,
  },
  heroReveal: {
    type: "spring",
    bounce: 0.22,
    duration: 1.1,
  },
};
```

## Minimal Implementation Stack

If you only want the necessary pieces for another landing page, carry these over:

1. The button hover timing and lift recipe.
2. The card hover timing and low-distance lift.
3. The navbar condensed blur shell.
4. The blur-and-rise reveal preset.
5. The dim-background / CTA-overlay group-hover pattern.
6. The heading word-stagger pattern.

## Source Map

Use these files as the implementation references:

- [frontend/components/landing/HeroHeader.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/landing/HeroHeader.tsx)
- [frontend/components/landing/HeroIntro.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/landing/HeroIntro.tsx)
- [frontend/components/landing/LandingSections.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/landing/LandingSections.tsx)
- [frontend/components/landing/SignalStrip.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/landing/SignalStrip.tsx)
- [frontend/components/ui/animated-group.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/ui/animated-group.tsx)
- [frontend/components/ui/text-effect.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/ui/text-effect.tsx)
- [frontend/components/ui/button.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/ui/button.tsx)
- [frontend/components/shared/PlexusLogo.tsx](/Users/andrewvasquez/repos/Plexus/plexus/frontend/components/shared/PlexusLogo.tsx)
- [frontend/app/globals.css](/Users/andrewvasquez/repos/Plexus/plexus/frontend/app/globals.css)

## If You Want A Short Version

If you end up turning this into a new landing page, the shortest possible brief is:

> Use soft blur-and-rise reveals, 300ms button/card hover transitions, 460ms surface transitions, a condensed blurred navbar on scroll, tiny icon nudges, and a hover pattern where the background section dims while a centered CTA fades in and sharpens.
