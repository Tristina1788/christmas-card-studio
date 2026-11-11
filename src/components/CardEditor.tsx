import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Template } from "../config/templates";
import { loadArtwork, decodePhoto, type Artwork } from "../rendering/assets";
import { effectivePpi, initialCrop, type Crop } from "../rendering/photoCrop";
import { exportCanvas, type Values } from "../rendering/cardRenderer";
import { pngBlob, saveBlob } from "../rendering/exportPng";
import { CardPreview } from "./CardPreview";
import { PhotoControls } from "./PhotoControls";
import { PersonalizationPanel } from "./PersonalizationPanel";
import { DownloadPanel } from "./DownloadPanel";
export interface Session {
  photos: Record<string, ImageBitmap | undefined>;
  crops: Record<string, Crop>;
  values: Values;
}
export function CardEditor({
  template: t,
  session,
  onChange,
  onBack,
}: {
  template: Template;
  session: Session;
  onChange: (session: Session) => void;
  onBack: () => void;
}) {
  const [art, setArt] = useState<Artwork>();
  const [artError, setArtError] = useState("");
  const [error, setError] = useState("");
  const [renderErrors, setRenderErrors] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [slotId, setSlotId] = useState(t.photoSlots[0]?.id ?? "photo");
  const [resetConfirm, setResetConfirm] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const resetButton = useRef<HTMLButtonElement>(null);
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  useEffect(() => {
    if (resetConfirm) dialog.current?.showModal();
    else dialog.current?.close();
  }, [resetConfirm]);
  useEffect(() => {
    if (t.status === "awaiting-artwork") return;
    let active = true;
    loadArtwork(t)
      .then((asset) => {
        if (active) setArt(asset);
      })
      .catch((e) => {
        if (active) setArtError(e.message);
      });
    return () => {
      active = false;
    };
  }, [t]);
  const slot = t.photoSlots.find((s) => s.id === slotId);
  const crop = session.crops[`${t.id}:${slotId}`] ?? initialCrop();
  const crops = useMemo(
    () =>
      Object.fromEntries(
        t.photoSlots.map((s) => [
          s.id,
          session.crops[`${t.id}:${s.id}`] ?? initialCrop(),
        ]),
      ),
    [session.crops, t],
  );
  const input = useMemo(
    () =>
      art
        ? {
            template: t,
            artwork: art,
            photos: session.photos,
            crops,
            values: session.values,
          }
        : undefined,
    [t, art, session.photos, crops, session.values],
  );
  const onErrors = useCallback(
    (errors: string[]) =>
      setRenderErrors((previous) =>
        JSON.stringify(previous) === JSON.stringify(errors) ? previous : errors,
      ),
    [],
  );
  const updateCrop = (next: Crop) =>
    onChange({
      ...session,
      crops: { ...session.crops, [`${t.id}:${slotId}`]: next },
    });
  const allPhotos =
    t.photoSlots.length > 0 && t.photoSlots.every((s) => session.photos[s.id]);
  const blocked =
    t.status !== "approved" ||
    !input ||
    !allPhotos ||
    renderErrors.length > 0 ||
    pending;
  async function upload(file: File) {
    setPending(true);
    setError("");
    setMessage("");
    try {
      const bitmap = await decodePhoto(file);
      if (!alive.current) {
        bitmap.close();
        return;
      }
      session.photos[slotId]?.close();
      onChange({
        ...session,
        photos: { ...session.photos, [slotId]: bitmap },
        crops: { ...session.crops, [`${t.id}:${slotId}`]: initialCrop() },
      });
      setMessage("Your photo is ready.");
    } catch (e) {
      if (alive.current) setError((e as Error).message);
    } finally {
      if (alive.current) setPending(false);
    }
  }
  async function download(format: "png" | "pdf") {
    if (!input || blocked || busy) return;
    setBusy(format);
    setError("");
    setMessage("");
    try {
      const canvas = await exportCanvas(input);
      const blob =
        format === "png"
          ? await pngBlob(canvas)
          : (await import("../rendering/exportPdf")).pdfBlob(canvas);
      saveBlob(blob, `christmas-${t.id}.${format}`);
      setMessage(
        `Your ${format.toUpperCase()} is ready. Print at Actual Size / 100%.`,
      );
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }
  const lowPhoto = t.photoSlots
    .map((s) => {
      const p = session.photos[s.id];
      return p ? effectivePpi(p, s, crops[s.id]) : null;
    })
    .filter((p): p is number => p !== null && p < 300);
  return (
    <main className="editor">
      <button
        className="back-link"
        onClick={onBack}
        disabled={!!busy || pending}
      >
        ← Back to collection <small>Your work stays here</small>
      </button>
      <div className="editor-heading">
        <div>
          <div className="eyebrow">MAKE IT YOURS · DESIGN {t.id}</div>
          <h1>{t.name}</h1>
        </div>
        <span className="format-tag">5 × 7 INCHES</span>
      </div>
      <div className="editor-layout">
        <div className="preview-column">
          <div className="preview-mat">
            {input ? (
              <CardPreview
                input={input}
                slot={slot}
                crop={crop}
                onCrop={updateCrop}
                onErrors={onErrors}
                disabled={!!busy || pending || t.status !== "approved"}
              />
            ) : (
              <div className={`pending-preview palette-${t.palette}`}>
                <span className="design-number">{t.id}</span>
                <h2>
                  {artError
                    ? "Artwork unavailable"
                    : t.status === "awaiting-artwork"
                      ? "Your design is on its way"
                      : "Loading original artwork…"}
                </h2>
                <p>
                  {artError ||
                    "Original artwork is needed before an accurate preview can be shown."}
                </p>
              </div>
            )}
          </div>
          <p className="preview-caption">
            {input
              ? "YOUR PRINTABLE CARD · 5 × 7 INCHES"
              : "PREVIEW AWAITING ORIGINAL ARTWORK"}
          </p>
        </div>
        <div className="editor-controls">
          {t.status !== "approved" && (
            <div className="notice">
              <div>
                <strong>
                  {t.status === "awaiting-artwork"
                    ? "Awaiting original artwork"
                    : "Design needs review"}
                </strong>
                <p>
                  {t.reviewNote} Downloads are disabled until this design is
                  approved.
                </p>
              </div>
            </div>
          )}
          {t.photoSlots.length > 1 && (
            <label className="text-control">
              Photo opening
              <select
                value={slotId}
                disabled={!!busy || pending}
                onChange={(e) => setSlotId(e.target.value)}
              >
                {t.photoSlots.map((s, i) => (
                  <option key={s.id} value={s.id}>
                    {s.label ?? `Photo ${i + 1}`}
                  </option>
                ))}
              </select>
            </label>
          )}
          <PhotoControls
            hasPhoto={!!session.photos[slotId]}
            crop={crop}
            onCrop={updateCrop}
            onFile={upload}
            disabled={!!busy || pending}
            pending={pending}
          />
          <PersonalizationPanel
            template={t}
            values={session.values}
            onValue={(id, value) =>
              onChange({
                ...session,
                values: { ...session.values, [id]: value },
              })
            }
            disabled={!!busy || pending || t.status !== "approved"}
          />
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {renderErrors.map((e) => (
            <p className="error" key={e} role="alert">
              {e}
            </p>
          ))}
          {art?.lowResolution && (
            <p className="warning">
              This original artwork is below 1,500 × 2,100 pixels. Exporting at
              300 ppi does not restore missing detail.
            </p>
          )}
          {lowPhoto.length > 0 && (
            <p className="warning">
              Photo resolution is approximately {Math.min(...lowPhoto)} ppi at
              this crop. Choose a larger photo or reduce zoom for sharper
              printing.
            </p>
          )}
          {t.status === "approved" && !allPhotos && (
            <p className="helper">
              Add a photo to every opening to enable downloads.
            </p>
          )}
          <DownloadPanel disabled={blocked} busy={busy} onDownload={download} />
          <p className="status-message" role="status">
            {message}
          </p>
          <button
            ref={resetButton}
            className="subtle-button start-over"
            disabled={!!busy || pending}
            onClick={() => setResetConfirm(true)}
          >
            Start Over
          </button>
        </div>
      </div>
      <dialog
        ref={dialog}
        className="reset-dialog"
        onCancel={() => setResetConfirm(false)}
        onClose={() => resetButton.current?.focus()}
      >
        <h2>Start a fresh card?</h2>
        <p>
          This clears your photos, crops, and personalization across all
          designs.
        </p>
        <div className="dialog-actions">
          <button
            autoFocus
            className="button secondary"
            onClick={() => setResetConfirm(false)}
          >
            Keep editing
          </button>
          <button
            className="button"
            onClick={() => {
              Object.values(session.photos).forEach((p) => p?.close());
              onChange({ photos: {}, crops: {}, values: {} });
              setError("");
              setMessage("Your card has been reset.");
              setResetConfirm(false);
            }}
          >
            Yes, start over
          </button>
        </div>
      </dialog>
    </main>
  );
}
