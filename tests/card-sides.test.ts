import { it, expect } from "vitest";
import { readFileSync } from "node:fs";
import {
  sideTemplate,
  sideInput,
  type Session,
} from "../src/rendering/cardSides";
import { templateSchema, type Template } from "../src/config/templates";
import type { Artwork } from "../src/rendering/assets";
const templates = JSON.parse(
  readFileSync("public/templates/manifest.json", "utf8"),
) as Template[];
it("every card has valid message and collage back layouts within the same 5x7 page", () => {
  for (const t of templates)
    for (const layout of ["message", "collage"] as const) {
      const back = templateSchema.parse(sideTemplate(t, "back", layout));
      expect([
        back.width,
        back.height,
        back.printWidth,
        back.printHeight,
      ]).toEqual([1500, 2100, 5, 7]);
      expect(back.photoSlots).toHaveLength(layout === "message" ? 0 : 3);
      expect(back.background).not.toBe(t.background);
    }
});
it("back state never consumes front photos, crops, fonts or message overrides", () => {
  const session: Session = {
    photos: { photo: {} as ImageBitmap },
    crops: { "29:photo": { zoom: 2, x: 1, y: 0 } },
    values: {
      family: "The Lee Family",
      greeting: "Front only",
      "29:back:greeting": "Back only",
    },
    fontSizes: { "29:year": 200 },
    fontFamilies: { "29:greeting": "Arial" },
    backLayouts: { "29": "collage" },
  };
  const t = templates.find((t) => t.id === "29")!;
  const back = sideInput(t, session, "back", {} as Artwork);
  expect(back.photos["back-main"]).toBeUndefined();
  expect(back.values.family).toBe("The Lee Family");
  expect(back.values.greeting).toBe("Back only");
  expect(back.fontSizes?.year).toBeUndefined();
  expect(back.fontFamilies?.greeting).toBe("GreatVibes");
  expect(back.crops["back-main"].zoom).toBe(1);
});
