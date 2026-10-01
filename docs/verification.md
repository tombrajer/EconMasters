# Verification

- Production build and TypeScript check: pass.
- Automated tests: 7/7 pass, including registration validation, scroll bounds/reversal, reduced-motion completion, clean registration URL output, and prerendered content.
- Both routes checked at 390, 768, 1280, and 1440 pixels: no horizontal overflow.
- Native mobile menu opens, closes with Escape, and returns focus to its summary. FAQ toggles with Space.
- Live scroll graph progressed 0.460 → 1.000 → 0.460 when scrolling forward and back.
- All 12 permitted photographs loaded successfully. Six gallery images retained; missing judge photo represented by initials.
- Empty form produces seven field-specific errors and focuses the first field. Invalid email produces an email-specific error. Valid synthetic details produce a preview message explicitly saying nothing was sent and the team was not registered.
- Submission tested against a logged local static server. Seven asset/page GET requests before submission; exactly the same seven requests after submission. No submission request.
- `/register` served homepage HTML through Vite's SPA fallback initially. Added `dist/register.html` alongside the directory index; clean URL now serves registration HTML. Reload verified with zero new hydration errors.
- No location references found in source, public text, or prerendered pages. No request or storage API is used by application code.
- Reduced-motion behavior is covered by the graph test and CSS inspection; browser media emulation was unavailable. JavaScript-disabled behavior was checked in prerendered HTML (content present, native disclosures, preview button disabled), rather than a browser with scripting disabled.
- Mechanical design detector: one warning for Inter. Retained because the approved plan explicitly specifies Inter.

Screenshots are saved in `.impeccable/review/` (ignored build evidence). The registration page was recaptured from the document top after the route correction.

## Final review

Fresh review requested two copy corrections: mobile spaces around hidden line breaks, and truthful preview-only registration FAQ wording. Both were fixed, checked in the live mobile page, recaptured, and scored resolved by the reviewer. Final disposition: ship. The final build/typecheck and all seven tests passed after these corrections.

## Monochrome redesign — October 1, 2026

- Replaced the earlier visual direction with the latest three user references: black/white hero, dotted economic data field, ruled sections, and isometric economic diagrams. All permitted photographs remain, displayed in grayscale.
- Both routes checked at 390, 768, 1280, and 1440 pixels without horizontal overflow. Capture prefix: `mono-` in `.impeccable/review/`.
- Native canvas animation phase advances in the hero. Scrolling offscreen kept phase at 18.94 across three interactions; returning advanced it to 28.89. Resize redraws match the new viewport width.
- Journey progress observed at 0.843 → 1.000 → 0.218. FAQ Space toggle, mobile menu Escape, and seven required-field errors with first-field focus were rechecked.
- All 12 photos loaded. Console reported no errors. Application source still contains no request or storage API; registration behavior is unchanged.
- Hero reduced-motion and background-tab handling are implemented and inspected. Live reduced-motion emulation remains unavailable; static SVG fallback is included in prerendered HTML.
- Detector ran once: Inter warning retained to match the approved font and latest references.

### Monochrome finish review

The fresh reviewer requested two repairs: elevated white chart strokes disappeared against the white background, and the footer keyboard outline matched its dark background. Added dark backing strokes to the diagrams and a white footer focus outline. Rebuilt and reran all seven tests successfully. Desktop/mobile diagrams and a settled keyboard-focus capture confirmed the corrections. The reviewer scored both findings resolved and returned **ship**.

## Hero and motion refinement — October 1, 2026

- Removed the lower hero fact strip, scroll cue, visible model caption, and equilibrium overlay.
- Desktop journey now uses a compact three-column, two-row serpentine route. Section height measured 514px at 1440px, 548px at 768px, and 769px for the vertical mobile layout at 390px. No horizontal overflow at those widths.
- Restored original colors for all 12 existing photos. Added clipped gallery parallax and scroll-progress SVG curve drawing, using passive listeners and scheduled animation frames. Graph progress reversed from 1.000 back to 0.000 when returning to the top.
- Reduced motion completes curves and disables photo/diagram transforms. Without JavaScript, content and graph paths stay visible. Live reduced-motion emulation remains unavailable.
- Fresh scoped review approved the visual changes and requested a mobile parallax overscan clamp. Translation is now bounded to 3% of the photo-window height minus 1px, capped at 12px, preventing blank crop edges.
- Production build, type checking, and all seven automated tests passed after the changes. Console showed no errors. Registration behavior was unchanged.

The reviewer scored the overscan correction resolved and returned **ship** for the requested refinement.
