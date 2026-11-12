import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Template } from "../config/templates";
import { loadArtwork, decodePhoto, type Artwork } from "../rendering/assets";
import { effectivePpi, initialCrop, type Crop } from "../rendering/photoCrop";
import { type RenderResult } from "../rendering/cardRenderer";
import { pngBlob, saveBlob } from "../rendering/exportPng";
import type { FontSizes } from "../rendering/fontSizing";
import { CardPreview } from "./CardPreview";
import { PhotoControls } from "./PhotoControls";
import { PersonalizationPanel } from "./PersonalizationPanel";
import { DownloadPanel } from "./DownloadPanel";
import {
  sideTemplate,
  sideInput,
  preferenceKey,
  photoKey,
  valueKey,
  exportSide,
  exportBothSides,
  type Session,
  type CardSide,
} from "../rendering/cardSides";
export type { Session } from "../rendering/cardSides";
export function CardEditor({
  template: front,
  session,
  onChange,
  onBack,
}: {
  template: Template;
  session: Session;
  onChange: (session: Session) => void;
  onBack: () => void;
}) {
  const [side, setSide] = useState<CardSide>("front");
  const layout = session.backLayouts?.[front.id] ?? "message";
  const t = useMemo(
    () => sideTemplate(front, side, layout),
    [front, side, layout],
  );
  const key = (id: string) => preferenceKey(front.id, side, id);
  const valueId = (id: string) => valueKey(front.id, side, id);
  const [loaded, setArt] = useState<{ template: Template; asset: Artwork }>();
  const art = loaded?.template === t ? loaded.asset : undefined;
  const [artError, setArtError] = useState("");
  const [error, setError] = useState("");
  const [renderErrors, setRenderErrors] = useState<string[]>([]);
  const [effectiveFontSizes, setEffectiveFontSizes] = useState<FontSizes>({});
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
        if (active) {
          setArt({ template: t, asset });
          setArtError("");
        }
      })
      .catch((e) => {
        if (active) setArtError(e.message);
      });
    return () => {
      active = false;
    };
  }, [t]);
  const slot = t.photoSlots.find((s) => s.id === slotId) ?? t.photoSlots[0];
  const selectedSlot = slot?.id ?? "photo";
  const crop = session.crops[key(selectedSlot)] ?? initialCrop();
  const input = useMemo(
    () => (art ? sideInput(front, session, side, art) : undefined),
    [front, session, side, art],
  );
  const crops = input?.crops ?? {};
  const fontSizes = input?.fontSizes ?? {};
  const fontFamilies = input?.fontFamilies ?? {};
  const values = input?.values ?? {};
  const onResult = useCallback(({ errors, fontSizes }: RenderResult) => {
    setRenderErrors((previous) =>
      JSON.stringify(previous) === JSON.stringify(errors) ? previous : errors,
    );
    setEffectiveFontSizes((previous) =>
      JSON.stringify(previous) === JSON.stringify(fontSizes)
        ? previous
        : fontSizes,
    );
  }, []);
  const updateCrop = (next: Crop) =>
    onChange({
      ...session,
      crops: { ...session.crops, [key(selectedSlot)]: next },
    });
  const allPhotos = t.photoSlots.every((s) => input?.photos[s.id]);
  const sideReady = (target: CardSide) => {
    const design = sideTemplate(front, target, layout);
    return (
      front.status === "approved" &&
      !pending &&
      design.photoSlots.every(
        (s) => session.photos[photoKey(front.id, target, s.id)],
      )
    );
  };
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
      session.photos[photoKey(front.id, side, selectedSlot)]?.close();
      onChange({
        ...session,
        photos: {
          ...session.photos,
          [photoKey(front.id, side, selectedSlot)]: bitmap,
        },
        crops: { ...session.crops, [key(selectedSlot)]: initialCrop() },
      });
      setMessage("Your photo is ready.");
    } catch (e) {
      if (alive.current) setError((e as Error).message);
    } finally {
      if (alive.current) setPending(false);
    }
  }
  async function download(format: "front" | "back" | "pdf") {
    if (busy || pending) return;
    setBusy(format);
    setError("");
    setMessage("");
    try {
      const blob =
        format === "pdf"
          ? (await import("../rendering/exportPdf")).pdfBlob(
              await exportBothSides(front, session),
            )
          : await pngBlob(await exportSide(front, session, format));
      saveBlob(
        blob,
        format === "pdf"
          ? `christmas-${front.id}-front-and-back.pdf`
          : `christmas-${front.id}-${format}.png`,
      );
      setMessage(
        format === "pdf"
          ? "Your two-page PDF is ready. Page 1: front. Page 2: back."
          : `Your ${format} PNG is ready.`,
      );
    } catch (e) {
      const message = (e as Error).message;
      setError(message);
      if (message.startsWith("Back:")) setSide("back");
      if (message.startsWith("Front:")) setSide("front");
    } finally {
      setBusy(null);
    }
  }
  const lowPhoto = t.photoSlots
    .map((s) => {
      const p = input?.photos[s.id];
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
          <h1>{front.name}</h1>
        </div>
        <span className="format-tag">5 × 7 INCHES · 2 SIDES</span>
      </div>
      <div className="side-switch" role="group" aria-label="Card side">
        {(["front", "back"] as const).map((value) => (
          <button
            key={value}
            className={side === value ? "button" : "button secondary"}
            aria-pressed={side === value}
            disabled={!!busy || pending}
            onClick={() => {
              setSide(value);
              setSlotId(
                value === "front"
                  ? (front.photoSlots[0]?.id ?? "photo")
                  : "back-main",
              );
            }}
          >
            {value === "front" ? "Front" : "Back"}
          </button>
        ))}
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
                onResult={onResult}
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
              ? `YOUR PRINTABLE CARD · ${side.toUpperCase()} · 5 × 7 INCHES`
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
          {side === "back" && (
            <label className="text-control">
              <span>Back layout</span>
              <select
                aria-label="Back layout"
                value={layout}
                disabled={!!busy || pending}
                onChange={(event) =>
                  onChange({
                    ...session,
                    backLayouts: {
                      ...session.backLayouts,
                      [front.id]: event.target.value as "message" | "collage",
                    },
                  })
                }
              >
                <option value="message">Message only</option>
                <option value="collage">Three-photo collage</option>
              </select>
            </label>
          )}
          {t.photoSlots.length > 1 && (
            <label className="text-control">
              Photo opening
              <select
                aria-label="Photo opening"
                value={selectedSlot}
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
          {t.photoSlots.length > 0 && (
            <PhotoControls
              hasPhoto={!!input?.photos[selectedSlot]}
              crop={crop}
              onCrop={updateCrop}
              onFile={upload}
              disabled={!!busy || pending}
              pending={pending}
            />
          )}
          <PersonalizationPanel
            template={t}
            values={values}
            fontSizes={fontSizes}
            fontFamilies={fontFamilies}
            onFontFamily={(id, family) =>
              onChange({
                ...session,
                fontFamilies: {
                  ...session.fontFamilies,
                  [key(id)]: family,
                },
              })
            }
            effectiveFontSizes={effectiveFontSizes}
            onFontSize={(id, size) =>
              onChange({
                ...session,
                fontSizes: { ...session.fontSizes, [key(id)]: size },
              })
            }
            onResetFontSizes={() =>
              onChange({
                ...session,
                fontSizes: Object.fromEntries(
                  Object.entries(session.fontSizes ?? {}).filter(
                    ([key]) =>
                      !(side === "back"
                        ? key.startsWith(`${front.id}:back:`)
                        : key.startsWith(`${front.id}:`) &&
                          !key.startsWith(`${front.id}:back:`)),
                  ),
                ),
              })
            }
            hasCustomFontSizes={t.textFields.some(
              (field) => key(field.id) in (session.fontSizes ?? {}),
            )}
            onValue={(id, value) =>
              onChange({
                ...session,
                values: { ...session.values, [valueId(id)]: value },
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
          <DownloadPanel
            frontDisabled={!sideReady("front") || (side === "front" && blocked)}
            backDisabled={!sideReady("back") || (side === "back" && blocked)}
            pdfDisabled={!sideReady("front") || !sideReady("back") || blocked}
            busy={busy}
            onDownload={download}
          />
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
              onChange({
                photos: {},
                crops: {},
                values: {},
                fontSizes: {},
                fontFamilies: {},
                backLayouts: {},
              });
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
