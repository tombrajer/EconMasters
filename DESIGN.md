---
name: Economics Masters Challenge
description: A monochrome economic field of original thinking.
colors:
  ivory: "#ffffff"
  paper: "#ffffff"
  navy: "#111111"
  muted: "#666666"
  blue: "#999999"
  line: "#dedede"
  hero: "#080808"
  previous-edition: "#fafafa"
  hover: "#333333"
  inverse-hover: "#dddddd"
  field-border: "#bbbbbb"
  plate-dots: "#bcbcbc"
typography:
  display:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "clamp(50px, 5.75vw, 84px)"
    fontWeight: 400
    lineHeight: 1.06
    letterSpacing: "-.04em"
  headline:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "clamp(34px, 3.7vw, 54px)"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-.035em"
  title:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "31px"
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: "-.035em"
  body:
    fontFamily: "Inter, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "monospace"
    fontSize: "10px"
    lineHeight: 1.5
    letterSpacing: ".025em"
rounded:
  angular: "0"
spacing:
  control: "16px"
  compact: "20px"
  card: "30px"
  grid: "40px"
  wide: "60px"
  section: "68px"
components:
  button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.ivory}"
    rounded: "{rounded.angular}"
    padding: "16px 28px"
  button-primary-hover:
    backgroundColor: "{colors.hover}"
  button-inverse:
    backgroundColor: "{colors.ivory}"
    textColor: "{colors.navy}"
    rounded: "{rounded.angular}"
    padding: "12px 15px"
  button-inverse-hover:
    backgroundColor: "{colors.inverse-hover}"
  text-link:
    textColor: "{colors.navy}"
  input:
    textColor: "{colors.navy}"
    rounded: "{rounded.angular}"
    padding: "12px 13px"
  round:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.navy}"
    rounded: "{rounded.angular}"
    padding: "30px 30px 62px"
---

# Design System: Economics Masters Challenge

## Overview

**Creative North Star: "The Economic Field"**

Black and white technical landscapes express an academic competition built around original thinking. Large, regular-weight sans-serif headings sit beside compact explanations; fine rules and dotted fields organize the white sections. An animated synthetic market landscape gives the dark hero its distinctive identity.

Real people and the first edition remain visible through the existing color photographs. Detailed material lives in native disclosures, keeping the initial page concise. The homepage and registration preview share the same angular controls, typography, navigation, and footer.

**Key Characteristics:**

- Black and white surfaces with neutral gray annotations.
- Large Inter headings, compact body copy, monospace model labels.
- Thin ruled divisions, dotted grids, simple economic diagrams.
- A moving market field and the existing scroll-drawn journey.
- Existing people and event photography in their original color.

Extracted from the implemented React 19.3, TypeScript 7.0.2, Vite 8.3.2 site. Source of truth: `src/styles.css`, `src/Home.tsx`, `src/components/MarketLandscape.tsx`, `src/components/Graphs.tsx`, and `src/components/Shared.tsx`. Later responsive CSS overrides take precedence. The user's latest references replace the earlier ivory/navy direction.

## Colors

The palette is achromatic. Legacy CSS names remain: `--ivory` and `--paper` are white, `--navy` is near-black, and `--blue` is gray.

### Primary

- **Ink** (`navy`): headings, primary buttons, diagram planes, journey strokes, and footer.
- **Market Black** (`hero`): hero and header backgrounds behind white curves and dots.

### Neutral

- **White** (`ivory`, `paper`): page surfaces, inverse buttons, and text on black.
- **Muted Gray** (`muted`): secondary explanations and metadata.
- **Diagram Gray** (`blue`): secondary graph geometry.
- **Rule Gray** (`line`): one-pixel section, row, disclosure, and card divisions.
- **Archive White** (`previous-edition`): prior-edition surface.
- **Control Grays** (`hover`, `inverse-hover`, `field-border`): hover and field states.
- **Plate Dot Gray** (`plate-dots`): academic diagram backgrounds.

