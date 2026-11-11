import { useRef } from "react";
import type { Crop } from "../rendering/photoCrop";
export function PhotoControls({
  hasPhoto,
  crop,
  onCrop,
  onFile,
  disabled,
  pending,
}: {
  hasPhoto: boolean;
  crop: Crop;
  onCrop: (c: Crop) => void;
  onFile: (f: File) => void;
  disabled: boolean;
  pending: boolean;
}) {
  const file = useRef<HTMLInputElement>(null);
  return (
    <section className="control-section">
      <div className="control-title">
        <span>01</span>
        <h3>Your favorite photo</h3>
      </div>
      <input
        ref={file}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        aria-label="Upload family photo"
        className="visually-hidden"
        disabled={disabled || pending}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
      <button
        className="upload-button"
        disabled={disabled || pending}
        onClick={() => file.current?.click()}
      >
        <span aria-hidden="true">{hasPhoto ? "↻" : "+"}</span>
        <strong>
          {pending
            ? "Opening your photo…"
            : hasPhoto
              ? "Replace photo"
              : "Choose your photo"}
        </strong>
        <small>JPEG, PNG, or WebP · up to 25 MB</small>
      </button>
      {hasPhoto && (
        <>
          <p className="helper">
            Drag inside the opening to position your photo. Pinch to zoom, or
            use the controls below.
          </p>
          {[
            ["zoom", "Zoom", 1, 4, 0.01],
            ["x", "Horizontal position", -1, 1, 0.01],
            ["y", "Vertical position", -1, 1, 0.01],
          ].map(([key, label, min, max, step]) => (
            <label className="range-control" key={key}>
              <span>
                {label}
                <output aria-hidden="true">
                  {key === "zoom"
                    ? `${Math.round(crop.zoom * 100)}%`
                    : Math.round(crop[key as "x" | "y"] * 100)}
                </output>
              </span>
              <input
                type="range"
                aria-label={String(label)}
                min={min}
                max={max}
                step={step}
                value={crop[key as keyof Crop]}
                disabled={disabled}
                onChange={(e) =>
                  onCrop({ ...crop, [key]: Number(e.target.value) })
                }
              />
            </label>
          ))}
          <button
            className="subtle-button"
            disabled={disabled}
            onClick={() => onCrop({ zoom: 1, x: 0, y: 0 })}
          >
            Reset crop
          </button>
        </>
      )}
      <p className="privacy-note">
        <span aria-hidden="true">♧</span> Your photo stays on this device.
      </p>
    </section>
  );
}
