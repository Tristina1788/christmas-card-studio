import { z } from "zod";

const box = z.object({
  x: z.number().nonnegative(),
  y: z.number().nonnegative(),
  width: z.number().positive(),
  height: z.number().positive(),
});
const point = z.object({ x: z.number(), y: z.number() });
const slot = box.extend({
  id: z.string().min(1),
  label: z.string().optional(),
  matteColor: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .optional(),
  frameColor: z
    .string()
    .regex(/^#[0-9a-f]{6}$/i)
    .optional(),
  shape: z.enum(["rectangle", "rounded", "polygon"]),
  radius: z.number().nonnegative().default(0),
  points: z.array(point).optional(),
});
const text = box.extend({
  id: z.string().min(1),
  kind: z.enum(["family", "year", "greeting", "caption"]),
  label: z.string(),
  fontFamily: z.string().min(1),
  fontSize: z.number().positive(),
  minSize: z.number().positive(),
  color: z.string().regex(/^#[0-9a-f]{6}$/i),
  align: z.enum(["left", "center", "right"]),
  maxLength: z.number().int().positive().max(120),
  required: z.boolean(),
  visible: z.boolean(),
  defaultValue: z.string(),
});
const assetPath = z
  .string()
  .regex(/^\/templates\/[a-zA-Z0-9_./-]+\.(png|jpg|jpeg|webp)$/i)
  .refine((p) => !p.includes(".."), "Use a local template asset path");
export const templateSchema = z
  .object({
    id: z.string().regex(/^\d{2}$/),
    name: z.string(),
    description: z.string(),
    palette: z.enum([
      "cranberry",
      "sage",
      "navy",
      "blue",
      "forest",
      "ginger",
      "woodland",
      "rust",
      "pastel",
      "berry",
    ]),
    background: assetPath,
    backgroundFit: z.enum(["exact", "contain"]).optional(),
    paperColor: z
      .string()
      .regex(/^#[0-9a-f]{6}$/i)
      .optional(),
    foreground: assetPath.nullable(),
    galleryPhoto: assetPath.optional(),
    width: z.literal(1500),
    height: z.literal(2100),
    printWidth: z.literal(5),
    printHeight: z.literal(7),
    safeMargin: z.number().min(0).max(300),
    status: z.enum(["awaiting-artwork", "needs-review", "approved"]),
    reviewNote: z.string(),
    photoSlots: z.array(slot),
    textFields: z.array(text),
  })
  .superRefine((t, ctx) => {
    const issue = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    for (const b of [...t.photoSlots, ...t.textFields]) {
      if (b.x + b.width > t.width || b.y + b.height > t.height)
        issue("Regions must stay inside the design canvas");
    }
    if (
      new Set(t.photoSlots.map((s) => s.id)).size !== t.photoSlots.length ||
      new Set(t.textFields.map((s) => s.id)).size !== t.textFields.length
    )
      issue("Region IDs must be unique");
    for (const s of t.photoSlots) {
      if (s.radius > Math.min(s.width, s.height) / 2)
        issue("Rounded radius exceeds slot bounds");
      if (
        s.shape === "polygon" &&
        (!s.points ||
          s.points.length < 3 ||
          s.points.some(
            (p) => p.x < 0 || p.y < 0 || p.x > s.width || p.y > s.height,
          ))
      )
        issue("Polygon points must be local to the slot");
    }
    for (const f of t.textFields) {
      if (
        f.minSize > f.fontSize ||
        f.fontSize > f.height ||
        f.defaultValue.length > f.maxLength
      )
        issue("Invalid text sizing or default");
      if (
        f.x < t.safeMargin ||
        f.y < t.safeMargin ||
        f.x + f.width > t.width - t.safeMargin ||
        f.y + f.height > t.height - t.safeMargin
      )
        issue("Text must stay inside safe print margins");
      if (
        f.visible &&
        t.photoSlots.some(
          (s) =>
            f.x < s.x + s.width &&
            f.x + f.width > s.x &&
            f.y < s.y + s.height &&
            f.y + f.height > s.y,
        )
      )
        issue("Text cannot overlap a photo slot");
    }
    if (t.status === "approved" && !t.photoSlots.length)
      issue("Approved templates require verified photo slots");
  });
export type Template = z.infer<typeof templateSchema>;
export type PhotoSlot = Template["photoSlots"][number];
export type TextField = Template["textFields"][number];
export async function loadTemplates(): Promise<Template[]> {
  const response = await fetch("/templates/manifest.json");
  if (!response.ok)
    throw new Error(
      "The template collection could not load. Please try again.",
    );
  const data = z
    .array(templateSchema)
    .min(1)
    .max(100)
    .parse(await response.json());
  if (
    new Set(data.map((t) => t.id)).size !== data.length ||
    new Set(data.map((t) => t.background)).size !== data.length
  )
    throw new Error("Each design needs a unique ID and original artwork file.");
  return data;
}
