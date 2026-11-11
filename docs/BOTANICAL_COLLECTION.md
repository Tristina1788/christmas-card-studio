# Botanical photo collection

Four new original AI-generated backgrounds bring the active collection to 20 cards. The new cards appear first in the gallery with a NEW label. They draw on the owner's reference themes: delicate holiday botanicals, red ribbons, portrait arches, photo ornaments, and beaded scallop frames. Reference photos, shop branding, and mockup scenes are not part of these assets.

All greetings, family names, and years are editable text layers. Fonts and unrestricted custom sizes work on all four designs, including the year placed above the bow on Winter Botanical Arch. Default Lora/Great Vibes fonts are bundled and loaded by the shared renderer before gallery, preview, and export rendering.

## Cards and sample PDFs

The PDFs below are actual application downloads using the existing illustrative AI-generated sample family photo and default text. Customers upload their own photos in the editor. The ornament card requires three independently uploaded photos, with separate crops for each opening.

| ID  | Card                    | Preview                                   | Sample PDF                                   |
| --- | ----------------------- | ----------------------------------------- | -------------------------------------------- |
| 27  | Winter Botanical Arch   | [View](screenshots/botanical/27-card.jpg) | [5 × 7 PDF](samples/botanical/27-sample.pdf) |
| 28  | Hanging Photo Ornaments | [View](screenshots/botanical/28-card.jpg) | [5 × 7 PDF](samples/botanical/28-sample.pdf) |
| 29  | Berry Scallop Oval      | [View](screenshots/botanical/29-card.jpg) | [5 × 7 PDF](samples/botanical/29-sample.pdf) |
| 30  | Velvet Ribbon Garland   | [View](screenshots/botanical/30-card.jpg) | [5 × 7 PDF](samples/botanical/30-sample.pdf) |

## PDF format

In the absence of a product listing URL or specific print measurements, these cards use the established app format: **one portrait page, exactly 5 × 7 inches (360 × 504 PDF points)**, containing the complete 1,500 × 2,100-pixel card render. Print at Actual Size / 100%. These are flat front cards without a reverse side, fold, crop marks, or extra bleed. Mockup surroundings are not printed. Additional listing-specific requirements can be applied when supplied.

Every PDF uses the same compositor, photo crops, fonts, and sizes as the preview and PNG. PDF generation itself retains the existing format. The four supplied sample PDFs were also independently rasterized with Poppler at 300 ppi and compared with their matching PNG downloads.

## Artwork and photo boundaries

Sources remain byte-for-byte unchanged at 1,060 × 1,484 pixels, an exact 5:7 ratio. They provide about 212 source pixels per printed inch; the existing source-resolution notice applies. A 300 ppi export does not add source detail.

The manifest stores measured masks in the 1,500 × 2,100 design coordinate system. The arch uses a semicircular polygon top and straight sides. Ornament and oval boundaries use dense elliptical polygons inside their painted outlines. The garland photo uses a rounded mask. The ornament background was revised during generation to keep bow tails outside the photo openings, so uploaded photos preserve the complete ribbons without foreground extraction. No reference artwork was repainted by the compositor.

Measured native-pixel photo bounds (x, y, width, height):

| Design | Photo region                                                                |
| ------ | --------------------------------------------------------------------------- |
| 27     | Arch: 200, 404, 653, 774                                                    |
| 28     | Left: 39, 573, 422, 436; top: 396, 337, 283, 291; right: 588, 608, 426, 437 |
| 29     | Oval: 200, 252, 647, 822                                                    |
| 30     | Rounded portrait: 205, 337, 650, 747; radius 29                             |

## Verification

Lint, TypeScript, production build, and 96 unit tests pass. Twelve new browser cases cover all four designs on desktop, tablet, and mobile: required photo uploads, font defaults, unrestricted year inputs, exact preview/PNG equality, PDF page count/dimensions, screenshots, and responsive width. Existing full-collection tests additionally audit artwork preservation and photo boundaries across all twenty designs. Physical print/color checks remain outside the automated suite.

Editor screenshots for each design are stored as `screenshots/botanical/{ID}-{desktop,tablet,mobile}-editor.jpg`.

## Source checksums

- `berry-scallop-oval.png`: `53886ba1f4d23afcf36586acb45b4a42b52b4bb6e4a22b7ed7d1b072ee1a8859`
- `hanging-photo-ornaments.png`: `8b73a21abb5f664844ea712a9a45096cb681ad4d7a9b8a404dc0e22d29961c04`
- `velvet-ribbon-garland.png`: `2e48670883a0fa38c0a0a256fcc24d0ca59fbba6310bfa943662ac44995b6fc4`
- `winter-botanical-arch.png`: `e7d10477c29da9c69ff47692829ecbc43ae403b2a06195b45d3152b7690aad01`
