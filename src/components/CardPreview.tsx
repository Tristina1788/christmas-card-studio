import { useEffect, useRef } from "react";
import type { PhotoSlot } from "../config/templates";
import {
  renderCard,
  prepareFonts,
  type RenderInput,
  type RenderResult,
} from "../rendering/cardRenderer";
import { clamp, photoGeometry, type Crop } from "../rendering/photoCrop";
interface Props {
  input: RenderInput;
  slot?: PhotoSlot;
  crop: Crop;
  onCrop: (crop: Crop) => void;
  onResult: (result: RenderResult) => void;
  disabled: boolean;
}
export function CardPreview({
  input,
  slot,
  crop,
  onCrop,
  onResult,
  disabled,
}: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  useEffect(() => {
    let active = true;
    prepareFonts(input.template, input.fontFamilies)
      .then(() => {
        if (active && canvas.current)
          onResult(renderCard(canvas.current, input));
      })
      .catch(() => {
        if (active)
          onResult({
            errors: [
              "The card fonts could not load. Please refresh and try again.",
            ],
            fontSizes: {},
          });
      });
    return () => {
      active = false;
    };
  }, [input, onResult]);
  const photo = slot && input.photos[slot.id];
  function move(dx: number, dy: number) {
    if (!photo || !slot || disabled) return;
    const g = photoGeometry(photo, slot, crop);
    onCrop({
      ...crop,
      x: clamp(crop.x + (g.overflowX ? dx / g.overflowX : 0), -1, 1),
      y: clamp(crop.y + (g.overflowY ? dy / g.overflowY : 0), -1, 1),
    });
  }
  function distance(points: { x: number; y: number }[]) {
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  }
  return (
    <canvas
      ref={canvas}
      width={1500}
      height={2100}
      className={`card-canvas ${photo ? "can-drag" : ""}`}
      tabIndex={photo ? 0 : -1}
      aria-label="Live card preview. Use arrow keys to reposition the photo, or drag inside the opening."
      onKeyDown={(e) => {
        if (
          ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)
        ) {
          e.preventDefault();
          const d = e.shiftKey ? 40 : 10;
          move(
            e.key === "ArrowLeft" ? -d : e.key === "ArrowRight" ? d : 0,
            e.key === "ArrowUp" ? -d : e.key === "ArrowDown" ? d : 0,
          );
        }
      }}
      onPointerDown={(e) => {
        if (!photo || !slot || disabled) return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - r.left) * 1500) / r.width,
          y = ((e.clientY - r.top) * 2100) / r.height;
        if (
          x < slot.x ||
          x > slot.x + slot.width ||
          y < slot.y ||
          y > slot.y + slot.height
        )
          return;
        e.currentTarget.setPointerCapture(e.pointerId);
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      }}
      onPointerMove={(e) => {
        const previous = pointers.current.get(e.pointerId);
        if (!previous || disabled) return;
        const before = [...pointers.current.values()];
        pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
        const after = [...pointers.current.values()];
        if (before.length === 2) {
          const gap = distance(before);
          if (gap)
            onCrop({
              ...crop,
              zoom: clamp((crop.zoom * distance(after)) / gap, 1, 4),
            });
        } else {
          const ratio = 1500 / e.currentTarget.getBoundingClientRect().width;
          move(
            (e.clientX - previous.x) * ratio,
            (e.clientY - previous.y) * ratio,
          );
        }
      }}
      onPointerUp={(e) => pointers.current.delete(e.pointerId)}
      onPointerCancel={(e) => pointers.current.delete(e.pointerId)}
      onLostPointerCapture={(e) => pointers.current.delete(e.pointerId)}
    />
  );
}
