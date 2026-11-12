# Approved watercolor Christmas card collection (work in progress)

Five approved, raster-illustrated, single-photo 5 x 7-inch designs are ready for integration:

1. Winter Ribbon Letter — watercolor evergreen and red velvet ribbon
2. Heirloom Arch — botanical arch and gold details
3. Cranberry Candy Stripes — red-and-ivory stripes with evergreen framing
4. Sage Scandi Stripes — sage-and-ivory stripes with scalloped photo opening
5. Midnight Lights — midnight blue, colorful lights and winter greenery

## Required before enabling in the gallery

- Commit the five generated PNG backgrounds under `public/templates/approved-2026/`.
- Append their matching measured photo slots and editable text fields to `public/templates/manifest.json`.
- Inspect each image/photo boundary for printed decoration overlap; retain `needs-review` status until verified.
- Verify upload, cropping, gallery, 1500 x 2100 PNG export and two-sided 5 x 7-inch PDF export with Playwright.
- Preserve the existing card backs and do not use SVG icon artwork.

**Important:** This draft PR is not a finished feature. The generated binary PNG assets could not be uploaded through the available GitHub connector in this session. Do not merge until artwork, manifest entries and tests are included.
