import { test, expect, type Page, type Locator } from "@playwright/test";
import { PNG } from "pngjs";
import { PDFDocument } from "pdf-lib";
import { readFileSync } from "node:fs";
import type { Template } from "../src/config/templates";
const collection = JSON.parse(
  readFileSync("public/templates/manifest.json", "utf8"),
) as Template[];
const woods = collection.find((t) => t.id === "22")!;
async function range(locator: Locator, value: number) {
  await locator.evaluate((el, value) => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(el, String(Math.round(value * 0.24 * 100) / 100));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}
async function paint(page: Page) {
  await page.evaluate(
    () =>
      new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r())),
      ),
  );
}
async function canvas(page: Page) {
  await paint(page);
  const url = await page
    .locator(".card-canvas")
    .evaluate((el) => (el as HTMLCanvasElement).toDataURL("image/png"));
  return PNG.sync.read(Buffer.from(url.split(",")[1], "base64"));
}
async function download(page: Page, label: string) {
  const promise = page.waitForEvent("download");
  await page.getByRole("button", { name: label, exact: true }).click();
  const stream = await (await promise).createReadStream();
  const chunks: Buffer[] = [];
  for await (const c of stream!) chunks.push(c);
  return Buffer.concat(chunks);
}
async function select(page: Page, name: string) {
  await page
    .getByRole("button", { name: `Personalize ${name}`, exact: true })
    .click();
  await expect(page.locator(".card-canvas")).toBeVisible();
}
async function open(page: Page) {
  await page.goto("/");
  await select(page, "Christmas in the Woods");
  await page
    .getByLabel("Upload family photo")
    .setInputFiles("public/templates/sample-family.png");
  await expect(
    page.getByRole("button", { name: "Replace photo" }),
  ).toBeVisible();
}
test("text sizes change printed text, match exports, persist per card, and reset", async ({
  page,
}, info) => {
  await open(page);
  await page.getByLabel("Family name", { exact: true }).fill("The Lee Family");
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeEnabled();
  const initial = await canvas(page);
  const family = page.getByRole("slider", {
    name: "Family name font size",
    exact: true,
  });
  const year = page.getByRole("slider", {
    name: "Year font size",
    exact: true,
  });
  await family.focus();
  await page.keyboard.press("ArrowRight");
  await expect(family).toHaveValue("15.6");
  await range(family, 90);
  await range(year, 68);
  await expect(family).toHaveAttribute("aria-valuetext", "21.6 points");
  await expect(year).toHaveAttribute("aria-valuetext", "16.3 points");
  const changed = await canvas(page);
  let insideChanges = 0,
    outsideChanges = 0;
  for (let y = 0; y < 2100; y += 2)
    for (let x = 0; x < 1500; x += 2) {
      const i = (y * 1500 + x) * 4;
      if (
        [0, 1, 2, 3].every((c) => initial.data[i + c] === changed.data[i + c])
      )
        continue;
      const inText = woods.textFields.some(
        (f) =>
          x >= f.x && x <= f.x + f.width && y >= f.y && y <= f.y + f.height,
      );
      if (inText) insideChanges++;
      else outsideChanges++;
    }
  expect(insideChanges).toBeGreaterThan(100);
  expect(outsideChanges).toBe(0);
  const png = PNG.sync.read(await download(page, "Download PNG"));
  expect(Buffer.compare(png.data, changed.data)).toBe(0);
  expect([png.width, png.height]).toEqual([1500, 2100]);
  const pdf = await PDFDocument.load(await download(page, "Download PDF"));
  expect(pdf.getPageCount()).toBe(1);
  expect(pdf.getPage(0).getSize()).toEqual({ width: 360, height: 504 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: info.outputPath("larger-text.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: /Back to collection/ }).click();
  await select(page, "Holly & Pine");
  await expect(family).toHaveValue("15.36");
  await range(family, 70);
  await page.getByRole("button", { name: /Back to collection/ }).click();
  await select(page, "Christmas in the Woods");
  await expect(family).toHaveValue("21.6");
  await expect(year).toHaveValue("16.32");
  await page
    .getByRole("button", { name: "Reset text sizes", exact: true })
    .click();
  await expect(family).toHaveValue("15.36");
  await expect(year).toHaveValue("10.08");
  await expect(page.getByLabel("Family name", { exact: true })).toHaveValue(
    "The Lee Family",
  );
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Start Over", exact: true }).click();
  await page.getByRole("button", { name: "Yes, start over" }).click();
  await page.getByRole("button", { name: /Back to collection/ }).click();
  await select(page, "Holly & Pine");
  await expect(family).toHaveValue("15.36");
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeDisabled();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("long names show actual fitted size and artwork greetings have no size control", async ({
  page,
}, info) => {
  await open(page);
  await expect(
    page.getByRole("slider", { name: "Greeting font size", exact: true }),
  ).toHaveCount(0);
  await page
    .getByLabel("Family name", { exact: true })
    .fill("The Anderson and Williams Family");
  const family = page.getByRole("slider", {
    name: "Family name font size",
    exact: true,
  });
  await family.focus();
  await page.keyboard.press("End");
  await expect(page.getByText(/^Auto-fitted to/)).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeEnabled();
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: info.outputPath("auto-fitted-text.png"),
    fullPage: true,
  });
  await page.getByLabel("Family name", { exact: true }).fill("W".repeat(60));
  await expect(page.getByRole("alert")).toContainText("too wide");
  await expect(page.getByText(/^Auto-fitted to/)).toHaveCount(0);
  await page.getByLabel("Family name", { exact: true }).fill("");
  await expect(page.getByRole("alert")).toContainText("Enter family name");
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: /Back to collection/ }).click();
  await select(page, "Botanical Noel");
  await page.getByLabel("Greeting", { exact: true }).fill("Joy");
  const greeting = page.getByRole("slider", {
    name: "Greeting font size",
    exact: true,
  });
  await greeting.focus();
  await page.keyboard.press("End");
  await expect(greeting).toHaveValue("26.4");
  await expect(greeting).toHaveAttribute("aria-valuetext", "26.4 points");
});
