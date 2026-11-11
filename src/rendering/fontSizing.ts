import type { TextField } from "../config/templates";
export type FontSizes = Record<string, number>;
/** Config sizes are design pixels; at 300 ppi one pixel is 72/300 print points. */
export const printPointValue = (pixels: number) =>
  Math.round(((pixels * 72) / 300) * 100) / 100;
export const printPoints = (pixels: number) => ((pixels * 72) / 300).toFixed(1);
export function fontSizeLimits(field: TextField) {
  return {
    min: 1,
    // The slider is a shortcut; the number input has no fixed maximum.
    max: Math.max(500, field.fontSize),
  };
}
export function requestedFontSize(field: TextField, value?: number) {
  const { min } = fontSizeLimits(field);
  const size =
    value !== undefined && Number.isFinite(value) ? value : field.fontSize;
  return Math.max(min, size);
}
