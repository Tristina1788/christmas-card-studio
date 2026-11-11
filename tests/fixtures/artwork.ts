// Synthetic geometric QA fixtures only. These are never shipped as card artwork.
import { PNG } from "pngjs";
import type { Template } from "../../src/config/templates";
import type { Page } from "@playwright/test";
import { readFileSync } from "node:fs";
export function image(
  width: number,
  height: number,
  color: [number, number, number],
  photoOpening = false,
) {
  const png = new PNG({ width, height });
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const inSlot =
        photoOpening && x >= 200 && x < 1300 && y >= 400 && y < 1500;
      png.data[i] = inSlot ? 170 : color[0];
      png.data[i + 1] = inSlot ? 170 : color[1];
      png.data[i + 2] = inSlot ? 170 : color[2];
      png.data[i + 3] = 255;
    }
  return PNG.sync.write(png);
}
export function portrait() {
  const png = new PNG({ width: 600, height: 1000 });
  for (let y = 0; y < 1000; y++)
    for (let x = 0; x < 600; x++) {
      const i = (y * 600 + x) * 4;
      png.data[i] = x < 300 ? 220 : 40;
      png.data[i + 1] = y < 500 ? 160 : 50;
      png.data[i + 2] = 90;
      png.data[i + 3] = 255;
    }
  return PNG.sync.write(png);
}
export const colors: [number, number, number][] = Array.from(
  { length: 10 },
  (_, i) => [50 + i * 17, 90 + i * 10, 120 + i * 6],
);
export async function approvedCollection(
  page: Page,
  customize?: (templates: Template[]) => void,
) {
  await page.addInitScript(() =>
    document.addEventListener("DOMContentLoaded", () => {
      const badge = document.createElement("div");
      badge.textContent = "SYNTHETIC QA FIXTURE · NOT ORIGINAL CARD ARTWORK";
      badge.style.cssText =
        "position:fixed;inset:0 0 auto;z-index:100;background:#fff3ce;color:#694a00;text-align:center;font:9px Arial;padding:5px;pointer-events:none";
      document.body.append(badge);
    }),
  );
  const manifest = JSON.parse(
    readFileSync("public/templates/manifest.json", "utf8"),
  ) as Template[];
  for (const t of manifest) {
    t.status = "approved";
    t.reviewNote = "SYNTHETIC QA FIXTURE — NOT ORIGINAL ARTWORK";
    t.photoSlots = [
      {
        id: "photo",
        x: 200,
        y: 400,
        width: 1100,
        height: 1100,
        shape: "rectangle",
        radius: 0,
      },
    ];
    t.textFields = [
      {
        id: "family",
        kind: "family",
        label: "Family name",
        x: 150,
        y: 1650,
        width: 1200,
        height: 100,
        fontFamily: "Georgia",
        fontSize: 64,
        minSize: 28,
        color: "#ffffff",
        align: "center",
        maxLength: 80,
        required: true,
        visible: true,
        defaultValue: "The Anderson Family",
      },
      {
        id: "year",
        kind: "year",
        label: "Year",
        x: 450,
        y: 1780,
        width: 600,
        height: 70,
        fontFamily: "Georgia",
        fontSize: 40,
        minSize: 28,
        color: "#ffffff",
        align: "center",
        maxLength: 4,
        required: false,
        visible: true,
        defaultValue: "",
      },
    ];
  }
  customize?.(manifest);
  await page.route("**/templates/manifest.json", (route) =>
    route.fulfill({ json: manifest }),
  );
  await page.route(/\/templates\/template-\d{2}\.jpg$/, (route) => {
    const id =
      Number(
        route
          .request()
          .url()
          .match(/template-(\d+)/)![1],
      ) - 1;
    return route.fulfill({
      contentType: "image/png",
      body: image(1500, 2100, colors[id], true),
    });
  });
}
