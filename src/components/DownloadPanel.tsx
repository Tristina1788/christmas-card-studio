export function DownloadPanel({
  disabled,
  busy,
  onDownload,
}: {
  disabled: boolean;
  busy: string | null;
  onDownload: (format: "png" | "pdf") => void;
}) {
  return (
    <section className="control-section download-panel">
      <div className="control-title">
        <span>03</span>
        <h3>Ready to send some joy?</h3>
      </div>
      <p className="helper">5 × 7 inches · PNG: 1,500 × 2,100 pixels</p>
      <div className="download-buttons">
        <button
          className="button"
          disabled={disabled || !!busy}
          onClick={() => onDownload("png")}
        >
          {busy === "png" ? "Preparing…" : "Download PNG"}{" "}
          <span aria-hidden="true">↓</span>
        </button>
        <button
          className="button secondary"
          disabled={disabled || !!busy}
          onClick={() => onDownload("pdf")}
        >
          {busy === "pdf" ? "Preparing…" : "Download PDF"}{" "}
          <span aria-hidden="true">↓</span>
        </button>
      </div>
      <p className="print-note">
        Print the PDF at <strong>Actual Size / 100%</strong>.<br />
        Do not select Fit to Page.
      </p>
    </section>
  );
}
