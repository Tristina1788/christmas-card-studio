# Template setup and visual approval

## Preserve the original

Use owner-supplied originals for their existing designs. The owner has separately authorized the three new AI-generated designs documented in NEW_COLLECTION.md. Never represent generated artwork as an owner-supplied original, redraw approved watercolor details, remove backgrounds automatically, or paint over embedded greetings. File paths are local under `/templates/`; external image URLs are rejected to avoid tainted export canvases and third-party photo traffic.

Each template has its own image path. The production canvas is **1500 × 2100**; geometry is measured in that design coordinate system. Native image sizes can differ if the 5:7 aspect ratio matches. Convert measured source coordinates with `x * 1500 / sourceWidth` and `y * 2100 / sourceHeight`. Lower-resolution source files trigger a warning, not a promise of restored detail.

## Configure a design

1. Put the original in `public/templates/`, and update its `background` filename in `manifest.json`.
2. Set `status` to `needs-review` to display the original and inspect it in the editor while downloads remain blocked.
3. Measure the photo opening exactly. A flattened gray placeholder remains opaque until a photo is drawn over that precise region. Do not guess a rectangle that obscures nearby decoration.
4. Add `photoSlots`, using stable IDs (`photo` for the first shared family photo). Each slot has `x`, `y`, `width`, `height`, `shape` (`rectangle`, `rounded`, or `polygon`), and `radius`. Polygon `points` are local to the slot origin; define at least three points. Match the mask to the actual opening boundary. The crop always covers the slot's bounding box and is clipped to the configured mask.
5. If decorations genuinely cross into the photo opening, obtain a separately authored transparent foreground from the artist and set `foreground`. The overlay must use the full artwork coordinate system and aspect ratio. Do not manufacture it using color segmentation. When a clean composite is impossible, leave `needs-review` and record why in `reviewNote`.
6. Measure family/year safe text boxes separately. Avoid baked-in lettering, decorations, photo slots, and print margins. Use a font whose license permits this application; self-host font files using CSS `@font-face` where needed. Fonts must be available on the customer's browser; do not rely on a locally installed custom font.
7. Visually compare the original, preview, and downloaded PNG/PDF at full resolution with several crops, extreme pan/zoom, long/short names, and year both on and off. Check every crossed boundary and decoration. Inspect a real-size print.
8. Only after that review, set `status` to `approved` and record what was checked in `reviewNote`.

The following is a **schema example**, not measured coordinates for any actual design:

```json
{
  "photoSlots": [
    {
      "id": "photo",
      "x": 200,
      "y": 400,
      "width": 1100,
      "height": 1100,
      "shape": "rectangle",
      "radius": 0
    }
  ],
  "textFields": [
    {
      "id": "family",
      "kind": "family",
      "label": "Family name",
      "x": 150,
      "y": 1650,
      "width": 1200,
      "height": 100,
      "fontFamily": "Georgia",
      "fontSize": 64,
      "minSize": 28,
      "color": "#23483c",
      "align": "center",
      "maxLength": 60,
      "required": true,
      "visible": true,
      "defaultValue": "The Anderson Family"
    }
  ]
}
```

`safeMargin` is the minimum inset for text boxes. Font sizes are design pixels. Text is shrunk down to `minSize`; if it still does not fit, download is blocked rather than exporting overflowing or silently truncated text. Optional fields can be blank. Share field IDs between templates to retain text; use different IDs for independent captions. Multiple photo slot IDs retain independent uploads. Each template stores independent crops.

The schema rejects out-of-bounds geometry, invalid polygon points, duplicate region IDs, text overlapping photo slots, and approved designs without any slot. It cannot detect visual overlap with painted decorations: that requires human review.

## Future designs

Add a new manifest entry with a unique ID and image path, its own original art, and measured slots/text. The collection loader and gallery count adapt automatically. Add test coverage for each newly approved design. The renderer/editor do not need separate implementations. Fully editable greetings should only be enabled in new text-free artwork with a verified `greeting` field. The new text-free generated designs have editable greeting fields. No greeting field is configured for the ten pending flattened originals.

## Per-template release checklist

- Original image and optional artist-authored foreground loaded at correct aspect ratio.
- Precise opening/mask covers all gray pixels without harming art.
- No duplicate greeting or text/decorations overlap.
- Portrait, landscape, and EXIF-rotated photo tested.
- Drag/zoom extremes cover the opening and preserve every decoration.
- Long family name and optional year fit inside verified margins.
- PNG and PDF match preview, 1500 × 2100 and 360 × 504 pt respectively.
- Desktop, tablet, mobile, and actual-size print inspected.
- Review note and evidence recorded before approval.
