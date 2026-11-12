import { describe, expect, it } from "vitest";
import { PNG } from "pngjs";
import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFRawStream,
  decodePDFRawStream,
} from "pdf-lib";
import { foldedPdfBlob } from "../src/rendering/exportFoldedPdf";

function canvas(color: [number, number, number]) {
  const image = new PNG({ width: 2, height: 3 });
  for (let i = 0; i < image.data.length; i += 4)
    image.data.set([...color, 255], i);
  return {
    toDataURL: () =>
      `data:image/png;base64,${PNG.sync.write(image).toString("base64")}`,
  } as HTMLCanvasElement;
}

function commands(pdf: PDFDocument, index: number) {
  const contents = pdf.getPage(index).node.Contents()!;
  const stream = pdf.context.lookup(
    contents instanceof PDFArray ? contents.get(0) : contents,
  ) as PDFRawStream;
  return new TextDecoder().decode(decodePDFRawStream(stream).decode());
}

describe("folded greeting card PDF", () => {
  it.each([
    ["a4", (297 * 72) / 25.4, (210 * 72) / 25.4],
    ["letter", 792, 612],
    ["exact", 720, 504],
  ] as const)(
    "keeps 5 x 7 inch covers upright on %s paper and leaves inside blank",
    async (paper, width, height) => {
      const blob = foldedPdfBlob(
        [canvas([220, 20, 30]), canvas([20, 50, 220])],
        paper,
      );
      const pdf = await PDFDocument.load(await blob.arrayBuffer());
      expect(pdf.getPageCount()).toBe(2);
      for (const page of pdf.getPages()) {
        expect(page.getWidth()).toBeCloseTo(width, 4);
        expect(page.getHeight()).toBeCloseTo(height, 4);
      }
      const outside = commands(pdf, 0);
      const placements = [
        ...outside.matchAll(
          /([\d.]+) 0 0 ([\d.]+) ([\d.]+) ([\d.]+) cm\s+\/I\d+ Do/g,
        ),
      ];
      expect(placements).toHaveLength(2);
      for (const [index, placement] of placements.entries()) {
        expect(Number(placement[1])).toBeCloseTo(360, 4);
        expect(Number(placement[2])).toBeCloseTo(504, 4);
        expect(Number(placement[3])).toBeCloseTo(
          (width - 720) / 2 + index * 360,
          4,
        );
        expect(Number(placement[4])).toBeCloseTo((height - 504) / 2, 4);
      }
      // Inspect embedded RGB data: blue back on the left, red front on the right.
      const streams = pdf.context
        .enumerateIndirectObjects()
        .map(([, value]) => value)
        .filter(
          (value): value is PDFRawStream =>
            value instanceof PDFRawStream &&
            value.dict.get(PDFName.of("Subtype"))?.toString() === "/Image",
        );
      expect(streams).toHaveLength(2);
      expect([...decodePDFRawStream(streams[0]).decode().slice(1, 4)]).toEqual([
        20, 50, 220,
      ]);
      expect([...decodePDFRawStream(streams[1]).decode().slice(1, 4)]).toEqual([
        220, 20, 30,
      ]);
      expect(commands(pdf, 1)).not.toMatch(/\s(?:Do|Tj|TJ|m|l)\b/);
      const preferences = pdf.catalog.getViewerPreferences()!;
      expect(preferences.getPrintScaling()).toBe("None");
      expect(preferences.getDuplex()).toBe("DuplexFlipShortEdge");
      if (paper === "exact") expect(outside).not.toContain("Trim");
      else expect(outside).toContain("Trim");
    },
  );
});
