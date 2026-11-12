import { test, expect } from "@playwright/test";
import { PDFDocument } from "pdf-lib";
import { approvedCollection, image, portrait } from "./fixtures/artwork";

test("download a folded card on standard paper and keep flat export available", async ({
  page,
}, info) => {
  await approvedCollection(page);
  await page.route("**/templates/backs/*.png", (route) =>
    route.fulfill({
      contentType: "image/png",
      body: image(1500, 2100, [240, 235, 220]),
    }),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Personalize Nutcracker Noel", exact: true })
    .click();
  const button = page.getByRole("button", {
    name: "Download folded PDF",
    exact: true,
  });
  await expect(button).toBeDisabled();
  await page
    .getByLabel("Upload family photo")
    .setInputFiles({
      name: "portrait.png",
      mimeType: "image/png",
      buffer: portrait(),
    });
  await expect(button).toBeEnabled();
  const select = page.getByLabel("Folded PDF paper size");
  await expect(select).toHaveValue("a4");
  for (const [paper, width, height] of [
    ["a4", (297 * 72) / 25.4, (210 * 72) / 25.4],
    ["letter", 792, 612],
    ["exact", 720, 504],
  ] as const) {
    await select.selectOption(paper);
    const wait = page.waitForEvent("download");
    await button.click();
    const download = await wait;
    expect(download.suggestedFilename()).toBe(
      `christmas-01-folded-${paper}.pdf`,
    );
    await download.saveAs(info.outputPath(`folded-${paper}.pdf`));
    const chunks: Buffer[] = [];
    for await (const chunk of (await download.createReadStream())!)
      chunks.push(chunk);
    const pdf = await PDFDocument.load(Buffer.concat(chunks));
    expect(pdf.getPageCount()).toBe(2);
    expect(pdf.getPage(0).getWidth()).toBeCloseTo(width, 4);
    expect(pdf.getPage(0).getHeight()).toBeCloseTo(height, 4);
  }
  await expect(
    page.getByRole("button", { name: "Download PDF", exact: true }),
  ).toBeEnabled();
  await page
    .locator(".download-panel")
    .screenshot({ path: info.outputPath("folded-controls.png") });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
