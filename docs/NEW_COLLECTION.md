# New watercolor collection

The owner approved the generated three-card concept and requested website integration. These are **new AI-generated designs**, not recovered versions of the earlier broken foreground layers or the ten missing owner originals. Each was prepared as a separate, text-free artwork asset using the approved concept as a reference. No reference watermarks, family portraits, or lettering were carried into the artwork.

## Source assets

The three artwork PNGs are retained byte-for-byte from image generation at 1,060 × 1,484 pixels (5:7). The sample family photograph is also AI-generated and is labeled in the gallery. Customer export requires an actual upload. No background removal or watercolor layer extraction was performed.

| File                    | Native size | SHA-256                                                            |
| ----------------------- | ----------- | ------------------------------------------------------------------ |
| `botanical-noel.png`    | 1060 × 1484 | `894d8e8fc6d47b1fac11f7fca3fbd3147ef52999ad7f41064a48df87422c0531` |
| `cranberry-garland.png` | 1060 × 1484 | `20c23f1c07c715fefc99e61d81d3be9fe98262774f5c65ffff82279b5734efe6` |
| `winter-village.png`    | 1060 × 1484 | `877cebf25121377450563db4c4ecf2b7ba2d5300496be47e588708c2dfed6e93` |
| `sample-family.png`     | 1199 × 1312 | `cde32ba87a3a71bea4374dd2e13a8a7cc5e8841ce7d91ebeea26f852b27c761c` |

## Coordinate system and masks

All manifest geometry uses the 1,500 × 2,100 output design system. Source coordinates are mapped by `1500 / 1060` (the same as `2100 / 1484`), preserving aspect ratio. Artwork is never stretched to a different ratio.

Botanical Noel uses an explicitly stored polygon traced around the known gray photo placeholder. The boundary was measured from the connected neutral-gray opening, sampled every two source rows, and extended approximately one source pixel into its clear ivory boundary to cover the antialiased gray edge. No watercolor decoration is selected or removed. The source artwork remains unchanged. The garland and village masks use measured rectangles whose boundaries stay within the clear gaps around the foliage/gold outline. No foreground overlay is needed because decorations stay outside the openings.

| Design            | Photo box (x, y, width, height)         | Mask      |
| ----------------- | --------------------------------------- | --------- |
| Botanical Noel    | 265.684, 498.1132, 957.3113, 1205.6604  | polygon   |
| Cranberry Garland | 305.6604, 438.6792, 888.6792, 1153.3019 | rectangle |
| Winter Village    | 140.0943, 481.1321, 1219.8113, 854.717  | rectangle |

Greetings, family names, and years are separate renderer text layers. Botanical Noel and Winter Village use the upper blank zone for the greeting; Cranberry Garland uses the lower blank zone. All three have a lower safe area for name and year. Text boxes are specified in the manifest and validated against photo-slot bounds and print margins.

The compositor draws the unchanged background, then the masked photo, then the editable text. Gallery examples, editor preview, PNG, and PDF all use `renderCard`. Browser tests verify the real artwork, not just synthetic fixtures: sampled pixels outside editable regions remain unchanged, no neutral-gray placeholder survives in sampled photo interiors, decoded PNG pixels match the preview, and PDF page size is exact.

## Resolution and release limits

The artwork provides approximately **212 source pixels per inch at 5 × 7 inches**. Downloading 1,500 × 2,100 with 300 ppi metadata does not manufacture detail. The editor shows a source-resolution warning. A print sample is still recommended before selling these cards. Physical print/color checks, real-device Safari/iOS/Firefox checks, and external PDF-viewer rasterization are not covered by the Chromium suite.

The original ten designs are still represented only by `owner-originals.pending.json`. They must be supplied and verified separately before adding them to the active collection.
