---
name: Bennett Hatchery IPMS
description: Institutional Intellectual Property Management System for Bennett University Centre for Innovation & Entrepreneurship
colors:
  bg-deep: "#0f172a"
  bg-black: "#000000"
  text-primary: "#ffffff"
  text-muted: "rgba(255, 255, 255, 0.8)"
  text-subtle: "rgba(255, 255, 255, 0.5)"
  glass-surface: "rgba(255, 255, 255, 0.10)"
  glass-surface-hover: "rgba(255, 255, 255, 0.15)"
  glass-border: "rgba(255, 255, 255, 0.20)"
  glass-arrow-bg: "rgba(255, 255, 255, 0.15)"
  glass-arrow-hover: "rgba(255, 255, 255, 0.25)"
typography:
  display:
    fontFamily: "var(--font-bruno), 'Bruno Ace SC', sans-serif"
    fontWeight: 400
    lineHeight: 1.12
  technical:
    fontFamily: "var(--font-aldrich), 'Aldrich', sans-serif"
    fontWeight: 400
  body:
    fontFamily: "var(--font-geist-sans), sans-serif"
    fontWeight: 400
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.glass-surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.xl}"
    padding: "6px"
  button-nav:
    backgroundColor: "rgba(255, 255, 255, 0.15)"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
---

# Design System: Bennett Hatchery IPMS

## 1. Overview
The Bennett Hatchery Intellectual Property Management System (IPMS) landing interface follows a cinematic, institutional, and technical aesthetic. Rooted in deep space and orbital planetary motion, the experience communicates serious intellectual rigor, security, and forward-looking institutional backing provided by Bennett University's Centre for Innovation & Entrepreneurship (CIE).

The visual world bridges high-tech aerospace futurism with institutional restraint, prioritizing crisp geometric typography, optical glassmorphism, and minimal cognitive friction for startup founders entering the assessment pipeline.

---

## 2. Colors

### Palette Strategy
The color architecture relies on a dark cosmos baseline overlaid with monochromatic frosted glass surfaces, punctuated by crisp white typography.

| Token | CSS Value | Usage |
| :--- | :--- | :--- |
| `bg-deep` | `#0f172a` (Slate 900) | Root canvas fallback and deep atmospheric baseline |
| `text-primary` | `#ffffff` | Headings, button labels, key metrics |
| `text-muted` | `rgba(255, 255, 255, 0.8)` | Subheadings, eyebrow uppercase badges |
| `text-subtle` | `rgba(255, 255, 255, 0.5)` | Metric secondary descriptive labels |
| `glass-surface` | `rgba(255, 255, 255, 0.10)` | Interactive CTA container surface |
| `glass-border` | `rgba(255, 255, 255, 0.20)` | Optical stroke definition on glass cards |
| `glass-arrow-bg` | `rgba(255, 255, 255, 0.15)` | Action indicator container background |

---

## 3. Typography

### Font Hierarchy

1. **Display & Headings: `Bruno Ace SC`**
   - **Role**: Primary Title & Identity Expression
   - **Characteristics**: Wide geometric uppercase glyphs with technical aerospace cutouts
   - **Sizes**: `text-3xl` (mobile) to `text-7xl` (desktop), `leading-[1.12]`

2. **Technical Interface & Metrics: `Aldrich`**
   - **Role**: Eyebrows, Button Actions, Metric Numerals, and Secondary Labels
   - **Characteristics**: Crisp, modern retro-tech monoline proportions
   - **Sizes**:
     - Eyebrow: `text-xs` / `text-sm`, `tracking-[0.25em]`
     - Primary CTA: `text-base` / `text-lg`, `tracking-[0.05em]`
     - Metric Numerals: `text-3xl` / `text-4xl`, `leading-none`
     - Metric Labels: `text-[11px]`, `leading-snug`

3. **Body & Utility: `Geist Sans`**
   - **Role**: General descriptive text and fallback data display

---

## 4. Layout

