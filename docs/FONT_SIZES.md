# Font-size controls

The editor now has a **Font size** slider below every editable text field. Sizes are shown in physical print points (pt), and update the live card immediately. Family name and optional year are adjustable on all sixteen designs. The three text-free designs also support editable greeting sizes. Greetings embedded in the other thirteen artwork files remain unchanged; their pixels cannot be resized independently without a separate artwork edit.

## Using the controls

1. Open a card and enter your family name/year.
2. Move the slider under the field, or focus it and use arrow keys, Home, or End.
3. Read the point-size value beside the slider. If long text needs fitting, a note gives the actual fitted print size.
4. Use **Reset text sizes** to restore this design's defaults while keeping the photo and text. **Start Over** clears size preferences across all cards with the rest of your work.

Sizes are remembered separately for each design during the current tab session. Going back to the collection or changing designs preserves each card's settings. Closing or refreshing the tab clears them, like the existing photo/text state.

## Safe fitting and exports

Each field retains its verified text box, alignment, color, and font family. The selected size is bounded by the field's minimum and safe height, with a vertical allowance for glyphs. Long text is automatically reduced to fit its width, with the actual size reported in the editor. Text that still cannot fit at minimum size blocks downloads and asks the customer to shorten it. Text boxes never move into photos or decorations.

Internally the compositor uses design pixels; 300 ppi output maps each pixel to 72/300 print points. The controls expose point units and accessible spoken point values. The selected sizes are passed to the shared renderer for preview and PNG/PDF export. Renderer fitting results supply the UI's actual-size feedback, avoiding a separate estimate.

## Screenshots

The example card uses a 21.6 pt family name and 16.3 pt year. Sample photos are illustrative; artwork has not been edited.

| Viewport | Larger name/year                                              | Long-name fitting feedback                                          |
| -------- | ------------------------------------------------------------- | ------------------------------------------------------------------- |
| Desktop  | [Larger text](screenshots/font-sizes/desktop-larger-text.jpg) | [Auto fitting](screenshots/font-sizes/desktop-auto-fitted-text.jpg) |
| Tablet   | [Larger text](screenshots/font-sizes/tablet-larger-text.jpg)  | [Auto fitting](screenshots/font-sizes/tablet-auto-fitted-text.jpg)  |
| Mobile   | [Larger text](screenshots/font-sizes/mobile-larger-text.jpg)  | [Auto fitting](screenshots/font-sizes/mobile-auto-fitted-text.jpg)  |

## Verification

New browser checks at 1440, 768, and 390 px cover keyboard resizing, changed text pixels, unchanged artwork/photo pixels, exact preview/PNG equality after resizing, PDF page size, per-design persistence, reset sizes, confirmed Start Over, automatic fitting of long names, overflow rejection, and independently editable greeting sizes. Embedded artwork greetings have no misleading size control. Unit checks exercise size bounds, invalid preferences, selected-size rendering, and minimum-size width fitting. Existing editing and rendering regressions continue to run in CI.

Source-art resolution and physical printing limitations remain as described in the main QA record. No artwork file, photo mask, template geometry, or deployment was changed by this update.
