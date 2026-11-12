import { useState } from "react";
import type { FoldedPaper } from "../rendering/exportFoldedPdf";

export function DownloadPanel({
  frontDisabled,
  backDisabled,
  pdfDisabled,
  busy,
  onDownload,
}: {
  frontDisabled: boolean;
  backDisabled: boolean;
  pdfDisabled: boolean;
  busy: string | null;
  onDownload: (
    format: "front" | "back" | "pdf" | "folded",
    paper?: FoldedPaper,
  ) => void;
}) {
  const [paper, setPaper] = useState<FoldedPaper>("a4");
  return (
    <section className="control-section download-panel">
      <div className="control-title">
        <span>03</span>
        <h3>Ready to send some joy?</h3>
      </div>
      <p className="helper">
        Two sides · 5 × 7 inches each · PNG: 1,500 × 2,100 pixels per side
      </p>
      <div className="download-buttons">
        <button
          className="button"
          disabled={frontDisabled || !!busy}
          onClick={() => onDownload("front")}
        >
          {busy === "front" ? "Preparing…" : "Download front PNG"}
        </button>
        <button
          className="button secondary"
          disabled={backDisabled || !!busy}
          onClick={() => onDownload("back")}
        >
          {busy === "back" ? "Preparing…" : "Download back PNG"}
        </button>
        <button
          className="button secondary"
          disabled={pdfDisabled || !!busy}
          onClick={() => onDownload("pdf")}
        >
          {busy === "pdf" ? "Preparing…" : "Download PDF"}
        </button>
      </div>
      <p className="print-note">
        <strong>Flat card PDF</strong>
        <br />
        PDF page 1: front · Page 2: back.
        <br />
        Print at <strong>Actual Size / 100%</strong>. For duplex printing, flip
        on the long edge; check a test sheet for your printer.
      </p>
      <h4>Print and fold a greeting card</h4>
      <p className="helper">
        Folded size: 5 × 7 inches. Outside: back cover on the left, front cover
        on the right. The inside is blank for a handwritten message.
      </p>
      <label className="text-control">
        <span>Folded PDF paper size</span>
        <select
          value={paper}
          disabled={!!busy}
          onChange={(event) => setPaper(event.target.value as FoldedPaper)}
        >
          <option value="a4">A4 landscape · trim and fold</option>
          <option value="letter">US Letter landscape · trim and fold</option>
          <option value="exact">10 × 7 inches · fold only</option>
        </select>
      </label>
      <button
        className="button secondary"
        disabled={pdfDisabled || !!busy}
        onClick={() => onDownload("folded", paper)}
      >
        {busy === "folded" ? "Preparing…" : "Download folded PDF"}
      </button>
      <p className="print-note">
        Page 1: outside · Page 2: blank inside. Print page 1 only for a blank
        inside, or both pages using duplex <strong>flip on short edge</strong>.
        Use <strong>landscape</strong>, <strong>Actual Size / 100%</strong>, and
        one PDF page per sheet side. On A4 or Letter, trim to the corner marks
        and fold at the center ticks. On 10 × 7-inch stock, fold in half. Test
        one sheet before printing the full batch.
      </p>
    </section>
  );
}
