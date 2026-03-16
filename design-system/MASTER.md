# Plexus Design System

## Purpose
- Preserve the current Plexus visual direction across future edits, new routes, and even separate projects.
- Keep Plexus aligned with a premium, restrained, Vercel-adjacent aesthetic rather than drifting into soft, playful, or generic SaaS UI.

## Core Direction
- Tone: premium, technical, sleek, editorial, dark, modern.
- Reference feeling: Vercel-level restraint with music software credibility.
- Product personality: precise studio tool, not a playful creator toy.
- What the UI should communicate: trust, clarity, structure, performance, and seriousness.

## Visual Summary
- Backgrounds are near-black, layered, and atmospheric, not flat.
- Surfaces are subtle and refined with thin borders, low-contrast fills, and controlled depth.
- Typography is large, crisp, and confident.
- Accent usage is restrained. White and grayscale lead. Cool highlights are secondary.
- Motion should feel expensive and quiet, never loud or gimmicky.

## Non-Negotiables
- Avoid bubbly or overly rounded UI.
- Avoid glassmorphism-heavy blur, candy gradients, and startup-looking glow effects.
- Avoid playful iconography or “AI slop” layouts.
- Avoid crowded feature grids without hierarchy.
- Avoid colorful accents dominating the page.
- Avoid decorative motion that competes with content.

## Border Radius
- Buttons: `10px`
- Small cards/inputs: `12px` to `16px`
- Major panels: `18px` to `22px`
- Do not use pill buttons or `rounded-full` for primary UI controls unless there is a very specific reason.

## Color System
- Primary background: near-black, slightly cool.
- Surface background: black with subtle tonal lift.
- Text primary: near-white.
- Text secondary: muted gray with strong readability.
- Accent: use sparingly for separators, active states, subtle highlights, and waveform details.
- Preferred accents:
  - white-based emphasis
  - cool blue/cyan undertones
  - very restrained green only if tied to signal/confirmation states

## Surface Language
- Use thin borders: `border-white/8` to `border-white/12`
- Use low-opacity fills: `bg-white/[0.02]` to `bg-white/[0.05]`
- Use soft but not glowy shadows.
- Surfaces should feel machined and precise.
- Panels should look like product UI, not marketing cards pasted onto a page.

## Typography
- Headings should feel sharp, high-contrast, and intentional.
- Large hero type is encouraged.
- Tight tracking is preferred for major headlines.
- Body copy should be calm and readable, never oversized for the sake of drama.
- Use mono sparingly for labels, diagnostics, and metadata.

## Layout Rules
- Large hero with strong negative space.
- Clear vertical rhythm.
- Fewer sections with stronger hierarchy beats.
- Product preview should appear early and feel real.
- Marketing should orbit the product, not replace it.

## Buttons
- Primary buttons should feel crisp and premium.
- Secondary buttons should be outlined or low-fill, never weak.
- Hover behavior:
  - slight lift
  - subtle border brightening
  - mild background shift
- Never use cartoonish scale or bounce on hover.

## Motion
- Motion goal: elegant, performant, confidence-building.
- Preferred animation properties:
  - `opacity`
  - `transform`
  - light blur only during entry transitions
- Entry motion:
  - content can rise slightly into place
  - stagger children carefully
  - above-the-fold content should animate on mount, not depend on viewport intersection
- Scroll motion:
  - cards and lower sections can reveal on scroll
  - keep stagger light
- Hover motion:
  - subtle lift
  - border/value emphasis
  - no exaggerated tilt, bounce, or floating

## Performance Rules
- Prioritize CSS transforms and opacity.
- Keep Framer Motion usage focused on high-impact areas only.
- Do not animate large blurred backgrounds continuously.
- No infinite decorative animations except very restrained waveform or signal treatments.
- Respect `prefers-reduced-motion`.

## Landing Page Rules
- Hero must include:
  - a strong product statement
  - a restrained announcement pill or context line
  - two clean CTAs
  - an early product/studio preview
- The hero should feel immediately premium even before scrolling.
- Supporting sections should reinforce:
  - workflow
  - product credibility
  - export structure
  - future extensibility

## Product UI Rules
- Studio UI should feel like an actual tool, not a landing page extended inward.
- Use panel-based layout with clear columns and information density.
- Labels should feel operational and system-like.
- Status states should be explicit and calm.
- File upload, analysis, and export flows should look intentional even when mocked.

## Copy Style
- Short, direct, product-focused.
- Avoid hype language.
- Avoid vague AI buzzwords.
- Prefer:
  - “structured output”
  - “review workspace”
  - “export-ready”
  - “signal”
  - “session”
  - “studio”
- Keep copy sounding like software, not ads.

## Do
- Keep the palette restrained.
- Keep corners tighter.
- Keep spacing generous.
- Let typography do the heavy lifting.
- Make the product preview feel authentic.
- Use motion to reinforce hierarchy.

## Don’t
- Don’t round everything aggressively.
- Don’t introduce random accent colors.
- Don’t add flashy gradients to compensate for weak layout.
- Don’t use oversized glowing blobs.
- Don’t let marketing visuals overpower the app UI.
- Don’t swap to a soft, friendly startup aesthetic.

## Implementation Guardrails
- New components should prefer shared primitives from `/frontend/components/ui`.
- Reuse the shared button system before inventing new button styles.
- Reuse utility and motion primitives before creating one-off animation patterns.
- New pages should inherit the same surface, border, and spacing language.
- If a new section feels “cool” but not “credible,” reject it.

## Future Prompt Snippet
- Use this when continuing Plexus work:

```md
Follow `design-system/MASTER.md` as the source of truth.
Keep Plexus in its current premium dark product direction:
- Vercel-like restraint
- sharp corners
- minimal palette
- subtle, performance-safe motion
- product-first layout
- no playful or overly rounded UI
```

## Porting To Another Project
- Copy this file first.
- Recreate:
  - button radius and hierarchy
  - panel border/fill language
  - hero spacing and type scale
  - restrained motion rules
- Reuse the same design vocabulary before writing code.

## Review Checklist
- Does this still look like premium software?
- Are the buttons sharp enough?
- Is the color palette restrained enough?
- Is the hero headline immediately visible and dominant?
- Does the product preview feel authentic?
- Are hover and reveal animations subtle and performant?
- Would this still feel at home next to Vercel-level product design?
