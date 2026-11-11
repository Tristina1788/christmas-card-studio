# Expanded collection and softer photo edges

The owner requested additional cards inspired by thirteen references, then asked for softer photo edges. This update adds thirteen new original AI-generated artwork files to the existing three-card collection (16 total). Referenced shop branding, watermarks, mockup scenes, and actual family photos were not reproduced. The sample family remains an explicitly labeled generated example.

## Rounded photo treatment

Each rectangular opening uses a modest rounded mask: 38 design pixels for main photos, 18 for small collage photos (at a 1,500 × 2,100 design canvas). A 4-pixel coordinating border is clipped inside the photo mask. An authored paper-color matte fills the original rectangular opening beneath the rounded image, eliminating gray corner remnants. The matte is confined to the measured photo box; it never repaints nearby watercolor decorations or embedded type. Oval designs keep their precisely traced polygon boundaries. This is precise photo-boundary reconstruction, not automatic background removal or foreground extraction. Original PNG files are unmodified.

## Artwork proportions

Exact 5:7 assets retain their established placement. Five new assets have a native size of 1,042 × 1,510 rather than 1,060 × 1,484. Their explicit `backgroundFit: contain` setting preserves aspect ratio and the complete source, adding a narrow matching paper margin. Photo masks and text boxes use that same uniform scale and offset. The default still rejects unreviewed wrong-ratio artwork.

## Collection and source evidence

All thirteen new designs have a greeting baked into the artwork. Only family name and optional year are editable, preventing duplicate greeting lettering. The existing first three designs keep their editable greetings.

| ID  | Design                 | Photos | Native size | SHA-256 of unchanged source                                        |
| --- | ---------------------- | ------ | ----------- | ------------------------------------------------------------------ |
| 14  | Sage Scallop Collage   | 4      | 1060 × 1484 | `7e6e367d6e02eab327356da854f4691cb71706b99bb34ba0c8bd2d94c283769c` |
| 15  | Pinecone Keepsake      | 1      | 1060 × 1484 | `de56bd4244896c5a042b189eceea8887da3331f9e3c3894890397b620b0102e5` |
| 16  | Merry & Bright         | 1      | 1060 × 1484 | `126af0249a9ffe4589591cddbcf53b0943439fa80b54609d7b880ec3addfa6dc` |
| 17  | Cranberry Bows         | 1      | 1060 × 1484 | `531213e3a062abb12e9cd95b2215a7b009ef14ce7e158868389a543506902257` |
| 18  | Holly & Pine           | 1      | 1060 × 1484 | `19e8b38411180cf877e2c8609f1cfc3ad30b64a1bfc02963bec2fe6f7e764916` |
| 19  | Silent Night           | 1      | 1060 × 1484 | `3d3d51e169477f352e327eb39715e8e468fc18e4fbe33084e6135a24d7d4d8f6` |
| 20  | Christmas Tree Farm    | 1      | 1042 × 1510 | `cedf97ff2ea98f8ec11ed0f80920488763a93b0da759b3e4d7d2cf9df4ee7a47` |
| 21  | Gingerbread Christmas  | 1      | 1042 × 1510 | `0d98306c32973414c32615739d31926c2f60318cc40151f8e0aff3c005c44117` |
| 22  | Christmas in the Woods | 1      | 1060 × 1484 | `6fadd1f00ebe2fdab9e034c3a029d604412144447a52ed7721747c85a098697f` |
| 23  | Home for Christmas     | 1      | 1060 × 1484 | `087730828a12c4b33b1b11a8bba53c346c766b1109aa150617eae4559734d9bf` |
| 24  | Nutcracker Noel        | 1      | 1042 × 1510 | `dee69ff448599c0cf1acbcd34206e9fabd45d8e215cd22e2421effaa81e7502a` |
| 25  | Blue Winter Village    | 1      | 1042 × 1510 | `5f67a641a75a9ffecaa6f4fe9459f3b5f244f39e91394516fb52a052cac60f90` |
| 26  | Sage Folk Christmas    | 1      | 1042 × 1510 | `22e0edd0bf71fad7e905481b98e0ebd87657c95f56a7e3efdd5fe1ed70359386` |

The manifest stores measured photo geometry, labels, mattes, frame colors, and safe name/year boxes. Sage Scallop Collage exposes Main photo and three Detail photo choices, each with independent upload and crop; all four must be supplied before export. Shared main-photo and personalization state survives template changes.

## Gallery memory

An IntersectionObserver starts each preview as it approaches the viewport. The renderer composites at full resolution, then downsamples to a 600 × 840 gallery buffer and releases the temporary full-resolution canvas and sample bitmap. This reduces the sixteen retained preview buffers from approximately 202 MB to approximately 32 MB; source-image caches and other browser memory are additional. Editor and export remain full resolution and use the same renderer.

## Verification and limits

Tests traverse all sixteen gallery entries and all sixteen actual template editors at desktop, tablet, and mobile viewports. They check PNG/preview equality, exact PNG/PDF dimensions, unchanged sampled artwork outside edit boxes, rounded-corner matte colors, absence of neutral-gray placeholder in sampled photo interiors, independent multi-photo uploads, and no photo POST requests. Full screenshots are captured for each template. Native source detail is approximately 212–216 ppi; 300 ppi export metadata is not a claim of newly created detail. Actual print/color and real Safari/iOS/Firefox checks remain.
