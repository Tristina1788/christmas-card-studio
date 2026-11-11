import { jsPDF } from "jspdf";
export function pdfBlob(canvas: HTMLCanvasElement) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: [360, 504],
    compress: true,
  });
  doc.setProperties({ title: "Christmas Card Studio · 5 × 7 inch card" });
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
  return doc.output("blob");
}
