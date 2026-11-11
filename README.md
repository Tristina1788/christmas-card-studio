# Christmas Card Studio

A browser-only React + TypeScript Christmas photo-card editor. Choose a watercolor design, upload a family photo, personalize the greeting/name/year, and download separate front/back 5 × 7 inch PNGs or a two-page PDF. No accounts, backend, or server photo storage.

## Current collection

The active collection contains **16 original AI-generated designs**, including thirteen new styles inspired by the owner's latest references.

| Design                 | Photos | Greeting             |
| ---------------------- | ------ | -------------------- |
| Botanical Noel         | 1      | Editable             |
| Cranberry Garland      | 1      | Editable             |
| Winter Village         | 1      | Editable             |
| Sage Scallop Collage   | 4      | Preserved in artwork |
| Pinecone Keepsake      | 1      | Preserved in artwork |
| Merry & Bright         | 1      | Preserved in artwork |
| Cranberry Bows         | 1      | Preserved in artwork |
| Holly & Pine           | 1      | Preserved in artwork |
| Silent Night           | 1      | Preserved in artwork |
| Christmas Tree Farm    | 1      | Preserved in artwork |
| Gingerbread Christmas  | 1      | Preserved in artwork |
| Christmas in the Woods | 1      | Preserved in artwork |
| Home for Christmas     | 1      | Preserved in artwork |
| Nutcracker Noel        | 1      | Preserved in artwork |
| Blue Winter Village    | 1      | Preserved in artwork |
| Sage Folk Christmas    | 1      | Preserved in artwork |

Rectangular photo areas now have gently rounded corners and a fine coordinating inner border. A measured paper-color matte covers the original gray corners. Oval styles retain their traced curves. Watercolor decorations and embedded greetings stay intact. The sage collage has four independently uploaded/cropped photos.

The gallery uses the same renderer as the editor/export, with labeled illustrative family photos. Previews load as cards approach the viewport and are stored at 600 × 840 to limit browser memory. Exports still render at full 1,500 × 2,100. Customers must upload their own photo to every opening before downloading.

Source artwork is approximately 212–216 ppi at 5 × 7 inches. Output dimensions and 300 ppi metadata do not add genuine source detail; the editor keeps its warning. Some sources are slightly narrower than 5:7 and are fitted proportionally with narrow paper margins. No watercolor is stretched, cropped away, or extracted from the source images.

The earlier ten owner-original configurations remain separately pending in `public/templates/owner-originals.pending.json`. The new art is not represented as a restoration of those missing originals.

## Run locally

Requires Node.js 22.12+ or 24+ and npm:

```sh
npm ci --include=dev
npm run dev
```

Open the localhost URL printed by Vite. Production build: `npm run build`; local build preview: `npm run preview`. A static host can serve `dist/`. This PR does not publish a website.

To review this branch before merge:

```powershell
cd D:\Projects\Private\christmas-card-studio
git fetch origin
git switch feat/two-sided-cards
npm ci --include=dev
npm run dev
```

After merging:

```powershell
cd D:\Projects\Private\christmas-card-studio
git switch main
git pull origin main
npm ci --include=dev
npm run dev
```

## Editing and downloads

- JPEG, PNG, and WebP uploads with EXIF orientation, file validation, and actionable errors.
- Fixed cover crop with mouse/touch drag, pinch zoom, keyboard arrows, accessible sliders, and crop reset.
- One configuration-driven editor supporting multiple photo slots, polygon/rounded masks, optional authored foregrounds, and captions.
- Six font choices and exact point-size inputs with no fixed maximum, plus size sliders and per-design preferences. See [fonts and text sizes](docs/FONT_SIZES.md).
- Default text automatically fits its safe area. Custom sizes print as selected, allowing large text beyond the original box; the preview shows overlap and card-edge cropping.
- Photos/text retained when switching designs; crops stored independently per design. Confirmed Start Over clears everything. State stays in memory while the tab remains open; refreshing or closing clears it.
- PNG: exactly 1,500 × 2,100 pixels, 300 ppi pHYs metadata.
- PDF: two 360 × 504 point pages (5 × 7 inches each), front then back, with lossless composited images and no added margins.
- Gallery, preview, and export use the same `renderCard` pipeline. Fonts/assets are awaited; customer-photo resolution warnings reflect the selected crop.

**Print the PDF at Actual Size / 100%. Do not select Fit to Page.**

## Verification

```sh
npm run check
npx playwright install chromium
npm run test:e2e
```

On Linux, browser dependencies may require `npx playwright install --with-deps chromium`. To use an existing Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its absolute path.

Browser projects cover 1440, 768, and 390 px. Tests exercise all twenty front designs and exports in addition to isolated synthetic fixtures for edge cases and the pending-original state. They verify PNG/preview pixel equality, exact PDF page size, artwork preservation outside edit regions, filled photo openings, local processing, crop controls, uploads, EXIF orientation, text fitting, reset, and template switching. See [QA and screenshots](docs/QA.md).

## Adding templates

See [template setup](docs/TEMPLATE_SETUP.md) and [expanded collection and rounded-photo details](docs/EXPANDED_COLLECTION.md). Add an entry to `public/templates/manifest.json`; gallery counts adapt automatically. Use unique IDs/paths and measure each opening/text area from the actual source. Preserve baked-in greetings in existing flattened art; only text-free new artwork supports an editable greeting.

## Code map

- `public/templates/`: active manifest, new artwork/sample photo, and separate pending-original manifest.
- `src/config/templates.ts`: shared schema, geometry checks, collection loader.
- `src/rendering/`: asset checks, proportional artwork fitting, image decoding, crop math, compositor, PNG/PDF exports.
- `src/components/`: gallery, gesture preview, editor controls.
- `tests/`: real-artwork journeys and isolated synthetic edge-case fixtures.

## Remaining release checks

Automated tests target Chromium. Real Safari/iOS/Firefox devices, printer color rendering, and actual-size print samples still need checking. PDF page size is verified; third-party PDF viewer rasterization has not been pixel-tested. Photos have a 25 MB / 80 megapixel limit; decode memory depends on the browser/device. The artwork's native resolution limit remains visible in the editor.

## Local build troubleshooting

For `TS2688` errors about `node` or `vite/client`, run `npm ci --include=dev` to install the declared development dependencies. Keep the TypeScript configuration intact. To avoid an old server on port 4173, build and run the current branch on a fresh port:

```powershell
npm run build
npm run preview -- --port 5174 --strictPort
```

Open http://localhost:5174 on the computer running the server. The collection heading should show **16 designs**.

Four new botanical photo cards (20 total), with editable greetings and sample 5 × 7 PDFs: [collection guide](docs/BOTANICAL_COLLECTION.md).

Two-sided editing, message/collage backs, and paired download samples: [guide](docs/TWO_SIDED_CARDS.md).
