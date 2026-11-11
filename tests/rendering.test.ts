import { artworkPlacement } from "../src/rendering/artworkPlacement";
import { describe, it, expect, vi, afterEach } from "vitest";
import { photoGeometry, effectivePpi } from "../src/rendering/photoCrop";
import { templateSchema, loadTemplates } from "../src/config/templates";
import { readFileSync } from "node:fs";
const slot = {
  id: "photo",
  x: 200,
  y: 400,
  width: 1100,
  height: 1100,
  shape: "rectangle" as const,
  radius: 0,
};
describe("cover crop invariants", () => {
  for (const [width, height] of [
    [600, 1000],
    [1600, 900],
    [4000, 6000],
  ])
    for (const zoom of [1, 1.2, 4])
      for (const x of [-1, 0, 1])
        for (const y of [-1, 0, 1])
          it(`${width}×${height} z${zoom} (${x},${y}) has no empty edges`, () => {
            const g = photoGeometry({ width, height }, slot, { zoom, x, y });
            expect(g.x).toBeLessThanOrEqual(slot.x + 1e-8);
            expect(g.y).toBeLessThanOrEqual(slot.y + 1e-8);
            expect(g.x + g.width).toBeGreaterThanOrEqual(
              slot.x + slot.width - 1e-8,
            );
            expect(g.y + g.height).toBeGreaterThanOrEqual(
              slot.y + slot.height - 1e-8,
            );
          });
  it("reports effective source resolution", () =>
    expect(
      effectivePpi({ width: 1100, height: 1100 }, slot, {
        zoom: 2,
        x: 0,
        y: 0,
      }),
    ).toBe(150));
});
describe("template review gates", () => {
  const t = JSON.parse(
    readFileSync("public/templates/owner-originals.pending.json", "utf8"),
  )[0];
  it("all originals are explicitly pending", () => {
    for (const template of JSON.parse(
      readFileSync("public/templates/owner-originals.pending.json", "utf8"),
    ))
      expect(templateSchema.parse(template).status).toBe("awaiting-artwork");
  });
  it("does not approve unmeasured slots", () =>
    expect(templateSchema.safeParse({ ...t, status: "approved" }).success).toBe(
      false,
    ));
  it("rejects out of bounds slots", () =>
    expect(
      templateSchema.safeParse({ ...t, photoSlots: [{ ...slot, x: 1400 }] })
        .success,
    ).toBe(false));
  it("rejects an invalid mask", () =>
    expect(
      templateSchema.safeParse({
        ...t,
        photoSlots: [{ ...slot, shape: "polygon", points: [{ x: -1, y: 0 }] }],
      }).success,
    ).toBe(false));
});

describe("active collection loading", () => {
  const active = JSON.parse(
    readFileSync("public/templates/manifest.json", "utf8"),
  );
  afterEach(() => vi.unstubAllGlobals());
  it("loads the expanded collection without a hardcoded design limit", async () => {
    vi.stubGlobal(
      "fetch",
      async () => new Response(JSON.stringify(active), { status: 200 }),
    );
    const templates = await loadTemplates();
    expect(templates).toHaveLength(20);
    expect(templates.slice(0, 3).map((t) => t.name)).toEqual([
      "Botanical Noel",
      "Cranberry Garland",
      "Winter Village",
    ]);
    expect(templates.every((t) => t.status === "approved")).toBe(true);
  });
  it("rejects duplicate artwork paths", async () => {
    const duplicate = structuredClone(active);
    duplicate[1].background = duplicate[0].background;
    vi.stubGlobal(
      "fetch",
      async () => new Response(JSON.stringify(duplicate), { status: 200 }),
    );
    await expect(loadTemplates()).rejects.toThrow(
      "unique ID and original artwork file",
    );
  });
  it("rejects an empty collection", async () => {
    vi.stubGlobal("fetch", async () => new Response("[]", { status: 200 }));
    await expect(loadTemplates()).rejects.toThrow();
  });
});

describe("preserved artwork proportions", () => {
  it("fits off-ratio artwork entirely within the print page without distortion", () => {
    const p = artworkPlacement(
      { width: 1500, height: 2100, backgroundFit: "contain" },
      { naturalWidth: 1042, naturalHeight: 1510 },
    );
    expect(p.x).toBeGreaterThan(0);
    expect(p.y).toBe(0);
    expect(p.height).toBe(2100);
    expect(p.width / p.height).toBeCloseTo(1042 / 1510, 10);
    expect(p.x * 2 + p.width).toBeCloseTo(1500, 10);
  });
  it("keeps approved exact-ratio placement unchanged", () =>
    expect(
      artworkPlacement(
        { width: 1500, height: 2100 },
        { naturalWidth: 1060, naturalHeight: 1484 },
      ),
    ).toEqual({ x: 0, y: 0, width: 1500, height: 2100 }));
});
