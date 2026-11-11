import { test, expect, type Page } from "@playwright/test";
import { PNG } from "pngjs";
import { approvedCollection, image } from "./fixtures/artwork";
async function select(page: Page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Personalize Nutcracker Noel", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Nutcracker Noel", exact: true }),
  ).toBeVisible();
}
async function addPhoto(page: Page) {
  await page.getByLabel("Upload family photo").setInputFiles({
    name: "photo.png",
    mimeType: "image/png",
    buffer: image(1600, 1600, [230, 110, 30]),
  });
  await expect(
    page.getByRole("button", { name: "Replace photo" }),
  ).toBeVisible();
}
async function pixel(page: Page, x: number, y: number) {
  return page
    .locator("canvas")
    .evaluate(
      (el, { x, y }) => [
        ...(el as HTMLCanvasElement).getContext("2d")!.getImageData(x, y, 1, 1)
          .data,
      ],
      { x, y },
    );
}
for (const shape of ["rounded", "polygon"] as const)
  test(`${shape} masks and authored foreground preserve boundary pixels`, async ({
    page,
  }) => {
    await approvedCollection(page, (templates) => {
      const t = templates[0];
      t.photoSlots[0].shape = shape;
      t.photoSlots[0].radius = 150;
      if (shape === "polygon")
        t.photoSlots[0].points = [
          { x: 0, y: 0 },
          { x: 1100, y: 0 },
          { x: 550, y: 1100 },
        ];
      t.foreground = "/templates/test-overlay.png";
    });
    const overlay = new PNG({ width: 1500, height: 2100 });
    overlay.data.fill(0);
    for (let y = 380; y < 470; y++)
      for (let x = 700; x < 800; x++) {
        const p = (y * 1500 + x) * 4;
        overlay.data[p] = 180;
        overlay.data[p + 1] = 20;
        overlay.data[p + 2] = 40;
        overlay.data[p + 3] = 255;
      }
    await page.route("**/templates/test-overlay.png", (r) =>
      r.fulfill({ contentType: "image/png", body: PNG.sync.write(overlay) }),
    );
    await select(page);
    await addPhoto(page);
    await expect.poll(() => pixel(page, 750, 800)).toEqual([230, 110, 30, 255]);
    expect(await pixel(page, 201, 1498)).toEqual([170, 170, 170, 255]); // outside the mask, original remains.
    expect(await pixel(page, 750, 440)).toEqual([180, 20, 40, 255]); // foreground stays above the photo.
  });
test("multiple openings keep independent photos and require every slot", async ({
  page,
}) => {
  await approvedCollection(page, (templates) => {
    templates[0].photoSlots = [
      {
        id: "photo",
        x: 200,
        y: 400,
        width: 500,
        height: 1000,
        shape: "rectangle",
        radius: 0,
      },
      {
        id: "second",
        x: 800,
        y: 400,
        width: 500,
        height: 1000,
        shape: "rectangle",
        radius: 0,
      },
    ];
  });
  await select(page);
  await addPhoto(page);
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeDisabled();
  await page
    .getByRole("combobox", { name: "Photo opening", exact: true })
    .selectOption("second");
  await expect(
    page.getByRole("button", { name: "Choose your photo" }),
  ).toBeVisible();
  await addPhoto(page);
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeEnabled();
});
test("artwork aspect ratio and native resolution are checked", async ({
  page,
}) => {
  await approvedCollection(page);
  await page.route("**/templates/template-01.jpg", (r) =>
    r.fulfill({
      contentType: "image/png",
      body: image(600, 400, [90, 80, 60]),
    }),
  );
  await select(page);
  await expect(
    page.getByText("This artwork has a different aspect ratio.", {
      exact: false,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Download PNG" }),
  ).toBeDisabled();
  await page.unroute("**/templates/template-01.jpg");
  await page.route("**/templates/template-01.jpg", (r) =>
    r.fulfill({
      contentType: "image/png",
      body: image(750, 1050, [90, 80, 60]),
    }),
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Personalize Nutcracker Noel", exact: true })
    .click();
  await expect(
    page.getByText("This original artwork is below", { exact: false }),
  ).toBeVisible();
});
test("touch pinch zoom and drag work inside the opening", async ({
  page,
  context,
}, info) => {
  test.skip(info.project.name !== "mobile", "Touch viewport only");
  await approvedCollection(page);
  await select(page);
  await addPhoto(page);
  const box = (await page.locator("canvas").boundingBox())!;
  const x = box.x + box.width / 2,
    y = box.y + box.height * 0.45;
  const client = await context.newCDPSession(page);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [
      { x: x - 10, y, id: 0 },
      { x: x + 10, y, id: 1 },
    ],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [
      { x: x - 20, y, id: 0 },
      { x: x + 20, y, id: 1 },
    ],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(async () =>
      Number(
        await page
          .getByRole("slider", { name: "Zoom", exact: true })
          .inputValue(),
      ),
    )
    .toBeGreaterThan(1);
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y, id: 0 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchMove",
    touchPoints: [{ x: x + 10, y: y + 10, id: 0 }],
  });
  await client.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await expect
    .poll(async () =>
      Number(
        await page
          .getByRole("slider", { name: "Horizontal position", exact: true })
          .inputValue(),
      ),
    )
    .not.toBe(0);
});
