import type { Template, TextField } from "../config/templates";
import { loadArtwork, type Artwork } from "./assets";
import { initialCrop, type Crop } from "./photoCrop";
import { exportCanvas, type Values, type RenderInput } from "./cardRenderer";
import type { FontSizes } from "./fontSizing";
import type { FontFamilies } from "./fonts";
export type CardSide = "front" | "back";
export type BackLayout = "message" | "collage";
export interface Session {
  photos: Record<string, ImageBitmap | undefined>;
  crops: Record<string, Crop>;
  values: Values;
  fontSizes: FontSizes;
  fontFamilies: FontFamilies;
  backLayouts?: Record<string, BackLayout>;
}
export function preferenceKey(id: string, side: CardSide, field: string) {
  return side === "front" ? `${id}:${field}` : `${id}:back:${field}`;
}
export function photoKey(id: string, side: CardSide, slot: string) {
  return side === "front" ? slot : `${id}:back:${slot}`;
}
export function valueKey(id: string, side: CardSide, field: string) {
  return side === "front" ? field : `${id}:back:${field}`;
}
function field(
  id: string,
  label: string,
  y: number,
  height: number,
  size: number,
  value: string,
  font = "Lora",
  required = false,
): TextField {
  return {
    id,
    label,
    kind:
      id === "family"
        ? "family"
        : id === "year"
          ? "year"
          : id === "greeting"
            ? "greeting"
            : "caption",
    x: 260,
    y,
    width: 980,
    height,
    fontFamily: font,
    fontSize: size,
    minSize: 28,
    color: "#23483c",
    align: "center",
    maxLength: id === "year" ? 8 : 120,
    required,
    visible: true,
    defaultValue: value,
  };
}
export function sideTemplate(
  front: Template,
  side: CardSide,
  layout: BackLayout = "message",
): Template {
  if (side === "front") return front;
  const collage = layout === "collage";
  return {
    ...front,
    side: "back",
    name: `${front.name} · Back`,
    background: front.backBackground ?? "/templates/backs/evergreen.png",
    backgroundFit: "exact",
    foreground: null,
    photoSlots: collage
      ? [
          {
            id: "back-main",
            label: "Back main photo",
            x: 260,
            y: 400,
            width: 980,
            height: 650,
            shape: "rounded",
            radius: 30,
          },
          {
            id: "back-left",
            label: "Back lower left photo",
            x: 260,
            y: 1080,
            width: 475,
            height: 430,
            shape: "rounded",
            radius: 25,
          },
          {
            id: "back-right",
            label: "Back lower right photo",
            x: 765,
            y: 1080,
            width: 475,
            height: 430,
            shape: "rounded",
            radius: 25,
          },
        ]
      : [],
    textFields: collage
      ? [
          field(
            "greeting",
            "Back heading",
            225,
            130,
            90,
            "A year of little joys",
            "GreatVibes",
          ),
          field(
            "message-one",
            "Back message",
            1560,
            95,
            38,
            "Small adventures. Full hearts. Our favorite people.",
          ),
          field("family", "Family name", 1690, 100, 54, "The Anderson Family"),
          field("year", "Year", 1830, 75, 44, "2026"),
        ]
      : [
          field(
            "greeting",
            "Back heading",
            370,
            180,
            112,
            "Wishing you joy",
            "GreatVibes",
          ),
          field(
            "message-one",
            "Back message, line 1",
            780,
            120,
            48,
            "Sending love and warm wishes",
          ),
          field(
            "message-two",
            "Back message, line 2",
            920,
            120,
            48,
            "for a wonderful Christmas and New Year.",
          ),
          field(
            "signoff",
            "Back sign-off",
            1250,
            150,
            88,
            "With love,",
            "GreatVibes",
          ),
          field("family", "Family name", 1430, 120, 62, "The Anderson Family"),
          field("year", "Year", 1670, 85, 46, "2026"),
        ],
  };
}
export function sideInput(
  front: Template,
  session: Session,
  side: CardSide,
  artwork: Artwork,
): RenderInput {
  const t = sideTemplate(front, side, session.backLayouts?.[front.id]);
  return {
    template: t,
    artwork,
    photos: Object.fromEntries(
      t.photoSlots.map((s) => [
        s.id,
        session.photos[photoKey(front.id, side, s.id)],
      ]),
    ),
    crops: Object.fromEntries(
      t.photoSlots.map((s) => [
        s.id,
        session.crops[preferenceKey(front.id, side, s.id)] ?? initialCrop(),
      ]),
    ),
    values: Object.fromEntries(
      t.textFields.map((f) => [
        f.id,
        session.values[valueKey(front.id, side, f.id)] ??
          (side === "back" && (f.kind === "family" || f.kind === "year")
            ? session.values[f.id]
            : undefined) ??
          f.defaultValue,
      ]),
    ),
    fontSizes: Object.fromEntries(
      t.textFields
        .filter(
          (f) =>
            session.fontSizes?.[preferenceKey(front.id, side, f.id)] !==
            undefined,
        )
        .map((f) => [
          f.id,
          session.fontSizes[preferenceKey(front.id, side, f.id)],
        ]),
    ),
    fontFamilies: Object.fromEntries(
      t.textFields.map((f) => [
        f.id,
        session.fontFamilies?.[preferenceKey(front.id, side, f.id)] ??
          f.fontFamily,
      ]),
    ),
  };
}
export async function exportSide(
  front: Template,
  session: Session,
  side: CardSide,
) {
  const t = sideTemplate(front, side, session.backLayouts?.[front.id]);
  try {
    const input = sideInput(front, session, side, await loadArtwork(t));
    return await exportCanvas(input);
  } catch (error) {
    throw new Error(
      `${side === "front" ? "Front" : "Back"}: ${(error as Error).message}`,
    );
  }
}
export async function exportBothSides(
  front: Template,
  session: Session,
): Promise<[HTMLCanvasElement, HTMLCanvasElement]> {
  // Sequential rendering bounds peak memory and preserves page order.
  return [
    await exportSide(front, session, "front"),
    await exportSide(front, session, "back"),
  ];
}
