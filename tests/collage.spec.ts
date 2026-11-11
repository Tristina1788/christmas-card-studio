import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import type { Template } from "../src/config/templates";
import { image } from "./fixtures/artwork";
const template = (
  JSON.parse(
    readFileSync("public/templates/manifest.json", "utf8"),
  ) as Template[]
).find((t) => t.id === "14")!;
test("collage keeps four uploaded photos independent and requires every opening", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Personalize Sage Scallop Collage",
      exact: true,
    })
    .click();
  const colors: [number, number, number][] = [
    [220, 55, 40],
    [30, 120, 200],
    [50, 170, 70],
    [160, 70, 180],
  ];
  for (let i = 0; i < template.photoSlots.length; i++) {
    await page
      .getByRole("combobox", { name: "Photo opening", exact: true })
      .selectOption(template.photoSlots[i].id);
    await page.getByLabel("Upload family photo").setInputFiles({
      name: `photo-${i}.png`,
      mimeType: "image/png",
      buffer: image(1200, 900, colors[i]),
    });
    await expect(
      page.getByRole("button", { name: "Replace photo" }),
    ).toBeVisible();
    if (i < 3)
      await expect(
        page.getByRole("button", { name: "Download PNG" }),
      ).toBeDisabled();
  }
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeEnabled();
  const centers = () =>
    page
      .locator(".card-canvas")
      .evaluate(
        (el, slots) =>
          slots.map((s) =>
            [
              ...(el as HTMLCanvasElement)
                .getContext("2d")!
                .getImageData(
                  Math.floor(s.x + s.width / 2),
                  Math.floor(s.y + s.height / 2),
                  1,
                  1,
                ).data,
            ].slice(0, 3),
          ),
        template.photoSlots,
      );
  await expect.poll(centers).toEqual(colors);
  await page
    .getByRole("combobox", { name: "Photo opening", exact: true })
    .selectOption("detail-2");
  await page.getByLabel("Upload family photo").setInputFiles({
    name: "replacement.png",
    mimeType: "image/png",
    buffer: image(1200, 900, [210, 170, 20]),
  });
  await expect(
    page.getByRole("button", { name: "Replace photo" }),
  ).toBeVisible();
  await expect
    .poll(centers)
    .toEqual([colors[0], colors[1], [210, 170, 20], colors[3]]);
});
