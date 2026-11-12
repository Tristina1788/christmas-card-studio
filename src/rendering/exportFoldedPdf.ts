import { jsPDF } from "jspdf";

export type FoldedPaper = "a4" | "letter" | "exact";

// All dimensions are PDF points (72 pt = 1 inch). Each cover is 5 x 7 in.
export function foldedLayout(paper: FoldedPaper) {
  const [width, height] =
    paper === "a4"
      ? [(297 * 72) / 25.4, (210 * 72) / 25.4]
      : paper === "letter"
        ? [792, 612]
        : [720, 504];
  return { width, height, x: (width - 720) / 2, y: (height - 504) / 2 };
}

export function foldedPdfBlob(
  [front, back]: [HTMLCanvasElement, HTMLCanvasElement],
  paper: FoldedPaper = "a4",
) {
  const { width, height, x, y } = foldedLayout(paper);
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "pt",
    format: [width, height],
    compress: true,
  });
  doc.setProperties({
    title: "Christmas Card Studio - folded 5 x 7 inch card",
  });
  // Exterior: back cover on the left, front cover on the right, both upright.
  doc.addImage(
    back.toDataURL("image/png"),
    "PNG",
    x,
    y,
    360,
    504,
    "back",
    "FAST",
  );
  doc.addImage(
    front.toDataURL("image/png"),
    "PNG",
    x + 360,
    y,
    360,
    504,
    "front",
    "FAST",
  );

  if (paper !== "exact") {
    // Keep every guide outside the artwork; no fold line through the card.
    doc.setDrawColor(100);
    doc.setLineWidth(0.5);
    for (const cx of [x, x + 720]) {
      const sign = cx === x ? -1 : 1;
      for (const cy of [y, y + 504]) {
        const verticalSign = cy === y ? -1 : 1;
        doc.line(cx + sign * 3, cy, cx + sign * 12, cy);
        doc.line(cx, cy + verticalSign * 3, cx, cy + verticalSign * 12);
      }
    }
    doc.setLineDashPattern([2, 2], 0);
    doc.line(width / 2, y - 12, width / 2, y - 3);
    doc.line(width / 2, y + 507, width / 2, y + 516);
    doc.setLineDashPattern([], 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(80);
    doc.text("OUTSIDE - Back cover | Front cover", width / 2, 16, {
      align: "center",
    });
    doc.text(
      "Print at 100% / Actual size. Trim to the corner marks, then fold in half. Inside is blank.",
      width / 2,
      height - 12,
      { align: "center" },
    );
  }
  // Two printable sheet sides: outside, followed by a completely blank inside.
  doc.addPage([width, height], "landscape");
  // Discourage automatic scaling in PDF viewers (printer settings still apply).
  doc.viewerPreferences({
    PrintScaling: "None",
    Duplex: "DuplexFlipShortEdge",
  });
  return doc.output("blob");
}
