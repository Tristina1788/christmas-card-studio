import type { PhotoSlot } from "../config/templates";
export interface Crop {
  zoom: number;
  x: number;
  y: number;
}
export const initialCrop = (): Crop => ({ zoom: 1, x: 0, y: 0 });
export const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));
export function photoGeometry(
  image: { width: number; height: number },
  slot: PhotoSlot,
  crop: Crop,
) {
  const scale =
    Math.max(slot.width / image.width, slot.height / image.height) *
    clamp(crop.zoom, 1, 4);
  const width = image.width * scale,
    height = image.height * scale;
  const overflowX = (width - slot.width) / 2,
    overflowY = (height - slot.height) / 2;
  return {
    scale,
    width,
    height,
    overflowX,
    overflowY,
    x: slot.x - overflowX + clamp(crop.x, -1, 1) * overflowX,
    y: slot.y - overflowY + clamp(crop.y, -1, 1) * overflowY,
  };
}
export function effectivePpi(
  image: { width: number; height: number },
  slot: PhotoSlot,
  crop: Crop,
) {
  return Math.round(300 / photoGeometry(image, slot, crop).scale);
}
