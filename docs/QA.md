# Expanded collection QA — 11 November 2026

This update adds thirteen original AI-generated designs and softens rectangular photo edges across the sixteen-card collection. The watercolor files are retained unchanged; new corners use a measured paper matte and a coordinating inner frame.

## Verification

- ESLint, TypeScript compilation, and production build passed.
- 91 unit tests passed, including proportion-preserving artwork fitting.
- **40 browser tests passed, 2 intentionally skipped.** The complete existing/expanded suite passed 37 tests in about six minutes, followed by 3 passing collage-independence checks. The skips are touch-only checks on non-touch projects; mobile touch checks passed.

Actual-artwork tests traverse every one of the sixteen cards at desktop (1440 × 1000), tablet (768 × 1024), and mobile (390 × 844) sizes. Each test uploads photos to every opening, personalizes allowed fields, compares decoded PNG pixels with the preview, verifies exact PNG/PDF dimensions, and audits the photo mask, matte corners, and artwork outside editable boxes. A separate test uses four distinct solid-color uploads to prove the collage stores and replaces each photo independently and blocks exports until all four are supplied.

Existing synthetic edge cases cover orientation, corruption, unsupported files, long/empty text, optional year, reset, mouse/keyboard/touch crop controls, foreground overlays, polygons, multiple slots, pending originals, aspect-ratio errors, and source-resolution warnings.

## Rounded-edge checks

- Main rectangular photos have a 38-design-pixel corner radius; small collage photos use 18.
- Matching paper-color mattes replace gray rectangle corners within the measured photo boxes.
- A thin four-design-pixel frame remains inside the photo mask.
- Sampled corner colors match the authored mattes, with no gray placeholder remnants.
- Sampled photo interiors contain no remaining neutral-gray placeholder. The audit excludes the antialiased inner-frame edge, where intentional frame/photo blending can itself be neutral.
- Sampled artwork outside the photo/text boxes is unchanged.
- Oval templates retain their traced curved openings.
- Preview and PNG use identical full-resolution compositing; PDF uses the same composited PNG.

## Screenshots

Gallery examples are labeled AI-generated sample photographs. Editor QA uses the same illustrative sample as a local upload. Embedded greetings in the thirteen new designs are preserved; family name/year are separate text. The three earlier text-free designs retain editable greetings.

[Desktop gallery](screenshots/expanded/desktop-gallery.jpg) · [Tablet gallery](screenshots/expanded/tablet-gallery.jpg) · [Mobile gallery](screenshots/expanded/mobile-gallery.jpg)

| Design                 | Personalized desktop screenshot                |
| ---------------------- | ---------------------------------------------- |
| Botanical Noel         | [Card 11](screenshots/expanded/desktop-11.jpg) |
| Cranberry Garland      | [Card 12](screenshots/expanded/desktop-12.jpg) |
| Winter Village         | [Card 13](screenshots/expanded/desktop-13.jpg) |
| Sage Scallop Collage   | [Card 14](screenshots/expanded/desktop-14.jpg) |
| Pinecone Keepsake      | [Card 15](screenshots/expanded/desktop-15.jpg) |
| Merry & Bright         | [Card 16](screenshots/expanded/desktop-16.jpg) |
| Cranberry Bows         | [Card 17](screenshots/expanded/desktop-17.jpg) |
| Holly & Pine           | [Card 18](screenshots/expanded/desktop-18.jpg) |
| Silent Night           | [Card 19](screenshots/expanded/desktop-19.jpg) |
| Christmas Tree Farm    | [Card 20](screenshots/expanded/desktop-20.jpg) |
| Gingerbread Christmas  | [Card 21](screenshots/expanded/desktop-21.jpg) |
| Christmas in the Woods | [Card 22](screenshots/expanded/desktop-22.jpg) |
| Home for Christmas     | [Card 23](screenshots/expanded/desktop-23.jpg) |
| Nutcracker Noel        | [Card 24](screenshots/expanded/desktop-24.jpg) |
| Blue Winter Village    | [Card 25](screenshots/expanded/desktop-25.jpg) |
| Sage Folk Christmas    | [Card 26](screenshots/expanded/desktop-26.jpg) |

Mobile examples: [four-photo collage](screenshots/expanded/mobile-14.jpg), [pinecone oval](screenshots/expanded/mobile-15.jpg), [navy](screenshots/expanded/mobile-19.jpg), [gingerbread](screenshots/expanded/mobile-21.jpg), and [sage folk](screenshots/expanded/mobile-26.jpg). Review screenshots are JPEGs for download size; full PNG screenshots of all sixteen editors at all three viewport sizes are captured in CI artifacts.

Visual review covers complete decorations, clean rounded/oval boundaries, clear greeting/name/year spacing, no duplicate greeting, and responsive editing controls.

## Practical limits

Original generated artwork provides approximately 212–216 ppi at 5 × 7 inches. The editor warns that 300 ppi output metadata adds no genuine source detail. Actual-size physical prints, printer color rendering, real Safari/iOS/Firefox devices, and external PDF-viewer rasterization remain unverified. The ten earlier owner-original designs remain separately pending and are not represented as the new generated artwork.

## Font-size controls update

User-selected sizes now apply to family names, optional years, and independently editable greetings. Embedded artwork greetings are preserved. ESLint, TypeScript, the production build, and 94 unit tests passed. The focused editor/crop/gallery/font regression run passed 40 browser tests, with two intentional non-touch skips. New checks verify larger text changes pixels only inside text boxes, resized PNG/preview identity, exact PDF page size, keyboard control, per-design size persistence, both reset actions, long-name fitted-size feedback, and invalid-overflow feedback. Full collection regressions also run in CI. See [font-size guide and screenshots](FONT_SIZES.md).

## Font selection and unrestricted sizes

Added six font options and a numeric point-size field without a fixed maximum. Explicit sizes bypass automatic fitting and the original text-box clip; defaults retain fitting. Preview and exports await selected fonts. Lora and Great Vibes are self-hosted with OFL licenses. See [the updated guide](FONT_SIZES.md).

Lint, TypeScript, production build, and 95 unit tests pass. Browser checks cover 48 pt year text beyond the old region, font changes, preview/PNG equality, PDF dimensions, sizes above 120 pt, per-card persistence, and Start Over on desktop/tablet/mobile.

## Botanical photo collection

Four new text-free backgrounds bring the collection to 20 designs. All typography remains editable; new designs are featured first. Photo masks preserve the arch, scalloped oval, three ornament frames, and garland ribbons. Sample 5 × 7 PDFs and visual evidence are in [the collection guide](BOTANICAL_COLLECTION.md). Lint, build, and 96 unit tests pass; 12 new browser cases pass across desktop/tablet/mobile. PDF samples were independently rasterized at 300 ppi for comparison with their PNGs.
