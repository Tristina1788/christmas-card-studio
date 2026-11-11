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
test("real collection has distinct lazily rendered gallery cards", async ({
  page,
}, info) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("response", (r) => {
    if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`);
  });
  await page.goto("/");
  await expect(page.locator(".template-card")).toHaveCount(templates.length);
  await expect(page.locator("canvas.template-image")).toHaveCount(
    templates.length,
  );
  for (let i = 0; i < templates.length; i++) {
    const canvas = page.locator("canvas.template-image").nth(i);
    await canvas.scrollIntoViewIfNeeded();
    await expect(canvas).toHaveAttribute("data-rendered", "true");
  }
  await page.evaluate(() => scrollTo(0, 0));
  await expect(
    page.getByText("Awaiting original artwork", { exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Illustrative sample photo", { exact: true }),
  ).toHaveCount(templates.length);
  const cards = await page
    .locator("canvas.template-image")
    .evaluateAll((canvases) =>
      canvases.map((c) => (c as HTMLCanvasElement).toDataURL()),
    );
  expect(new Set(cards).size).toBe(templates.length);
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
  test.setTimeout(240_000);
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
    for (const slot of t.photoSlots) {
      if (t.photoSlots.length > 1)
        await page
          .getByRole("combobox", { name: "Photo opening", exact: true })
          .selectOption(slot.id);
      await page
        .getByLabel("Upload family photo")
        .setInputFiles("public/templates/sample-family.png");
      await expect(
        page.getByRole("button", { name: "Replace photo" }),
      ).toBeVisible();
    }
    if (t.textFields.some((f) => f.kind === "greeting"))
      await page
        .getByLabel("Greeting", { exact: true })
        .fill(
          t.name === "Winter Village"
            ? "A Little More Merry"
            : "Happy Holidays",
        );
    else
      await expect(page.getByLabel("Greeting", { exact: true })).toHaveCount(0);
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
    for (const slot of t.photoSlots) {
      if (t.photoSlots.length > 1)
        await page
          .getByRole("combobox", { name: "Photo opening", exact: true })
          .selectOption(slot.id);
      await page.getByLabel("Upload family photo").setInputFiles({
        name: "boundary-check.png",
        mimeType: "image/png",
        buffer: PNG.sync.write(fixture),
      });
      await expect(
        page.getByRole("button", { name: "Replace photo" }),
      ).toBeVisible();
    }
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
      b.fillStyle = t.paperColor ?? "#faf8f2";
      b.fillRect(0, 0, 1500, 2100);
      if (t.backgroundFit === "contain") {
        const scale = Math.min(
            1500 / img.naturalWidth,
            2100 / img.naturalHeight,
          ),
          width = img.naturalWidth * scale,
          height = img.naturalHeight * scale;
        b.drawImage(
          img,
          (1500 - width) / 2,
          (2100 - height) / 2,
          width,
          height,
        );
      } else b.drawImage(img, 0, 0, 1500, 2100);
      const original = b.getImageData(0, 0, 1500, 2100).data;
      const mask = new Path2D();
      for (const slot of t.photoSlots) {
        if (slot.shape === "polygon") {
          slot.points!.forEach((p, i) =>
            i
              ? mask.lineTo(slot.x + p.x, slot.y + p.y)
              : mask.moveTo(slot.x + p.x, slot.y + p.y),
          );
          mask.closePath();
        } else if (slot.shape === "rounded")
          mask.roundRect(slot.x, slot.y, slot.width, slot.height, slot.radius);
        else mask.rect(slot.x, slot.y, slot.width, slot.height);
      }
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
          const inOrNearPhoto = t.photoSlots.some(
            (s) =>
              x >= s.x - 3 &&
              x <= s.x + s.width + 3 &&
              y >= s.y - 3 &&
              y <= s.y + s.height + 3,
          );
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
            inside(x - 8, y) &&
            inside(x + 8, y) &&
            inside(x, y - 8) &&
            inside(x, y + 8);
          const rgb = [...output.slice(index, index + 3)];
          if (
            interior &&
            Math.max(...rgb) - Math.min(...rgb) < 10 &&
            Math.min(...rgb) > 100 &&
            Math.max(...rgb) < 235
          )
            leftoverGray++;
        }
      let grayCorners = 0;
      for (const slot of t.photoSlots.filter((s) => s.matteColor)) {
        const p = (Math.floor(slot.y + 2) * 1500 + Math.floor(slot.x + 2)) * 4;
        const expected = slot
          .matteColor!.match(/[0-9a-f]{2}/gi)!
          .map((s) => parseInt(s, 16));
        if (expected.some((n, i) => Math.abs(output[p + i] - n) > 2))
          grayCorners++;
      }
      return { changedArtwork, leftoverGray, grayCorners };
    }, t);
    expect(audit, t.name).toEqual({
      changedArtwork: 0,
      leftoverGray: 0,
      grayCorners: 0,
    });
    await page.getByRole("button", { name: /Back to collection/ }).click();
  }
  expect(errors).toEqual([]);
  expect(uploads).toEqual([]);
});