### Full-Bleed Spatial Canvas
- **Viewport Dimension**: Full-bleed `100vh` × `100vw` with `overflow-hidden`.
- **Z-Index Layering**:
  1. `z-0`: Continuous looping orbital video backdrop (`object-cover`).
  2. `z-0 (Overlays)`: Layered radial and vertical darkness gradients ensuring contrast compliance across variable video frames.
  3. `z-10`: Centralized hero content (eyebrow, headline, primary action button) and fixed bottom-right metric telemetry.
  4. `z-20`: Floating atmospheric navigation bar.

### Spatial Spacing
- **Header**: `h-28` to `h-36`, `px-6` to `px-10`, flex alignment separating the university hatchery emblem from authentication controls.
- **Hero Centerpiece**: Vertically and horizontally centered flex column with responsive gap scaling (`mb-5` to `mb-6` under eyebrow, `mt-8` to `mt-10` above CTA).
- **Metric Telemetry**: Pinned to `bottom-8 right-8` to `bottom-10 right-10`, right-aligned horizontal cluster.

---

## 5. Elevation & Depth

### Atmospheric Glassmorphism
- Depth is achieved via physical blur and refractive transparency rather than drop shadows.
- **Backdrop Blur**: `backdrop-blur-xl` on major interactive containers; `backdrop-blur-md` on secondary pills.
- **Border Treatment**: 1px crisp translucent border (`border-white/20` to `border-white/30`) simulating light bouncing off polished glass chamfers.
- **Ambient Shadow**: `shadow-xl shadow-indigo-950/30` anchoring glass elements softly against dynamic planetary surfaces.

---

## 6. Shapes & Radii

- **Navbar Auth Button**: Fully pill-shaped (`rounded-full`) for quick recognition as a utility control.
- **Primary CTA Container**: Rounded rectangle (`rounded-2xl`, `p-1.5`) providing modern structural solidity.
- **Internal Action Box (Arrow Container)**: `rounded-xl`, filling height via `self-stretch` to create balanced, nested concentric corners.

---

## 7. Components

### Primary CTA: "Begin Startup IP Assessment"
- **Structure**: Compound action pill featuring text trigger and isolated kinetic target.
- **Container**: `inline-flex items-center p-1.5 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl hover:bg-white/15 hover:border-white/30 transition-all duration-300`.
- **Text Unit**: `px-6 sm:px-8 py-2.5 sm:py-3 tracking-[0.05em] font-aldrich text-white font-semibold`.
- **Arrow Box**: `self-stretch flex items-center justify-center px-4 sm:px-5 rounded-xl bg-white/15 backdrop-blur-sm group-hover:bg-white/25`.
- **Motion**: Arrow glyph shifts `+2px` rightwards on hover (`group-hover:translate-x-0.5`).

### Secondary Action: "CIE Team Login"
- **Container**: `rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 border border-white/30 backdrop-blur-md px-5 py-2.5 text-[13.5px] font-semibold text-white tracking-[0.05em] font-aldrich`.

### Telemetry Counter Block
- **Layout**: Tri-column right-aligned metric cluster.
- **Metric Structure**:
  - Value: Large numeric display (`text-3xl` / `text-4xl`, `font-aldrich`, `text-white`).
  - Label: Secondary descriptive unit (`text-[11px]`, `text-white/50`, `max-w-[120px]`).

---

## 8. Do's and Don'ts

### Do
- Maintain pure optical glassmorphism with high backdrop-blur values (`backdrop-blur-xl`).
- Use `Bruno Ace SC` strictly for top-level brand and product headlines.
- Use `Aldrich` with purposeful tracking (`tracking-[0.05em]` to `tracking-[0.25em]`) on technical markers and buttons.
- Keep the background video full-bleed (`100vh` / `100vw`) with protective gradient overlays to ensure text remains accessible at all times.

### Don't
- Do not introduce high-saturation neon or solid background colors that break the cosmic glass aesthetic.
- Do not wrap the landing hero inside padded or bounded cards; the landing background must remain edge-to-edge full screen.
- Do not apply drop-shadow outlines or glow effects to display headlines; let the font and contrast gradient do the work.
- Do not use generic system sans-serif fonts for buttons or numeric metrics.
