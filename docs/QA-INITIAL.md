# Verification record — 11 November 2026

## Executed checks

| Check | Result |
|---|---|
| `npm run lint` | Passed |
| TypeScript compilation, including browser tests | Passed |
| `npm run build` | Passed |
| `npm test` | 86 passed |
| `npm run test:e2e` with `/usr/bin/chromium` | 31 passed, 2 intentionally skipped |
| `npm audit --omit=dev --audit-level=high` | No production vulnerabilities reported |
| `git diff --check` | Passed |

The two skips are the mobile touch-only test on desktop and tablet; the same test passed on the mobile project. Final browser suite completed in approximately 1.5 minutes without failures. Tests ran in Chromium on Linux at 1440 × 1000, 768 × 1024, and 390 × 844. Earlier runs found an inaccessible slider label; explicit accessible names were added and all checks rerun successfully.

## Verified behavior

- All ten collection entries and correct editor selection; no image requests for missing originals.
- Unique original paths, ten synthetic layout screenshots per viewport, and missing-asset error states.
- JPEG/PNG decoding, landscape replacement, EXIF rotation, unsupported/corrupted image feedback, and preservation of a previous valid photo when a replacement fails.
- Zoom, drag, keyboard crop controls, reset crop, mobile pinch and touch pan.
- Shared photos and family/year fields across templates, independent template crops, and multiple independent photo openings.
- Required/optional fields, minimum-font overflow prevention, fitting longer names, reset confirmation/cancel.
- Exact 1500 × 2100 PNG with 300 ppi metadata; decoded PNG pixels equal the full-resolution preview.
- PDF has one page with an exact 360 × 504 point MediaBox. It uses a lossless PNG from the shared renderer; PDF rasterization in third-party viewers has not been pixel-tested.
- Sampled pixels outside edit regions remain identical to the synthetic source. No gray placeholder remains at the tested interior photo pixel.
- Rounded/polygon clipping and an independently authored test overlay preserve boundary pixels and correct layer order.
- Invalid artwork aspect ratios fail safely; undersized source artwork warns about native detail.
- No horizontal overflow at the tested viewport widths.

## Screenshot evidence

These are browser captures. **The geometric photo-card images in the synthetic editor captures are test fixtures, not the owner's holiday artwork.** A visible banner labels them accordingly. Production availability screenshots show the real missing-artwork state.

| Viewport | Gallery | Editor availability | Synthetic editor |
|---|---|---|---|
| Desktop | [Gallery](screenshots/desktop-gallery-awaiting-originals.png) | [Awaiting originals](screenshots/desktop-editor-awaiting-originals.png) | [QA fixture](screenshots/desktop-synthetic-editor.png) |
| Tablet | [Gallery](screenshots/tablet-gallery-awaiting-originals.png) | [Awaiting originals](screenshots/tablet-editor-awaiting-originals.png) | [QA fixture](screenshots/tablet-synthetic-editor.png) |
| Mobile | [Gallery](screenshots/mobile-gallery-awaiting-originals.png) | [Awaiting originals](screenshots/mobile-editor-awaiting-originals.png) | [QA fixture](screenshots/mobile-synthetic-editor.png) |

The gallery, availability state, all ten desktop synthetic layout captures, and edited desktop/mobile captures were visually inspected. This verifies the surrounding UI and synthetic layout/compositing only. It does **not** establish that the ten original templates are correct.

## Release blockers

None of the owner's original ten template images are present. Exact photo openings/masks, any genuinely necessary artist-authored overlays, and safe name/year areas remain unmeasured. Every production template remains `awaiting-artwork`; exports are disabled. No artwork extraction, substitution, or approximate watercolor reconstruction was performed.

After originals arrive, follow [template setup and approval](TEMPLATE_SETUP.md), integrate and inspect each design, compare preview/PNG/PDF to the original, and print an actual-size sample. Test real Safari/iOS and Firefox devices before release. This PR is an implementation for review, not approval to launch the collection.
