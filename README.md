# Christmas Card Studio

A browser-only React + TypeScript Christmas photo-card editor. Choose a watercolor design, upload a family photo, personalize the greeting/name/year, and download a 5 × 7 inch PNG or PDF. No accounts, backend, or server photo storage.

## Current collection

The owner authorized three **new AI-generated designs** inspired by their stationery references:

| Design            | Photo layout                                                 | Editable fields                      |
| ----------------- | ------------------------------------------------------------ | ------------------------------------ |
| Botanical Noel    | Precisely traced organic oval                                | Greeting, family name, optional year |
| Cranberry Garland | Tall rectangle between evergreen garlands and cranberry bows | Greeting, family name, optional year |
| Winter Village    | Gold-edged rectangle above snowy cottages                    | Greeting, family name, optional year |

Each uses a separate, unchanged, text-free artwork file. Customer photos are clipped to measured openings; text is composited into verified clear areas. No automatic background removal, extracted watercolor layers, or reconstructed decorations are used. Gallery examples use a clearly labeled AI-generated illustrative family photo. Customers must upload their own photo to enable downloads; the gallery photo is never silently used for their export.

**Source detail:** the artwork is 1,060 × 1,484 pixels (approximately 212 ppi at 5 × 7 inches). PNG exports are exactly 1,500 × 2,100 with 300 ppi metadata, but that does not add genuine detail to the source artwork. The editor warns about this. Confirm a physical print sample before commercial release.

The ten previously requested owner-supplied designs remain unprovided. Their configurations are preserved in `public/templates/owner-originals.pending.json`; they are not shown as part of this new collection or misrepresented as completed originals.

## Run locally

Requires Node.js 22.12+ or 24+ and npm:

```sh
npm install
npm run dev
```

Open the localhost URL printed by Vite. Production build: `npm run build`; local build preview: `npm run preview`. A static host can serve `dist/`. This PR does not publish a website.

To review this branch before merge:

```powershell
cd D:\Projects\Private\christmas-card-studio
git fetch origin
git switch feat/watercolor-card-collection
npm install
npm run dev
```

After merging:

```powershell
cd D:\Projects\Private\christmas-card-studio
git switch main
git pull origin main
npm install
npm run dev
```

## Editing and downloads

- JPEG, PNG, and WebP uploads with EXIF orientation, file validation, and actionable errors.
- Fixed cover crop with mouse/touch drag, pinch zoom, keyboard arrows, accessible sliders, and crop reset.
- One configuration-driven editor supporting multiple photo slots, polygon/rounded masks, optional authored foregrounds, and captions.
- Font fitting in safe areas. Fields that cannot fit at minimum font size block export instead of clipping silently.
- Photos/text retained when switching designs; crops stored independently per design. Confirmed Start Over clears everything. State stays in memory while the tab remains open; refreshing or closing clears it.
- PNG: exactly 1,500 × 2,100 pixels, 300 ppi pHYs metadata.
- PDF: one 360 × 504 point page (5 × 7 inches), lossless composited PNG, no added margins.
- Gallery, preview, and export use the same `renderCard` pipeline. Fonts/assets are awaited; customer-photo resolution warnings reflect the selected crop.

**Print the PDF at Actual Size / 100%. Do not select Fit to Page.**

## Verification

```sh
npm run check
npx playwright install chromium
npm run test:e2e
```

On Linux, browser dependencies may require `npx playwright install --with-deps chromium`. To use an existing Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its absolute path.

Browser projects cover 1440, 768, and 390 px. Tests exercise all three real artwork files and exports in addition to isolated synthetic fixtures for edge cases and the pending-original state. They verify PNG/preview pixel equality, exact PDF page size, artwork preservation outside edit regions, filled photo openings, local processing, crop controls, uploads, EXIF orientation, text fitting, reset, and template switching. See [QA and screenshots](docs/QA.md).

## Adding templates

See [template setup](docs/TEMPLATE_SETUP.md) and [new artwork provenance and measured geometry](docs/NEW_COLLECTION.md). Add an entry to `public/templates/manifest.json`; gallery counts adapt automatically. Use unique IDs/paths and measure each opening/text area from the actual source. Preserve baked-in greetings in existing flattened art; only text-free new artwork supports an editable greeting.

## Code map

- `public/templates/`: active manifest, new artwork/sample photo, and separate pending-original manifest.
- `src/config/templates.ts`: shared schema, geometry checks, collection loader.
- `src/rendering/`: asset checks, image decoding, crop math, compositor, PNG/PDF exports.
- `src/components/`: gallery, gesture preview, editor controls.
- `tests/`: real-artwork journeys and isolated synthetic edge-case fixtures.

## Remaining release checks

Automated tests target Chromium. Real Safari/iOS/Firefox devices, printer color rendering, and actual-size print samples still need checking. PDF page size is verified; third-party PDF viewer rasterization has not been pixel-tested. Photos have a 25 MB / 80 megapixel limit; decode memory depends on the browser/device. The artwork's native resolution limit remains visible in the editor.
