---
name: Editorial Sophistication
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#464555'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#5b598c'
  on-secondary: '#ffffff'
  secondary-container: '#c7c3fe'
  on-secondary-container: '#514f81'
  tertiary: '#7e3000'
  on-tertiary: '#ffffff'
  tertiary-container: '#a44100'
  on-tertiary-container: '#ffd2be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#e3dfff'
  secondary-fixed-dim: '#c4c1fb'
  on-secondary-fixed: '#181445'
  on-secondary-fixed-variant: '#444173'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb695'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-h1:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.3'
  headline-h2:
    fontFamily: Playfair Display
    fontSize: 30px
    fontWeight: '600'
    lineHeight: '1.3'
  subheading:
    fontFamily: Libre Baskerville
    fontSize: 20px
    fontWeight: '700'
    lineHeight: '1.5'
  body-lg:
    fontFamily: Libre Baskerville
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.7'
  body-md:
    fontFamily: Libre Baskerville
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-sm:
    fontFamily: Libre Baskerville
    fontSize: 12px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-page: 64px
  stack-sm: 16px
  stack-md: 32px
  stack-lg: 64px
---

## Brand & Style

This design system is built upon the principles of **Editorial Minimalism**. It evokes the feeling of a high-end broadsheet or a luxury boutique journal, prioritizing clarity, literary authority, and architectural order. The brand personality is poised and intellectual, designed for users who value substance and a calm, focused environment.

The visual style avoids the ephemeral trends of heavy blurs and neon accents. Instead, it relies on the rhythmic interplay of classical serif typography and expansive white space. Every element is intentional, creating an atmosphere of quiet confidence and professional reliability.

## Colors

The palette is strictly curated to emphasize the "White-Theme" aesthetic. The primary color, a deep Indigo (#4F46E5), is reserved for meaningful actions and critical focal points. 

- **Primary:** Used for buttons, active navigation states, and primary iconography.
- **Surface & Background:** Pure White (#FFFFFF) serves as the foundation. Very light gray (#F9FAFB) is utilized for content grouping and subtle section breaks.
- **Typography Colors:** Use a deep slate-gray for body text to maintain readability without the harshness of pure black, ensuring the editorial feel remains soft yet legible.
- **Accents:** Low-opacity indigo tints or light grays are used for borders and dividers to maintain a lightweight UI footprint.

## Typography

Typography is the core identity of this design system. By pairing two distinct serifs, the UI achieves a "traditional-modern" hybrid look.

- **Playfair Display:** Used for prominent headlines and display text. Its high-contrast strokes add elegance and a sense of legacy.
- **Libre Baskerville:** Utilized for subheadings, body copy, and labels. It offers exceptional legibility in long-form text while maintaining the classic editorial aesthetic.
- **Hierarchy:** Maintain generous line heights (1.6 to 1.7 for body text) to ensure the interface feels breathable and easy to digest.

## Layout & Spacing

This design system employs a **Fixed Grid** model for desktop to preserve the structured feel of a printed page. Content is centered within a maximum width container with expansive outer margins.

- **Grid:** A 12-column grid provides the framework, using wide gutters to prevent visual clutter.
- **Whitespace:** Emphasize vertical rhythm through "stack" spacing. Use larger gaps (64px+) between major sections to allow the typography to breathe.
- **Alignment:** Consistent left-alignment for text blocks mimics magazine layouts, while centered layouts are reserved for high-impact landing sections.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layering** and **Low-contrast Outlines** rather than heavy shadows.

- **Surfaces:** Use the light gray background (#F9FAFB) to define secondary areas like sidebars or content wells against the pure white primary background.
- **Borders:** Use subtle 1px borders (#E2E8F0) to define cards and input fields.
- **Shadows:** If depth is required for modals or dropdowns, use a single, highly diffused "Ambient Shadow" with 4% opacity and a 20px-30px blur. Avoid multi-layered or colored shadows to maintain the clean aesthetic.

## Shapes

The shape language is refined and professional. By utilizing a "Soft" roundedness level, the design system avoids the clinical feel of sharp corners while remaining more disciplined than pill-shaped consumer apps.

- **Standard Elements:** Buttons and input fields use a consistent 0.25rem (4px) radius.
- **Containers:** Larger elements like cards or featured image containers may use up to 0.5rem (8px) to provide a gentle containerized feel.
- **Icons:** Should be stroke-based (linear) with a consistent 1.5px or 2px weight to match the weight of the typography.

## Components

### Buttons
Primary buttons use the solid Indigo (#4F46E5) background with white text. Secondary buttons should use a 1px Indigo border with Indigo text. Active and hover states are subtle shifts in saturation or a light indigo background tint.

### Input Fields
Fields feature a white background with a subtle gray border. On focus, the border transitions to Indigo. Error states should use a muted brick-red, ensuring it doesn't clash with the primary indigo.

### Cards
Cards are defined by their white background and 1px light gray border. They do not use shadows by default. Content within cards should follow the editorial spacing rules, with a minimum of 24px padding on all sides.

### Lists & Navigation
Navigation items use Libre Baskerville in bold label styles. Use subtle indigo underlines or a small side-bar indicator for active states. Avoid heavy background fills for navigation highlights.

### Chips & Tags
Tags are rendered in light gray (#F9FAFB) with small caps or bold label text. They should have the same 4px radius as buttons to maintain shape consistency.