import type { TextField } from "../config/templates";
export type FontSizes = Record<string, number>;
/** Config sizes are design pixels; at 300 ppi one pixel is 72/300 print points. */
export const printPointValue = (pixels: number) =>
  Math.round(((pixels * 72) / 300) * 100) / 100;
export const printPoints = (pixels: number) => ((pixels * 72) / 300).toFixed(1);
export function fontSizeLimits(field: TextField) {
  return {
    min: field.minSize,
    max: Math.max(field.fontSize, Math.floor(field.height * 0.85)),
  };
}
export function requestedFontSize(field: TextField, value?: number) {
  const { min, max } = fontSizeLimits(field);
  const size =
    value !== undefined && Number.isFinite(value) ? value : field.fontSize;
  return Math.max(min, Math.min(max, size));
}
