---
name: Editorial Professional
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#464555'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
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
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-xl:
    fontFamily: Newsreader
    fontSize: 60px
    fontWeight: '600'
    lineHeight: 72px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 36px
    fontWeight: '600'
    lineHeight: 44px
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is anchored in the tradition of high-end editorial publications, adapted for a modern digital context. It prioritizes clarity, authority, and trust through a disciplined use of whitespace and a refined typographic hierarchy. 

The visual style is **Minimalist-Professional**, utilizing a high-contrast palette to guide the eye toward content without unnecessary decorative friction. The emotional response is intended to be one of calm intelligence—providing a sophisticated environment where information feels curated rather than cluttered. By blending classic serif elements with a functional sans-serif foundation, the design system strikes a balance between timeless tradition and contemporary efficiency.

## Colors

The palette is restrained to maintain an editorial focus. The background uses a subtle off-white to reduce eye strain while maintaining a crisp, paper-like feel. 

- **Primary Accent:** Deep Indigo (#4F46E5) is used for key actions, focus states, and primary brand moments. It should be paired with subtle linear gradients (Indigo to a slightly darker shade) to add depth to interactive elements.
- **Surface & Neutrals:** Surfaces rely on pure white (#FFFFFF) to pop against the background. Borders use a soft Slate (#e2e8f0), while text spans from a deep Ink (#0f172a) for headings to a lighter Slate (#64748b) for secondary information.
- **Functional Colors:** Use success (Emerald), warning (Amber), and error (Rose) sparingly, ensuring they adhere to the overall desaturated and professional tone.

## Typography

This design system uses a dual-font strategy to establish a clear hierarchy. 

**Newsreader** serves as the primary headline face. Its classic serif terminals and variable weights provide an authoritative, editorial feel. It should be used for all page titles, section headers, and pull quotes.

**Inter** provides the functional backbone. It is used for all body copy, UI labels, and inputs to ensure maximum legibility at small sizes. For labels and navigation items, use a semi-bold weight with slight tracking increases to maintain a professional, systematic appearance.

## Layout & Spacing

The layout philosophy follows a **Fixed Grid** model on desktop to mimic the structured columns of a premium journal, transitioning to a fluid model on smaller viewports. 

A 12-column grid is standard for desktop layouts, with generous 24px gutters to allow the content to breathe. Vertical rhythm is established using a 4px baseline unit, ensuring that all margins and paddings are multiples of this base (e.g., 8px, 16px, 24px, 32px, 64px). Large-scale layouts should utilize asymmetrical white space—often leaving a wide gutter or "marginalia" space—to emphasize the editorial aesthetic.

## Elevation & Depth

Depth is conveyed through **Ambient Shadows** and **Tonal Layers**. Instead of heavy shadows, this design system uses "diffused whispers" of depth to maintain a clean, flat aesthetic.

- **Level 0:** The #f8f9ff background.
- **Level 1 (Cards):** Pure white background with a 1px border (#e2e8f0) and a very soft, multi-layered shadow (0 4px 6px -1px rgba(0, 0, 0, 0.05)).
- **Level 2 (Dropdowns/Modals):** A slightly more pronounced shadow (0 10px 15px -3px rgba(0, 0, 0, 0.1)) to indicate clear separation from the primary surface.
- **Interactive States:** Buttons and interactive cards may lift slightly on hover, increasing shadow spread without increasing opacity.

## Shapes

The design system utilizes a "Soft" geometric language. While headlines are traditional, the UI containers are modernized with a uniform 12px (rounded-xl) corner radius for cards and larger containers. 

Buttons and input fields should follow a slightly tighter 8px (rounded-lg) radius to feel more precise and technical. Small elements like chips or badges may use a full pill-radius to provide visual contrast against the more structured rectangular components.

## Components

- **Buttons:** Primary buttons use the Deep Indigo (#4F46E5) with a subtle top-to-bottom gradient (Indigo-500 to Indigo-600). Text is white, medium-weight Inter. Secondary buttons use a white background with a Slate-200 border.
- **Cards:** White surfaces with 12px rounded corners and a 1px #e2e8f0 border. Use generous internal padding (typically 24px or 32px) to reinforce the premium feel.
- **Input Fields:** Minimalist design with a 1px border. On focus, the border transitions to Primary Indigo with a soft 3px outer glow.
- **Chips/Tags:** Small, capitalized Inter labels with high letter-spacing. Use a very light Indigo or Slate tint for the background to keep them secondary to the main content.
- **Lists:** Clean, border-bottom separation only (#e2e8f0). Remove bullets in favor of indented typographic hierarchy or subtle Indigo icons.
- **Data Tables:** High-contrast headers in bold Inter (label-sm style) with thin horizontal dividers and zero vertical borders.