**The Monochrome Rule.** Keep interface and diagrams achromatic; retain the original colors in people and gallery photographs. Do not restore the former blue/ivory palette.

## Typography

**Display and Body Font:** Inter, Arial, sans-serif. Regular, medium, and semibold files are self-hosted in `public/fonts`. Both `--serif` and `--sans` resolve to Inter. Libre Caslon Display remains declared but is unused in the current design.

**Label Font:** system monospace for models, round numbers, and market annotations.

### Hierarchy

- **Display:** frontmatter hero scale, two lines with the second line kept together at desktop. At 640px and below: `clamp(44px, 11.8vw, 70px)`, line-height 1.08, normal wrapping.
- **Headline:** frontmatter section scale, with established per-section overrides. Most section titles become 36px at 640px; the closing title becomes 44px.
- **Title:** 31px default; round titles 29px, academic titles 32px/1.2, founder names 26px. Judge names use 16px/1.3 at weight 600.
- **Body:** prose 15px/1.6, muted, up to 65ch. Hero description 20px/1.45; academic copy 18px/1.45, up to 30ch. Metadata uses 10–13px.
- **Label:** frontmatter model style. Round indices use 10px uppercase monospace with .13em tracking. Step numbers and times use tabular numerals.

Headings stay regular-weight and tightly tracked. `<em>` stays upright and achromatic. Keep visible sentences short; put additional detail in disclosures.

## Layout

Desktop containers use `min(1320px, calc(100% - 112px))`, centered, with 68px standard section padding. Fine rules separate groups; columns establish density.

- Hero: full-width black. Content columns 1.7fr/1fr, 60px gap, 65px top padding; market field 360px high. No lower fact strip, scroll cue, or visible model caption is present.
- About: 1.7fr/1fr. Format: three touching ruled cells. Journey: compact full-width header above a three-column, two-row serpentine SVG route; six stages follow the route left-to-right, then right-to-left.
- Academic rows: 1fr/1fr/1.05fr, 40px gaps, minimum 300px height. Label/title, diagram, and explanation repeat. Diagram columns have vertical rules and 6px dotted fields.
- Founders: three columns, compact name/role and biography disclosure. Judges: four horizontal portrait/name/role entries. Gallery: three columns, six existing photos, 1.5 aspect ratio.
- Registration: .85fr/1.15fr, 100px gap. Fields: two columns, 25px/30px gaps; textareas span both.

### Responsive behavior

- **1200px:** 40px gutters; major gaps/card padding compress; hero 1.6fr/1fr.
- **900px:** 28px gutters, 64px section padding; hero 1.5fr/1fr with stacked actions and 330px field. Format becomes two columns with the team cell spanning a row. Academic rows retain three columns, minimum 230px high. Judges/gallery become two columns.
- **640px:** 20px gutters, 52px section padding, 82px header with a native disclosure menu. Hero, paired text sections, format, founders, judges, FAQ, and registration stack. Journey returns to a narrow vertical graph beside six compact stages. Hero field is 265px. Academic title/diagram share two columns; explanation follows below; diagram side rules disappear. Founder portraits are 92px by 112px beside text. Gallery keeps two columns, 1.25 aspect ratio. Inputs use 16px text and the preview button fills its column. Closing decorative graph hides.
- **360px:** form fields become one column.

## Elevation & Depth

Surfaces are flat. Rules, contrasting black/white planes, and isometric diagrams create depth. Only mobile navigation has a shadow: `0 12px 24px #11111110`. Cards, rows, portraits, and buttons remain flat.

## Shapes

Angular corners and one-pixel borders are standard. Current controls and portraits have zero radius. Dotted fields use 6px spacing with .7px radial dots. Diagrams use points, curves, lines, and measured planes; geometry stays subordinate to readable copy.

## Components

### Buttons and links

