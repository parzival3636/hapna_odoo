---
name: Editorial Enterprise
colors:
  surface: '#f8f9ff'
  surface-dim: '#d8dae0'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3f9'
  surface-container: '#eceef3'
  surface-container-high: '#e7e8ee'
  surface-container-highest: '#e1e2e8'
  on-surface: '#191c20'
  on-surface-variant: '#464555'
  inverse-surface: '#2e3135'
  inverse-on-surface: '#eff0f6'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#006c49'
  on-secondary: '#ffffff'
  secondary-container: '#6cf8bb'
  on-secondary-container: '#00714d'
  tertiary: '#3130c0'
  on-tertiary: '#ffffff'
  tertiary-container: '#4b4dd8'
  on-tertiary-container: '#d9d8ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#e1e0ff'
  tertiary-fixed-dim: '#c0c1ff'
  on-tertiary-fixed: '#07006c'
  on-tertiary-fixed-variant: '#2f2ebe'
  background: '#f8f9ff'
  on-background: '#191c20'
  surface-variant: '#e1e2e8'
typography:
  h1:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  h3:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
  gutter: 24px
  margin: 32px
---

## Brand & Style

The design system is anchored in an **Editorial Minimalism** aesthetic, blending the authoritative clarity of high-end journalism with the functional precision of modern enterprise software. It is designed for professional environments where data density must be balanced with visual breathing room and sophisticated hierarchy.

The brand personality is intellectual, composed, and trustworthy. By utilizing a serif typeface for headlines, the design system distances itself from generic SaaS aesthetics, instead evoking a sense of heritage and permanence. The layout prioritizes whitespace and structured alignment to ensure that complex dashboard information remains legible and calm.

## Colors

The palette is intentionally restrained to maintain a "White Theme" feel while providing enough contrast for accessibility. 

- **Background:** A cool-toned off-white (`#F8F9FF`) serves as the canvas, providing a subtle distinction from white surface containers.
- **Surface:** Pure white (`#FFFFFF`) is reserved for interactive cards, sidebars, and modals to create a "lifted" effect.
- **Primary Accent:** Deep Indigo (`#4F46E5`) is the sole driver of action, used for primary buttons, active navigation states, and progress indicators.
- **Success:** Emerald Green (`#10B981`) is used sparingly for positive data trends and completed statuses.
- **Neutrals:** A range of slate grays are used for typography and subtle borders (`#E2E8F0`) to maintain a soft, professional structure without harsh black lines.

## Typography

This design system employs a dual-typeface strategy to create an editorial feel.

- **Headlines:** Uses a sophisticated serif (Newsreader/Garamond-style) to provide a distinctive, high-contrast look for page titles and section headers. 
- **Functional UI:** Uses Inter for all body text, inputs, labels, and data points. Inter's high x-height and neutral character ensure maximum legibility in dense dashboard views.
- **Hierarchy:** Large headings should use slightly tighter letter-spacing. Small labels utilize uppercase styling with increased tracking to differentiate them from body copy.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. Navigation and sidebars are fixed, while the main content area utilizes a fluid 12-column grid to maximize dashboard real estate.

- **Rhythm:** An 8px base unit (with a 4px half-step for tight UI) governs all padding and margins. 
- **Whitespace:** Generous external margins (`32px`) and internal container padding (`24px`) are mandatory to maintain the minimal, editorial feel. 
- **Density:** While the dashboard is enterprise-grade, "data-breathing" is prioritized. Lists and tables should favor ample row height (`48px` to `56px`) over extreme density.

## Elevation & Depth

Depth is achieved through a combination of **Tonal Layering** and **Soft Shadows**. 

- **Tiers:** Level 0 is the background (`#F8F9FF`). Level 1 is the primary surface (`#FFFFFF`). Level 2 (modals/popovers) uses the same surface color but is distinguished by elevation.
- **Shadows:** Avoid heavy or dark shadows. Use extra-diffused, low-opacity indigo-tinted shadows (e.g., `rgba(79, 70, 229, 0.04)`) to create a sense of lightness.
- **Borders:** All surface containers must have a subtle `1px` border in `#E2E8F0`. This ensures structural integrity even when shadows are subtle.

## Shapes

The design system utilizes **Rounded-XL** as its primary geometric language.

- **Containers:** Dashboard cards, modals, and main content wrappers use a `1.5rem` (24px) corner radius.
- **Small Elements:** Buttons, input fields, and tags use a `0.5rem` (8px) radius to maintain a cohesive but slightly more precise look.
- **Consistency:** Sharp corners are prohibited. Every interactive and containing element must feel approachable and soft.

## Components

- **Buttons:** Primary buttons are solid Deep Indigo with white text. Secondary buttons use a white background with a subtle border and Indigo text. Use `rounded-lg` for all button shapes.
- **Cards:** White surfaces with a `1px` border and the standard `rounded-xl` radius. Headlines within cards should use the serif typeface.
- **Input Fields:** Clean, minimal borders (`#E2E8F0`) that transition to Indigo on focus. Labels sit outside the field in Inter (Semi-bold, 12px).
- **Chips/Tags:** Used for status. Success chips use a very pale Emerald background with Emerald text. Neutral tags use the background color (`#F8F9FF`).
- **Data Tables:** Borderless rows with a subtle divider line. The header row should use `label-caps` typography for a professional, institutional look.
- **Navigation:** Vertical sidebar navigation uses high whitespace. Active states are indicated by a subtle Indigo "pill" background or a left-aligned thick vertical stroke.