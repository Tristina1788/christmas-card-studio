import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fontSizeLimits, requestedFontSize } from "../src/rendering/fontSizing";
import { fittedText } from "../src/rendering/cardRenderer";
import type { Template } from "../src/config/templates";
const templates = JSON.parse(
  readFileSync("public/templates/manifest.json", "utf8"),
) as Template[];
const field = templates
  .find((t) => t.id === "22")!
  .textFields.find((f) => f.id === "family")!;
it("bounds selected sizes to the verified text region and handles stale preferences", () => {
  const limits = fontSizeLimits(field);
  expect(limits.max).toBeLessThanOrEqual(field.height);
  expect(requestedFontSize(field, 9999)).toBe(limits.max);
  expect(requestedFontSize(field, -5)).toBe(field.minSize);
  expect(requestedFontSize(field, NaN)).toBe(field.fontSize);
});
it("uses the customer-selected size when the name fits", () => {
  const ctx = {
    font: "",
    measureText(this: { font: string }, text: string) {
      return { width: (parseFloat(this.font) * text.length) / 2 };
    },
  } as unknown as CanvasRenderingContext2D;
  expect(fittedText(ctx, field, "Lee", 90)).toEqual({ size: 90, fits: true });
});
it("fits long names without dropping below the configured minimum", () => {
  const ctx = {
    font: "",
    measureText(this: { font: string }, text: string) {
      return { width: (parseFloat(this.font) * text.length) / 2 };
    },
  } as unknown as CanvasRenderingContext2D;
  const result = fittedText(
    ctx,
    field,
    "The Anderson and Williams Family",
    fontSizeLimits(field).max,
  );
  expect(result.fits).toBe(true);
  expect(result.size).toBeLessThan(fontSizeLimits(field).max);
  expect(result.size).toBeGreaterThanOrEqual(field.minSize);
  expect(
    ctx.measureText("The Anderson and Williams Family").width,
  ).toBeLessThanOrEqual(field.width);
});
