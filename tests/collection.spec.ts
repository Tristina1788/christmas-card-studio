import { test, expect, type Page } from "@playwright/test";
import { PNG } from "pngjs";
import { PDFDocument } from "pdf-lib";
import { readFileSync } from "node:fs";
import type { Template } from "../src/config/templates";
const templates = JSON.parse(
  readFileSync("public/templates/manifest.json", "utf8"),
) as Template[];
async function download(page: Page, name: string) {
  const promise = page.waitForEvent("download");
  await page.getByRole("button", { name, exact: true }).click();
  const stream = await (await promise).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  return Buffer.concat(chunks);
}
async function pixels(page: Page) {
  return page
    .locator(".card-canvas")
    .evaluate((c) => (c as HTMLCanvasElement).toDataURL("image/png"));
}
test("real collection has three distinct fully rendered gallery cards", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  await page.goto("/");
  await expect(page.locator(".template-card")).toHaveCount(3);
  await expect(page.locator("canvas.template-image")).toHaveCount(3);
  await expect
    .poll(() =>
      page.locator("canvas.template-image").evaluateAll((canvases) =>
        canvases.every((el) => {
          const c = el as HTMLCanvasElement;
          return (
            c.getContext("2d")!.getImageData(750, 900, 1, 1).data[3] === 255
          );
        }),
      ),
    )
    .toBe(true);
  await expect(
    page.getByText("Awaiting original artwork", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Illustrative sample photo", { exact: true }),
  ).toHaveCount(3);
  const cards = await page
    .locator("canvas.template-image")
    .evaluateAll((canvases) =>
      canvases.map((c) => (c as HTMLCanvasElement).toDataURL()),
    );
  expect(new Set(cards).size).toBe(3);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("watercolor-gallery.png"),
    fullPage: true,
  });
  expect(errors).toEqual([]);
});
test("all real templates preserve artwork, personalize, and export identical PNG and exact PDF", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const uploads: string[] = [];
  page.on("request", (r) => {
    if (r.method() === "POST") uploads.push(r.url());
  });
  await page.goto("/");
  for (const t of templates) {
    await page
      .getByRole("button", { name: `Personalize ${t.name}`, exact: true })
      .click();
    await expect(page.locator(".card-canvas")).toBeVisible();
    if (t === templates[0])
      await expect(
        page.getByRole("button", { name: "Download PNG" }),
      ).toBeDisabled();
    await page
      .getByLabel("Upload family photo")
      .setInputFiles("public/templates/sample-family.png");
    await expect(
      page.getByRole("button", { name: "Replace photo" }),
    ).toBeVisible();
    await page
      .getByLabel("Greeting", { exact: true })
      .fill(
        t.name === "Winter Village" ? "A Little More Merry" : "Happy Holidays",
      );
    await page
      .getByLabel("Family name", { exact: true })
      .fill("The Williams Family");
    await page.getByLabel("Year", { exact: true }).fill("2026");
    await expect(
      page.getByRole("button", { name: "Download PNG" }),
    ).toBeEnabled();
    await expect(
      page.getByText("This original artwork is below", { exact: false }),
    ).toBeVisible();
    // Font readiness + a paint frame before comparing the actual preview with downloaded pixels.
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const before = PNG.sync.read(
      Buffer.from((await pixels(page)).split(",")[1], "base64"),
    );
    const png = PNG.sync.read(await download(page, "Download PNG"));
    expect([png.width, png.height]).toEqual([1500, 2100]);
    expect(Buffer.compare(before.data, png.data)).toBe(0);
    const pdf = await PDFDocument.load(await download(page, "Download PDF"));
    expect(pdf.getPages()).toHaveLength(1);
    expect(pdf.getPage(0).getSize()).toEqual({ width: 360, height: 504 });
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: info.outputPath(`${t.id}-personalized.png`),
      fullPage: true,
    });
    // A saturated diagnostic photo reveals any remaining neutral gray opening pixels.
    const fixture = new PNG({ width: 1200, height: 1500 });
    for (let i = 0; i < fixture.data.length; i += 4) {
      fixture.data[i] = 20;
      fixture.data[i + 1] = 90;
      fixture.data[i + 2] = 155;
      fixture.data[i + 3] = 255;
    }
    await page.getByLabel("Upload family photo").setInputFiles({
      name: "boundary-check.png",
      mimeType: "image/png",
      buffer: PNG.sync.write(fixture),
    });
    await expect(
      page.getByRole("button", { name: "Replace photo" }),
    ).toBeVisible();
    await page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        ),
    );
    const audit = await page.locator(".card-canvas").evaluate(async (el, t) => {
      const c = el as HTMLCanvasElement,
        ctx = c.getContext("2d")!,
        output = ctx.getImageData(0, 0, 1500, 2100).data;
      const img = new Image();
      img.src = t.background;
      await img.decode();
      const base = document.createElement("canvas");
      base.width = 1500;
      base.height = 2100;
      const b = base.getContext("2d")!;
      b.drawImage(img, 0, 0, 1500, 2100);
      const original = b.getImageData(0, 0, 1500, 2100).data;
      const slot = t.photoSlots[0],
        mask = new Path2D();
      if (slot.shape === "polygon") {
        slot.points!.forEach((p, i) =>
          i
            ? mask.lineTo(slot.x + p.x, slot.y + p.y)
            : mask.moveTo(slot.x + p.x, slot.y + p.y),
        );
        mask.closePath();
      } else mask.rect(slot.x, slot.y, slot.width, slot.height);
      const maskCanvas = document.createElement("canvas");
      maskCanvas.width = 1500;
      maskCanvas.height = 2100;
      const maskCtx = maskCanvas.getContext("2d")!;
      maskCtx.fill(mask);
      const maskPixels = maskCtx.getImageData(0, 0, 1500, 2100).data;
      const inside = (x: number, y: number) =>
        x >= 0 &&
        x < 1500 &&
        y >= 0 &&
        y < 2100 &&
        maskPixels[(Math.floor(y) * 1500 + Math.floor(x)) * 4 + 3] > 0;
      let changedArtwork = 0,
        leftoverGray = 0;
      for (let y = 0; y < 2100; y += 3)
        for (let x = 0; x < 1500; x += 3) {
          const index = (y * 1500 + x) * 4;
          const inOrNearPhoto = [
            [-3, -3],
            [-3, 3],
            [3, -3],
            [3, 3],
            [0, 0],
          ].some(([dx, dy]) => inside(x + dx, y + dy));
          const inText = t.textFields.some(
            (f) =>
              f.visible &&
              x >= f.x - 2 &&
              x <= f.x + f.width + 2 &&
              y >= f.y - 2 &&
              y <= f.y + f.height + 2,
          );
          if (
            !inOrNearPhoto &&
            !inText &&
            [0, 1, 2, 3].some(
              (ch) => original[index + ch] !== output[index + ch],
            )
          )
            changedArtwork++;
          const interior =
            inside(x, y) &&
            inside(x - 3, y) &&
            inside(x + 3, y) &&
            inside(x, y - 3) &&
            inside(x, y + 3);
          const rgb = [...output.slice(index, index + 3)];
          if (
            interior &&
            Math.max(...rgb) - Math.min(...rgb) < 10 &&
            Math.min(...rgb) > 100 &&
            Math.max(...rgb) < 235
          )
            leftoverGray++;
        }
      return { changedArtwork, leftoverGray };
    }, t);
    expect(audit).toEqual({ changedArtwork: 0, leftoverGray: 0 });
    await page.getByRole("button", { name: /Back to collection/ }).click();
  }
  expect(errors).toEqual([]);
  expect(uploads).toEqual([]);
});
