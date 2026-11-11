import { test, expect, type Page, type Locator } from "@playwright/test";
import { PNG } from "pngjs";
import { PDFDocument } from "pdf-lib";
import {
  approvedCollection,
  portrait,
  image,
  colors,
} from "./fixtures/artwork";
async function openEditor(page: Page) {
  await approvedCollection(page);
  await page.goto("/");
  await page
    .getByRole("button", { name: "Personalize Nutcracker Noel", exact: true })
    .click();
  await expect(page.locator("canvas")).toBeVisible();
}
async function upload(
  page: Page,
  buffer = portrait(),
  name = "family.png",
  mimeType = "image/png",
) {
  await page
    .getByLabel("Upload family photo")
    .setInputFiles({ name, mimeType, buffer });
  await expect(
    page.getByRole("button", { name: "Replace photo" }),
  ).toBeVisible();
}
async function setRange(locator: Locator, value: number) {
  await locator.evaluate((el, value) => {
    Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )!.set!.call(el, String(value));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
  }, value);
}
async function canvasData(page: Page) {
  return page
    .locator("canvas")
    .evaluate((el) => (el as HTMLCanvasElement).toDataURL("image/png"));
}
async function downloaded(page: Page, button: string) {
  const event = page.waitForEvent("download");
  await page.getByRole("button", { name: button, exact: true }).click();
  const dl = await event;
  const stream = await dl.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of stream!) chunks.push(chunk);
  return Buffer.concat(chunks);
}
test("photo crop, personalization, switching, reset, and accurate downloads", async ({
  page,
}, info) => {
  await openEditor(page);
  await upload(page);
  await page
    .getByLabel("Family name", { exact: true })
    .fill("Love, The Johnsons");
  await page.getByLabel("Year", { exact: true }).fill("2026");
  const zoom = page.getByRole("slider", { name: /Zoom/ });
  await zoom.focus();
  await page.keyboard.press("ArrowRight");
  await expect(zoom).toHaveValue("1.01");
  await setRange(zoom, 1.8);
  await expect(zoom).toHaveValue("1.8");
  await setRange(
    page.getByRole("slider", { name: /Horizontal position/ }),
    0.5,
  );
  await setRange(page.getByRole("slider", { name: /Vertical position/ }), -0.4);
  const c = page.locator("canvas");
  await c.focus();
  await page.keyboard.press("ArrowLeft");
  expect(
    Number(
      await page
        .getByRole("slider", { name: /Horizontal position/ })
        .inputValue(),
    ),
  ).toBeLessThan(0.5);
  if (info.project.name === "desktop") {
    const box = (await c.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height * 0.45);
    await page.mouse.down();
    await page.mouse.move(
      box.x + box.width / 2 + 20,
      box.y + box.height * 0.45 + 20,
      { steps: 4 },
    );
    await page.mouse.up();
  }
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeEnabled();
  await expect
    .poll(async () => {
      const url = await canvasData(page);
      return PNG.sync.read(Buffer.from(url.split(",")[1], "base64")).data[0];
    })
    .toBe(colors[0][0]);
  const preview = PNG.sync.read(
    Buffer.from((await canvasData(page)).split(",")[1], "base64"),
  );
  const bytes = await downloaded(page, "Download PNG");
  const png = PNG.sync.read(bytes);
  expect([png.width, png.height]).toEqual([1500, 2100]);
  expect(Buffer.compare(png.data, preview.data)).toBe(0);
  const phys = bytes.indexOf(Buffer.from("pHYs"));
  expect(bytes.readUInt32BE(phys + 4)).toBe(11811);
  expect(bytes.readUInt32BE(phys + 8)).toBe(11811);
  // Outside the opening and text boxes every pixel must remain the original artwork.
  for (let y = 0; y < 2100; y += 21)
    for (let x = 0; x < 1500; x += 15) {
      if (
        (x >= 200 && x < 1300 && y >= 400 && y < 1500) ||
        (x >= 150 && x < 1350 && y >= 1650 && y < 1750) ||
        (x >= 450 && x < 1050 && y >= 1780 && y < 1850)
      )
        continue;
      const p = (y * 1500 + x) * 4;
      expect([...png.data.subarray(p, p + 3)]).toEqual(colors[0]);
    }
  const at = (800 * 1500 + 750) * 4;
  expect([...png.data.subarray(at, at + 3)]).not.toEqual([170, 170, 170]);
  const pdf = await PDFDocument.load(await downloaded(page, "Download PDF"));
  expect(pdf.getPageCount()).toBe(1);
  expect(pdf.getPage(0).getSize()).toEqual({ width: 360, height: 504 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: info.outputPath("synthetic-editor.png"),
    fullPage: true,
  });
  await page.getByRole("button", { name: /Back to collection/ }).click();
  await page
    .getByRole("button", { name: "Personalize Holly & Pine", exact: true })
    .click();
  await expect(page.getByLabel("Family name", { exact: true })).toHaveValue(
    "Love, The Johnsons",
  );
  await expect(
    page.getByRole("button", { name: "Replace photo" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Back to collection/ }).click();
  await page
    .getByRole("button", { name: "Personalize Nutcracker Noel", exact: true })
    .click();
  await expect(zoom).toHaveValue("1.8");
  await page.getByRole("button", { name: "Reset crop", exact: true }).click();
  await expect(zoom).toHaveValue("1");
  await page.getByLabel("Family name", { exact: true }).fill("");
  await expect(page.getByRole("alert")).toContainText("Enter family name");
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeDisabled();
  await page
    .getByLabel("Family name", { exact: true })
    .fill(
      "WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW",
    );
  await expect(page.getByRole("alert")).toContainText("too wide");
  await page
    .getByLabel("Family name", { exact: true })
    .fill("The Very Merry Anderson and Williams Family");
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeEnabled();
  await page.getByLabel("Year", { exact: true }).fill("");
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeEnabled();
  await page.getByRole("button", { name: "Start Over", exact: true }).click();
  await page.getByRole("button", { name: "Keep editing" }).click();
  await expect(
    page.getByRole("button", { name: "Replace photo" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Start Over", exact: true }).click();
  await page.getByRole("button", { name: "Yes, start over" }).click();
  await expect(
    page.getByRole("button", { name: "Choose your photo" }),
  ).toBeVisible();
  await expect(page.getByLabel("Family name", { exact: true })).toHaveValue(
    "The Anderson Family",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
test("landscape replacement and invalid uploads preserve a valid card", async ({
  page,
}) => {
  await openEditor(page);
  await upload(page);
  await upload(
    page,
    image(1800, 1000, [200, 60, 30]),
    "landscape.webp",
    "image/png",
  );
  await page.getByLabel("Upload family photo").setInputFiles({
    name: "bad.txt",
    mimeType: "text/plain",
    buffer: Buffer.from("hello"),
  });
  await expect(page.getByRole("alert")).toContainText(
    "Choose a JPEG, PNG, or WebP",
  );
  await page.getByLabel("Upload family photo").setInputFiles({
    name: "broken.png",
    mimeType: "image/png",
    buffer: Buffer.from("broken"),
  });
  await expect(page.getByRole("alert")).toContainText("couldn’t read");
  await expect(
    page.getByRole("button", { name: "Replace photo" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeEnabled();
});
test("EXIF phone orientation is honored", async ({ page }) => {
  await openEditor(page);
  const encoded = await page.evaluate(() => {
    const c = document.createElement("canvas");
    c.width = 120;
    c.height = 60;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "red";
    ctx.fillRect(0, 0, 120, 30);
    ctx.fillStyle = "blue";
    ctx.fillRect(0, 30, 120, 30);
    return c.toDataURL("image/jpeg", 1).split(",")[1];
  });
  const jpeg = Buffer.from(encoded, "base64");
  // APP1 Exif with a little-endian TIFF orientation tag (6: rotate 90° CW).
  const exif = Buffer.from(
    "ffe1002245786966000049492a0008000000010012010300010000000600000000000000",
    "hex",
  );
  const oriented = Buffer.concat([jpeg.subarray(0, 2), exif, jpeg.subarray(2)]);
  await upload(page, oriented, "phone.jpg", "image/jpeg");
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeEnabled();
  const output = PNG.sync.read(await downloaded(page, "Download PNG"));
  const left = (900 * 1500 + 230) * 4,
    right = (900 * 1500 + 1270) * 4;
  expect(output.data[left + 2]).toBeGreaterThan(output.data[left]);
  expect(output.data[right]).toBeGreaterThan(output.data[right + 2]);
});
test("missing or wrong-ratio approved artwork fails safely", async ({
  page,
}) => {
  await approvedCollection(page);
  await page.route("**/templates/template-01.jpg", (r) =>
    r.fulfill({ status: 404, body: "missing" }),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Personalize Nutcracker Noel", exact: true })
    .click();
  await expect(
    page.getByText("This design’s original image could not load.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeDisabled();
});
