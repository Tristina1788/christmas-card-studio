# Two-sided 5 × 7-inch cards

Every card now has a front and a back. Each side has its own 1,500 × 2,100-pixel canvas, sized for a 5 × 7-inch print. The editor has Front / Back buttons and previews the selected side using the same renderer as downloads.

## Downloads

- **Download front PNG:** only the front, 1,500 × 2,100 pixels, 300 ppi metadata, filename `christmas-{ID}-front.png`.
- **Download back PNG:** only the back, same dimensions and metadata, filename `christmas-{ID}-back.png`.
- **Download PDF:** exactly two portrait pages, each 360 × 504 pt (5 × 7 inches). Page 1 is the front; page 2 is the back. Filename `christmas-{ID}-front-and-back.pdf`.

Pages are upright and unmirrored, suitable for duplex printing. Print at Actual Size / 100%, using long-edge flipping for portrait pages. Printer feed conventions vary, so check a test sheet. These are flat two-sided cards without a fold, extra bleed, crop marks, or a larger imposed sheet.

## Back layouts

Choose **Back** to edit the reverse side. **Message only** is the default, with an editable heading, two message lines, sign-off, family name, and year. **Three-photo collage** adds one large upper photo and two lower photos, with heading, message, family name, and year. All text uses the existing font menus and unrestricted point-size inputs.

The back initially inherits the front's family name and year. Editing them on the back creates a separate value. Front greetings, font choices, sizes, photos, and crops are independent of the back. Each collage opening requires its own upload. Switching layouts preserves photos and text while the tab remains open. Start Over clears both sides and restores the message-only back. Size reset affects only the displayed side.

The PDF requires all photos needed by both sides. A missing back collage photo disables PDF/back PNG download, while a completed front can still be downloaded separately. Text and artwork validation also run again when exporting. Failures identify the affected side.

## Coordinating artwork and samples

Four new AI-generated text-free reverse backgrounds coordinate with the botanical, evergreen ornament, berry, and ribbon themes. All twenty fronts have a back background assigned. These sources are retained unchanged at 1,060 × 1,484; source-detail limitations and the existing resolution notice still apply. The four botanical fronts remain unchanged.

The following sample PDFs now include **both sides** and use the existing illustrative family photo:

| Card                    | Front preview                              | Message back preview                           | Two-page PDF                           |
| ----------------------- | ------------------------------------------ | ---------------------------------------------- | -------------------------------------- |
| Winter Botanical Arch   | [Front](screenshots/botanical/27-card.jpg) | [Back](screenshots/two-sided/27-back-card.jpg) | [PDF](samples/botanical/27-sample.pdf) |
| Hanging Photo Ornaments | [Front](screenshots/botanical/28-card.jpg) | [Back](screenshots/two-sided/28-back-card.jpg) | [PDF](samples/botanical/28-sample.pdf) |
| Berry Scallop Oval      | [Front](screenshots/botanical/29-card.jpg) | [Back](screenshots/two-sided/29-back-card.jpg) | [PDF](samples/botanical/29-sample.pdf) |
| Velvet Ribbon Garland   | [Front](screenshots/botanical/30-card.jpg) | [Back](screenshots/two-sided/30-back-card.jpg) | [PDF](samples/botanical/30-sample.pdf) |

A separate [front PNG](samples/two-sided/front.png), [back PNG](samples/two-sided/back.png), [collage example PDF](samples/two-sided/collage-sample.pdf) and [back preview](screenshots/two-sided/collage-back-card.jpg) demonstrate the photo layout with illustrative photos.

## Verification

The two-sided browser test independently decodes each PDF page's embedded RGB image and reverses its PNG predictors, then compares every pixel with the matching PNG and live preview. This verifies actual page order and content, not just page dimensions. It also checks three independent back photos, missing-photo download gating, front/back typography and photo isolation, family-name inheritance, layout switching, reset, and responsive width on desktop, tablet, and mobile. Existing export tests now require two PDF pages. Schema tests validate both back layouts for every card and verify independent state keys. Physical printer registration and color output remain outside automated checks.

## Source checksums

- `berry.png`: `40dc681d3497ef5076b9bb9fb2d3059d11ac3f3ae3d11bec411555f119a32cc8`
- `botanical.png`: `f60d5560d0ba6771757c0d09fd216352e3c11830d8afca5555d3ea54b748d49e`
- `evergreen.png`: `bc30c3b3d41dfa208c7ae41c9cf4aa7405501dad2723701def9f7c3d54a65149`
- `ribbon.png`: `d19d8dfcf523db03328036c8416c3a4b67707124cd6066e865130bdb26d69506`
