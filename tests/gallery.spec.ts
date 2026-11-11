import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
import { approvedCollection } from "./fixtures/artwork";
test("missing originals are honest, accessible, and cannot export", async ({
  page,
}, info) => {
  const failures: string[] = [];
  page.on("pageerror", (e) => failures.push(e.message));
  await page.route("**/templates/manifest.json", (route) =>
    route.fulfill({
      contentType: "application/json",
      body: readFileSync(
        "public/templates/owner-originals.pending.json",
        "utf8",
      ),
    }),
  );
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "The Christmas collection" }),
  ).toBeVisible();
  await expect(page.locator(".template-card")).toHaveCount(10);
  await expect(
    page.getByText("Awaiting original artwork", { exact: true }),
  ).toHaveCount(10);
  await expect(page.locator("img")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: info.outputPath("gallery-awaiting-originals.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Personalize Nutcracker Noel", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Nutcracker Noel", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Download front PNG" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Download PDF" }),
  ).toBeDisabled();
  await page.screenshot({
    path: info.outputPath("editor-awaiting-originals.png"),
    fullPage: true,
  });
  expect(failures).toEqual([]);
});
test("each approved design loads its own artwork and editor", async ({
  page,
}, info) => {
  await approvedCollection(page);
  await page.goto("/");
  await expect(page.locator(".template-image")).toHaveCount(10);
  const srcs = await page
    .locator(".template-image")
    .evaluateAll((imgs) => imgs.map((i) => (i as HTMLImageElement).src));
  expect(new Set(srcs).size).toBe(10);
  expect(
    await page
      .locator(".template-image")
      .evaluateAll((imgs) =>
        imgs.every(
          (i) =>
            (i as HTMLImageElement).complete &&
            (i as HTMLImageElement).naturalWidth > 0,
        ),
      ),
  ).toBe(true);
  for (let i = 0; i < 10; i++) {
    const name = await page.locator(".template-card h3").nth(i).innerText();
    await page.locator(".template-card button").nth(i).click();
    await expect(
      page.getByRole("heading", { name, exact: true }),
    ).toBeVisible();
    await expect(page.locator("canvas")).toBeVisible();
    await page.screenshot({
      path: info.outputPath(`synthetic-layout-${i + 1}.png`),
      fullPage: true,
    });
    await page.getByRole("button", { name: /Back to collection/ }).click();
  }
});
