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
  onDownload: (format: "front" | "back" | "pdf") => void;
}) {
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
        PDF page 1: front · Page 2: back.
        <br />
        Print at <strong>Actual Size / 100%</strong>. For duplex printing, flip
        on the long edge; check a test sheet for your printer.
      </p>
    </section>
  );
}
