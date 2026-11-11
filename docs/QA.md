# Watercolor collection verification — 11 November 2026

The owner requested integration of three newly generated concepts: Botanical Noel, Cranberry Garland, and Winter Village. This record supersedes the initial missing-artwork implementation record in [QA-INITIAL.md](QA-INITIAL.md).

## Checks

- ESLint passed.
- TypeScript compilation, including browser tests, passed.
- Production build passed.
- 89 unit tests passed.
- Browser suite: **37 passed, 2 intentionally skipped** in approximately two minutes. The skips are the mobile-only touch test on desktop/tablet; the mobile gesture test passed.

Browser coverage includes the actual three artwork files and the existing isolated synthetic tests for masks, foreground overlays, multiple slots, EXIF orientation, input failures, cropping, switching, fitting long/empty text, optional year, and confirmed reset. Projects use Chromium at 1440 × 1000, 768 × 1024, and 390 × 844. Touch-only tests run on the mobile project.

## Actual-artwork checks

For every new design, at each viewport:

- Gallery loads the three distinct artwork files and renders labeled sample-family previews through the shared compositor.
- User upload is required before download. No photo is POSTed to a server.
- Greeting, family name, and year update independently from artwork.
- PNG is exactly 1,500 × 2,100 and decoded pixels are identical to the live preview.
- PDF is a single 360 × 504 point page (5 × 7 inches).
- Source-resolution warning remains visible for native 1,060 × 1,484 artwork.
- A saturated diagnostic photo reveals no remaining neutral-gray placeholder at sampled interior points.
- Sampled pixels outside the configured photo/text regions remain identical to the unmodified artwork raster.
- Gallery and editor have no horizontal overflow at the tested viewport widths.

## Screenshots

These captures show the **new actual artwork**, with an AI-generated sample family portrait used as an upload for QA. They are not the earlier synthetic geometric fixtures or the absent owner originals.

| Viewport | Gallery                                               | Botanical Noel                                   | Cranberry Garland                                | Winter Village                                   |
| -------- | ----------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------ | ------------------------------------------------ |
| Desktop  | [Gallery](screenshots/collection/desktop-gallery.png) | [Card 11](screenshots/collection/desktop-11.png) | [Card 12](screenshots/collection/desktop-12.png) | [Card 13](screenshots/collection/desktop-13.png) |
| Tablet   | [Gallery](screenshots/collection/tablet-gallery.png)  | [Card 11](screenshots/collection/tablet-11.png)  | [Card 12](screenshots/collection/tablet-12.png)  | [Card 13](screenshots/collection/tablet-13.png)  |
| Mobile   | [Gallery](screenshots/collection/mobile-gallery.png)  | [Card 11](screenshots/collection/mobile-11.png)  | [Card 12](screenshots/collection/mobile-12.png)  | [Card 13](screenshots/collection/mobile-13.png)  |

Visual review checks greetings clear of bows/foliage, family/year clear of lower decorations, no stray lettering, no clipped watercolor details, clean oval/rectangular photo edges, preserved gold frame, correct layer order, and usable responsive controls.

## Limits

Native artwork is approximately 212 ppi at 5 × 7 inches. Export dimensions/metadata are 300 ppi, not additional genuine source detail. Test a physical print before commercial release. Real Safari/iOS/Firefox device checks, printer color matching, and third-party PDF-viewer rasterization remain unverified. The ten earlier owner originals are still absent and are kept in a separate pending manifest.
