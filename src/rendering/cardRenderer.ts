import type { PhotoSlot, Template, TextField } from "../config/templates";
import { photoGeometry, initialCrop, type Crop } from "./photoCrop";
import { artworkPlacement } from "./artworkPlacement";
import type { Artwork } from "./assets";
import { requestedFontSize, type FontSizes } from "./fontSizing";
export interface RenderResult {
  errors: string[];
  fontSizes: FontSizes;
}
export type Values = Record<string, string>;
export interface RenderInput {
  template: Template;
  artwork: Artwork;
  photos: Record<string, ImageBitmap | undefined>;
  crops: Record<string, Crop>;
  values: Values;
  fontSizes?: FontSizes;
}
export function fittedText(
  ctx: CanvasRenderingContext2D,
  field: TextField,
  value: string,
  requested?: number,
) {
  let size = requestedFontSize(field, requested);
  while (size > field.minSize) {
    ctx.font = `${size}px ${field.fontFamily}`;
    if (ctx.measureText(value).width <= field.width) break;
    size = Math.max(field.minSize, size - 1);
  }
  ctx.font = `${size}px ${field.fontFamily}`;
  return { size, fits: ctx.measureText(value).width <= field.width };
}
export function clipSlot(ctx: CanvasRenderingContext2D, slot: PhotoSlot) {
  ctx.beginPath();
  if (slot.shape === "polygon" && slot.points) {
    slot.points.forEach((p, i) =>
      i
        ? ctx.lineTo(slot.x + p.x, slot.y + p.y)
        : ctx.moveTo(slot.x + p.x, slot.y + p.y),
    );
    ctx.closePath();
  } else if (slot.shape === "rounded")
    ctx.roundRect(slot.x, slot.y, slot.width, slot.height, slot.radius);
  else ctx.rect(slot.x, slot.y, slot.width, slot.height);
  ctx.clip();
}
export async function prepareFonts(template: Template) {
  await Promise.all(
    template.textFields
      .filter((f) => f.visible)
      .map((f) => document.fonts.load(`${f.fontSize}px ${f.fontFamily}`)),
  );
  await document.fonts.ready;
}
export function renderCard(
  canvas: HTMLCanvasElement,
  input: RenderInput,
): RenderResult {
  const { template: t, artwork, photos, crops, values } = input;
  if (canvas.width !== t.width || canvas.height !== t.height) {
    canvas.width = t.width;
    canvas.height = t.height;
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser could not create a card preview.");
  ctx.clearRect(0, 0, t.width, t.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const placement = artworkPlacement(t, artwork.background);
  ctx.fillStyle = t.paperColor ?? "#faf8f2";
  ctx.fillRect(0, 0, t.width, t.height);
  ctx.drawImage(
    artwork.background,
    placement.x,
    placement.y,
    placement.width,
    placement.height,
  );
  for (const slot of t.photoSlots) {
    const photo = photos[slot.id];
    if (!photo && !slot.matteColor) continue;
    if (slot.matteColor) {
      ctx.fillStyle = slot.matteColor;
      ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
    }
    const g = photo
      ? photoGeometry(photo, slot, crops[slot.id] ?? initialCrop())
      : undefined;
    ctx.save();
    clipSlot(ctx, slot);
    if (photo && g) ctx.drawImage(photo, g.x, g.y, g.width, g.height);
    else {
      ctx.fillStyle = "#d0d0ce";
      ctx.fillRect(slot.x, slot.y, slot.width, slot.height);
    }
    if (slot.frameColor) {
      ctx.strokeStyle = slot.frameColor;
      ctx.lineWidth = 4;
      ctx.stroke();
    }
    ctx.restore();
  }
  if (artwork.foreground)
    ctx.drawImage(artwork.foreground, 0, 0, t.width, t.height);
  const errors: string[] = [];
  const fontSizes: FontSizes = {};
  for (const field of t.textFields.filter((f) => f.visible)) {
    const value = values[field.id] ?? field.defaultValue;
    if (field.required && !value.trim())
      errors.push(`Enter ${field.label.toLowerCase()}.`);
    if (!value) continue;
    ctx.save();
    const fit = fittedText(ctx, field, value, input.fontSizes?.[field.id]);
    if (fit.fits) fontSizes[field.id] = fit.size;
    if (!fit.fits)
      errors.push(
        `${field.label} is too wide. Please shorten it to fit the safe text area.`,
      );
    ctx.beginPath();
    ctx.rect(field.x, field.y, field.width, field.height);
    ctx.clip();
    ctx.fillStyle = field.color;
    ctx.textAlign = field.align;
    ctx.textBaseline = "middle";
    const x =
      field.x +
      (field.align === "center"
        ? field.width / 2
        : field.align === "right"
          ? field.width
          : 0);
    ctx.fillText(value, x, field.y + field.height / 2);
    ctx.restore();
  }
  return { errors, fontSizes };
}
export async function exportCanvas(input: RenderInput) {
  await prepareFonts(input.template);
  if (
    input.template.status !== "approved" ||
    input.template.photoSlots.some((s) => !input.photos[s.id])
  )
    throw new Error("Add a photo to every opening before downloading.");
  const canvas = document.createElement("canvas");
  const { errors } = renderCard(canvas, input);
  if (errors.length) throw new Error(errors.join(" "));
  return canvas;
}
