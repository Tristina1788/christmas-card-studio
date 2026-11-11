# Fonts and text sizes

Every editable text field has a **Font** menu, **Size (pt)** number input, and size slider. Name and year are adjustable on all sixteen cards; the three designs with editable greetings also support greeting font and size changes. The other thirteen greetings are embedded in the artwork.

## Using the controls

1. Choose a font: Classic serif, Lora, Great Vibes script, Arial, Trebuchet, or Times.
2. Drag the size slider, or type an exact point size. The number input has no fixed maximum. The slider normally spans 0.24–120 pt and expands to accommodate larger typed values.
3. Review the live preview. An explicit size is printed exactly as selected, without automatic shrinking or clipping to the original text box. Large text can overlap photos, decorations, or other text. Anything outside the card edges is cropped in both preview and export.
4. **Reset text sizes** restores this design's size defaults while preserving fonts, photos, and text. Choose Classic serif to restore the original font. **Start Over** clears all personalization across cards.

Fonts and sizes persist separately per design while the tab stays open. Refreshing or closing the tab clears them, as with the existing photo/text state.

## Defaults and exports

Until a size is explicitly changed, text uses the original template's size and automatic width fitting. Long names show their actual fitted size, and names that cannot fit block export. Entering a custom size gives the customer control over the layout and removes this fitting constraint. Required text still must be entered.

The shared renderer loads the chosen fonts before painting the preview or generating PNG/PDF. Lora and Great Vibes are bundled with their SIL Open Font Licenses in `public/fonts`; no external font request is needed. The other four choices use browser system fonts. Text alignment, color, and center position are preserved.

Internal sizes use design pixels at 300 ppi; the editor shows physical print points (72 points per inch).

## Screenshots

The current screenshots show a 48 pt year in Lora and a family name in Great Vibes:

| Desktop                                                           | Tablet                                                           | Mobile                                                           |
| ----------------------------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------------------- |
| [Preview](screenshots/font-sizes/desktop-font-and-large-year.jpg) | [Preview](screenshots/font-sizes/tablet-font-and-large-year.jpg) | [Preview](screenshots/font-sizes/mobile-font-and-large-year.jpg) |

## Verification

Browser checks on desktop, tablet, and mobile cover font selection/loading, visible text beyond the original year box, exact preview/PNG pixel agreement, PDF dimensions, typing sizes above the slider range, per-card settings, and resets. Existing editing and export regressions also run. Unit tests verify unlimited explicit sizes, selected fonts, invalid size handling, and default fitting.
