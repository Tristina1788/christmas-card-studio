import { test, expect, type Page } from "@playwright/test";
import { PNG } from "pngjs";
import { PDFDocument } from "pdf-lib";
import { readFileSync, writeFileSync } from "node:fs";
import type { Template } from "../src/config/templates";
const templates = (
  JSON.parse(
    readFileSync("public/templates/manifest.json", "utf8"),
  ) as Template[]
).filter((t) => t.featured);
async function download(page: Page, label: string) {
  const pending = page.waitForEvent("download");
  await page.getByRole("button", { name: label, exact: true }).click();
  const stream = await (await pending).createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  return Buffer.concat(chunks);
}
for (const template of templates) {
  test(`${template.name} has editable type and exports the 5x7 layout`, async ({
    page,
  }, info) => {
    await page.goto("/");
    await expect(page.locator(".template-card").first()).toContainText(
      "Winter Botanical Arch",
    );
    await page
      .getByRole("button", {
        name: `Personalize ${template.name}`,
        exact: true,
      })
      .click();
    await expect(page.locator(".card-canvas")).toBeVisible();
    const pngButton = page.getByRole("button", {
      name: "Download PNG",
      exact: true,
    });
    await expect(pngButton).toBeDisabled();
    for (const slot of template.photoSlots) {
      if (template.photoSlots.length > 1)
        await page
          .getByRole("combobox", { name: "Photo opening", exact: true })
          .selectOption(slot.id);
      await page
        .getByLabel("Upload family photo")
        .setInputFiles("public/templates/sample-family.png");
      await expect(
        page.getByRole("button", { name: "Replace photo" }),
      ).toBeVisible();
      if (slot !== template.photoSlots.at(-1))
        await expect(pngButton).toBeDisabled();
    }
    await expect(page.getByLabel("Greeting", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("combobox", { name: "Greeting font", exact: true }),
    ).toHaveValue(
      template.textFields.find((f) => f.id === "greeting")!.fontFamily,
    );
    await expect(
      page.getByRole("spinbutton", {
        name: "Year font size in points",
        exact: true,
      }),
    ).not.toHaveAttribute("max");
    await expect(pngButton).toBeEnabled();
    await page.evaluate(async () => {
      await document.fonts.ready;
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
      );
    });
    const data = await page
      .locator(".card-canvas")
      .evaluate((el) => (el as HTMLCanvasElement).toDataURL());
    const preview = PNG.sync.read(Buffer.from(data.split(",")[1], "base64"));
    const pngBytes = await download(page, "Download PNG");
    const png = PNG.sync.read(pngBytes);
    expect([png.width, png.height]).toEqual([1500, 2100]);
    expect(Buffer.compare(preview.data, png.data)).toBe(0);
    const pdfBytes = await download(page, "Download PDF");
    const pdf = await PDFDocument.load(pdfBytes);
    expect(pdf.getPages()).toHaveLength(1);
    expect(pdf.getPage(0).getSize()).toEqual({ width: 360, height: 504 });
    writeFileSync(info.outputPath(`${template.id}-sample.pdf`), pdfBytes);
    writeFileSync(info.outputPath(`${template.id}-sample.png`), pngBytes);
    await page.evaluate(() => scrollTo(0, 0));
    await page.screenshot({
      path: info.outputPath(`${template.id}-editor.jpg`),
      type: "jpeg",
      quality: 85,
      fullPage: true,
    });
    await page
      .locator(".card-canvas")
      .screenshot({
        path: info.outputPath(`${template.id}-card.jpg`),
        type: "jpeg",
        quality: 90,
      });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  });
}