Primary buttons use ink/white, matching one-pixel borders, 16px/28px padding, 54px minimum height, 13px type, and 28px icon gaps. Hover uses the dark-gray token. Disabled controls use .5 opacity and a not-allowed cursor. Hero buttons invert colors with 44px height, 12px/15px padding, and 11px type. Header registration uses 48px height and 15px/23px padding. Text links are underlined with thin inline SVG arrows. Focus outlines are 2px with 6px offset; dark surfaces use white.

### Navigation and footer

Shared dark header: ascending-bar brand mark, three anchor links, registration. Mobile `<details>` closes on anchor selection; Escape closes it and focuses the summary. Retain the skip link. Shared ink footer uses the same brand, fine gray rules, contact link, and compact navigation.

### Ruled cards and disclosures

Format cells touch inside one ruled group. Each has a small economic graph, round number, compact lead, and topics/scoring disclosure. A dotted band anchors its lower edge. Founder biographies, schedule, and FAQs remain native disclosures with plus/minus indicators.

### Inputs and registration preview

Transparent square fields: one-pixel gray border, minimum 46px height, 12px/13px padding. Hover darkens the border; focus adds a 2px ink outline with 3px offset. Grayscale errors pair `aria-invalid` with associated text. Group legends and indices create hierarchy.

Both `/` and `/register` share the system. Registration validates only a local preview: no submission, storage, backend, or claim that a team is registered. Preserve the explicit notice, preview button label, and completion wording.

### MarketLandscape

Signature native 2D canvas: synthetic wave dots, supply/demand curves, sampled circular points, and moving markers. It is illustrative, never real market data. The hero has no overlay or bottom captions. Its accessible figure label identifies the illustrative model.

`requestAnimationFrame` draws approximately every 32ms (about 30fps). Device pixel ratio is capped at 2; dot columns are 62 below 600px canvas width, otherwise 110. `ResizeObserver` sizes the surface; `IntersectionObserver` and document visibility pause offscreen/hidden animation. Reduced motion draws a static frame without starting a loop. Cleanup removes listeners/observers. The SVG fallback remains visible until canvas initialization succeeds, including without JavaScript.

### EconomicPlate and scroll journey

Static academic SVGs use a black isometric plane, gray grid, and white frontier/data/network geometry on a dotted white field. Elevated white paths have black backing strokes so geometry remains visible outside the black plane. Preserve that treatment. Format graphs stay simpler and planar.

Economic curve paths draw progressively on viewport entry, with slight diagram translation. Gallery photos use a clipped parallax shift up to 12px, bounded by each photo’s available crop area, and 1.06 scale. Reduced motion shows complete curves and untransformed photos. The six-stage journey draws its path as the user scrolls; a dot tracks its endpoint. Passive scroll events schedule one animation frame; resize and motion-preference changes refresh progress. Reduced motion shows the completed path. Global reduced-motion CSS removes transitions/animations and sets automatic scrolling.

## Do's and Don'ts

### Do:

- **Do** use the current monochrome variables even where legacy names suggest color.
- **Do** keep headings in Inter, body copy concise, and model annotations in monospace.
- **Do** organize sections with rules and dotted fields.
- **Do** retain all 12 existing people/event photos in their original colors.
- **Do** preserve native disclosures, keyboard focus, static motion alternatives, and the SVG hero fallback.
- **Do** distinguish confirmed 2026 content from the unannounced next edition and preserve registration-preview wording.

### Don't:

- **Don't** restore ivory, navy-blue, colored accents, or serif display type.
- **Don't** add city imagery, stock photography, testimonials, or invented participation claims.
- **Don't** add rounded floating cards, broad shadows, or extra decorative animation.
- **Don't** present the synthetic hero as a factual market chart.
- **Don't** animate the canvas while offscreen, hidden, or reduced motion is requested.
- **Don't** remove black backing from white SVG paths extending beyond the diagram plane.
