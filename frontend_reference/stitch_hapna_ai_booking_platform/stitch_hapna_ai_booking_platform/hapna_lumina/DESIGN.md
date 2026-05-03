---
name: Hapna Lumina
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
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  h1:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h2:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  h3:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
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
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
  button:
    fontFamily: Inter
    fontSize: 15px
    fontWeight: '600'
    lineHeight: '1.0'
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 0.5rem
  sm: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  gutter: 24px
  margin: 32px
  max-width: 1280px
---

## Brand & Style

The brand personality is rooted in **Effortless Precision**. As an AI-powered omnichannel platform, it must convey a sense of calm intelligence—anticipating user needs without overwhelming them. The target audience includes high-growth service providers, enterprise recruiters, and modern entrepreneurs who value time as their most precious asset.

The design style is **Corporate Modern with a Tactile Polish**. It blends the structural reliability of a traditional SaaS platform with the soft, approachable aesthetics of contemporary consumer tech. By utilizing spacious layouts, smooth gradients, and rounded geometry, the system evokes a feeling of trustworthiness and premium quality, reminiscent of top-tier scheduling tools like Cal.com.

## Colors

The palette is anchored by **Deep Indigo**, a color that signals professional stability and technological depth. This is paired with an **Emerald Green** accent specifically reserved for "success" states, active status badges, and conversion-critical highlights.

- **Primary Canvas**: A clean white (#FFFFFF) base for maximum readability.
- **Sectioning**: Light Gray (#F9FAFB) is used for alternating dashboard sections and sidebar containers to create subtle visual grouping without heavy borders.
- **Text Hierarchy**: Headings use Slate-900 for high-contrast authority, while body text uses Slate-600 to reduce visual fatigue during long booking sessions.
- **Gradients**: Use a soft linear transition from Deep Indigo (#4F46E5) to its lighter variant (#6366F1) for primary actions and brand moments.

## Typography

This system utilizes **Inter** exclusively for its utilitarian excellence and exceptional legibility at small sizes—crucial for dense scheduling views. 

The type scale is designed to be highly functional:
- **Headlines**: Tight letter-spacing and heavy weights to create a "premium" editorial feel.
- **Body**: Generous line heights (1.6) to ensure the platform feels airy and accessible even when filled with data.
- **Labels**: Small, uppercase labels provide clear categorization for metadata (e.g., timezone, event duration) without competing with primary content.

## Layout & Spacing

The layout follows a **Fixed-Fluid Hybrid** model. Large dashboard screens use a 12-column grid with a maximum content width of 1280px to prevent information stretching. 

- **Grid**: 12 columns, 24px gutters, and 32px outer margins.
- **Rhythm**: All spacing is based on a 4px baseline unit. 
- **Density**: The interface favors "Low Density" in configuration screens (large padding) and "Medium Density" in calendar/scheduling views to balance white space with information utility.

## Elevation & Depth

Hierarchy is established through **Tonal Layering and Ambient Shadows**. 

- **Surface Layers**: The primary background is #FFFFFF. Secondary containers (like sidebars or card headers) sit on #F9FAFB.
- **Shadow Character**: Shadows are diffused and "heavy" in spread but "light" in opacity. Use a subtle Deep Indigo tint (e.g., `rgba(79, 70, 229, 0.05)`) in the shadow to maintain brand harmony.
- **Interactive States**: Elements like cards should lift slightly on hover through an increased shadow blur, rather than a color change, to maintain a premium feel.

## Shapes

The shape language is defined by **Friendly Geometry**. 

- **Cards & Containers**: Use `rounded-xl` (1.5rem / 24px) to create a soft, modern frame for content.
- **Buttons**: Use `rounded-full` for all primary and secondary actions. This distinct pill-shape separates interactive triggers from static content containers.
- **Inputs**: Use a more conservative `rounded-lg` (1rem / 16px) to maintain a sense of formal input structure.

## Components

### Buttons
- **Primary**: Gradient fill (Indigo-600 to Indigo-500), white text, `rounded-full`.
- **Secondary**: Slate-100 background, Slate-900 text, `rounded-full`.
- **Ghost**: No background, Indigo-600 text, for low-priority actions.

### Cards
- **Style**: White background, `rounded-xl` corners, 1px Slate-200 border, and a "Soft" shadow level.
- **Header**: Use a Light Gray (#F9FAFB) top-section for complex cards to separate titles from body content.

### Input Fields
- **Standard**: 16px padding, `rounded-lg`, 1px Slate-200 border. On focus, the border transitions to Deep Indigo with a 3px soft indigo glow (ring).

### Badges & Chips
- **Status**: Small, `rounded-full`, with Emerald Green backgrounds at 10% opacity and Emerald-700 text for high readability.

### AI Indicators
- **Style**: Components assisted by AI should feature a subtle gradient border or a small Emerald Green sparkle icon to denote "Omnichannel Intelligence."