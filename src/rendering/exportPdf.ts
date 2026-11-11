import { jsPDF } from "jspdf";
export function pdfBlob(canvases: [HTMLCanvasElement, HTMLCanvasElement]) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [360, 504],
    compress: true,
  });
  doc.setProperties({
    title: "Christmas Card Studio · 5 × 7 inch card · Front and back",
  });
  for (const [index, canvas] of canvases.entries()) {
    if (index > 0) doc.addPage([360, 504], "portrait");
    doc.addImage(
      canvas.toDataURL("image/png"),
      "PNG",
      0,
      0,
      360,
      504,
      undefined,
      "FAST",
    );
  }
  return doc.output("blob");
}
