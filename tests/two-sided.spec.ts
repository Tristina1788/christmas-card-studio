import { test, expect, type Page } from "@playwright/test";
import { PNG } from "pngjs";
import {
  PDFDocument,
  PDFArray,
  PDFName,
  PDFDict,
  PDFRawStream,
  decodePDFRawStream,
} from "pdf-lib";
import { writeFileSync } from "node:fs";
async function download(page: Page, name: string) {
  const wait = page.waitForEvent("download");
  await page.getByRole("button", { name, exact: true }).click();
  const stream = await (await wait).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  return Buffer.concat(chunks);
}
async function preview(page: Page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise<void>((r) =>
      requestAnimationFrame(() => requestAnimationFrame(() => r())),
    );
  });
  return PNG.sync.read(
    Buffer.from(
      (
        await page
          .locator(".card-canvas")
          .evaluate((el) => (el as HTMLCanvasElement).toDataURL())
      ).split(",")[1],
      "base64",
    ),
  );
}
// Independently decode the PDF image's PNG predictor to verify actual page pixels/order.
function pdfPixels(pdf: PDFDocument, index: number) {
  const objects = pdf
    .getPage(index)
    .node.Resources()!
    .lookup(PDFName.of("XObject"), PDFDict);
  const contents = pdf.getPage(index).node.Contents()!;
  const content = pdf.context.lookup(
    contents instanceof PDFArray ? contents.get(0) : contents,
  ) as PDFRawStream;
  const commands = new TextDecoder().decode(
    decodePDFRawStream(content).decode(),
  );
  const imageName = commands.match(/\/(I\d+)\s+Do/)![1];
  const stream = objects.lookup(PDFName.of(imageName)) as PDFRawStream;
  expect(stream).toBeDefined();
  const bytes = decodePDFRawStream(stream).decode();
  const width = 1500,
    height = 2100,
    bpp = 3,
    stride = width * bpp;
  expect(bytes.length).toBe((stride + 1) * height);
  const rgb = Buffer.alloc(stride * height);
  const paeth = (a: number, b: number, c: number) => {
    const p = a + b - c,
      pa = Math.abs(p - a),
      pb = Math.abs(p - b),
      pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  for (let y = 0; y < height; y++) {
    const filter = bytes[y * (stride + 1)];
    for (let x = 0; x < stride; x++) {
      const i = y * stride + x,
        a = x >= bpp ? rgb[i - bpp] : 0,
        b = y ? rgb[i - stride] : 0,
        c = y && x >= bpp ? rgb[i - stride - bpp] : 0;
      const delta =
        filter === 0
          ? 0
          : filter === 1
            ? a
            : filter === 2
              ? b
              : filter === 3
                ? Math.floor((a + b) / 2)
                : paeth(a, b, c);
      rgb[i] = (bytes[y * (stride + 1) + 1 + x] + delta) & 255;
    }
  }
  return rgb;
}
function rgb(png: PNG) {
  const result = Buffer.alloc(png.width * png.height * 3);
  for (let i = 0, j = 0; i < png.data.length; i += 4) {
    result[j++] = png.data[i];
    result[j++] = png.data[i + 1];
    result[j++] = png.data[i + 2];
  }
  return result;
}
test("front and back previews, PNGs, and PDF pages match; edits and photos stay independent", async ({
  page,
}, info) => {
  test.setTimeout(90_000);
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "Personalize Berry Scallop Oval",
      exact: true,
    })
    .click();
  await page
    .getByLabel("Upload family photo")
    .setInputFiles("public/templates/sample-family.png");
  await expect(
    page.getByRole("button", { name: "Replace photo" }),
  ).toBeVisible();
  await page.getByLabel("Family name", { exact: true }).fill("The Lee Family");
  const front = await preview(page);
  const frontBytes = await download(page, "Download front PNG");
  expect(Buffer.compare(front.data, PNG.sync.read(frontBytes).data)).toBe(0);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByLabel("Back heading", { exact: true })).toBeVisible();
  await expect(page.locator(".card-canvas")).toBeVisible();
  await expect(page.getByLabel("Family name", { exact: true })).toHaveValue(
    "The Lee Family",
  );
  await page
    .getByLabel("Back heading", { exact: true })
    .fill("Our favorite memories");
  await page
    .getByRole("combobox", { name: "Back heading font", exact: true })
    .selectOption("GreatVibes");
  await page
    .getByRole("spinbutton", { name: "Year font size in points", exact: true })
    .fill("24");
  await page
    .getByRole("spinbutton", { name: "Year font size in points", exact: true })
    .blur();
  const messageBack = await preview(page);
  expect(Buffer.compare(front.data, messageBack.data)).not.toBe(0);
  await page
    .getByRole("combobox", { name: "Back layout", exact: true })
    .selectOption("collage");
  await expect(
    page.getByRole("button", { name: "Download PDF", exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Download front PNG", exact: true }),
  ).toBeEnabled();
  const colors = [
    [210, 40, 30],
    [30, 140, 70],
    [30, 70, 200],
  ];
  for (const [index, slot] of [
    "back-main",
    "back-left",
    "back-right",
  ].entries()) {
    await page
      .getByRole("combobox", { name: "Photo opening", exact: true })
      .selectOption(slot);
    const png = new PNG({ width: 800, height: 800 });
    for (let i = 0; i < png.data.length; i += 4) {
      png.data[i] = colors[index][0];
      png.data[i + 1] = colors[index][1];
      png.data[i + 2] = colors[index][2];
      png.data[i + 3] = 255;
    }
    await page.getByLabel("Upload family photo").setInputFiles({
      name: `${slot}.png`,
      mimeType: "image/png",
      buffer: PNG.sync.write(png),
    });
    await expect(
      page.getByRole("button", { name: "Replace photo" }),
    ).toBeVisible();
    if (index < 2)
      await expect(
        page.getByRole("button", { name: "Download PDF", exact: true }),
      ).toBeDisabled();
  }
  const back = await preview(page);
  for (const [i, [x, y]] of [
    [750, 725],
    [490, 1295],
    [1000, 1295],
  ].entries()) {
    const offset = (y * 1500 + x) * 4;
    expect([...back.data.subarray(offset, offset + 3)]).toEqual(colors[i]);
  }
  const backBytes = await download(page, "Download back PNG");
  expect(Buffer.compare(back.data, PNG.sync.read(backBytes).data)).toBe(0);
  const pdfBytes = await download(page, "Download PDF");
  const pdf = await PDFDocument.load(pdfBytes);
  expect(pdf.getPages()).toHaveLength(2);
  for (const p of pdf.getPages())
    expect(p.getSize()).toEqual({ width: 360, height: 504 });
  expect(Buffer.compare(pdfPixels(pdf, 0), rgb(front))).toBe(0);
  expect(Buffer.compare(pdfPixels(pdf, 1), rgb(back))).toBe(0);
  writeFileSync(info.outputPath("front.png"), frontBytes);
  writeFileSync(info.outputPath("back.png"), backBytes);
  writeFileSync(info.outputPath("front-and-back.pdf"), pdfBytes);
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: info.outputPath("back-editor.jpg"),
    fullPage: true,
    type: "jpeg",
    quality: 85,
  });
  await page
    .locator(".card-canvas")
    .screenshot({ path: info.outputPath("back-card.jpg"), type: "jpeg" });
  // Save a customer-facing collage example separately from the diagnostic color proof.
  for (const slot of ["back-main", "back-left", "back-right"]) {
    await page
      .getByRole("combobox", { name: "Photo opening", exact: true })
      .selectOption(slot);
    await page
      .getByLabel("Upload family photo")
      .setInputFiles("public/templates/sample-family.png");
    await expect(
      page.getByRole("button", { name: "Replace photo" }),
    ).toBeVisible();
  }
  writeFileSync(info.outputPath("collage-front.png"), frontBytes);
  writeFileSync(
    info.outputPath("collage-back.png"),
    await download(page, "Download back PNG"),
  );
  writeFileSync(
    info.outputPath("collage-sample.pdf"),
    await download(page, "Download PDF"),
  );
  await page.evaluate(() => scrollTo(0, 0));
  await page.locator(".card-canvas").screenshot({
    path: info.outputPath("collage-back-card.jpg"),
    type: "jpeg",
    quality: 90,
  });
  await page.screenshot({
    path: info.outputPath("collage-back-editor.jpg"),
    fullPage: true,
    type: "jpeg",
    quality: 85,
  });
  await page.getByRole("button", { name: "Front", exact: true }).click();
  await expect(page.getByLabel("Greeting", { exact: true })).toHaveValue(
    "Merry Christmas",
  );
  await expect(
    page.getByRole("spinbutton", {
      name: "Year font size in points",
      exact: true,
    }),
  ).not.toHaveValue("24");
  expect(Buffer.compare((await preview(page)).data, front.data)).toBe(0);
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await expect(page.getByLabel("Back heading", { exact: true })).toHaveValue(
    "Our favorite memories",
  );
  await page.getByRole("button", { name: "Start Over", exact: true }).click();
  await page.getByRole("button", { name: "Yes, start over" }).click();
  await expect(
    page.getByRole("combobox", { name: "Back layout", exact: true }),
  ).toHaveValue("message");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
