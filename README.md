# Five approved watercolor card templates

These are original **raster PNG artworks**, not SVG icons. The five concepts were approved in chat. Each front has one customer-replaceable photo area. The greetings are painted into the artwork, so only family name and year are editable.

## Install into your existing repository

Copy the `public/templates/approved-2026/` folder into the same location in your checkout. Copy `new-template-entries.json` and `install-approved-templates.mjs` into your repository root, then run:

```sh
node install-approved-templates.mjs
npm run check
npm run dev
```

**Review status:** The entries intentionally have `needs-review`, which blocks downloads until actual photo masks, original artwork boundaries, and PDF/PNG output are visually tested in the browser. Once verified, change each status to `approved` and update the review note.

All five use 1500 x 2100 pixel 5 x 7-inch artwork. Existing back designs are reused. The generated samples containing families were painted out for photo replacement, and the artwork's typography remains baked in.
