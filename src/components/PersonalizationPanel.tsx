import { useState } from "react";
import {
  fontOptions,
  selectedFont,
  type FontFamilies,
} from "../rendering/fonts";
import type { Template } from "../config/templates";
import type { Values } from "../rendering/cardRenderer";
import {
  fontSizeLimits,
  requestedFontSize,
  printPoints,
  printPointValue,
  type FontSizes,
} from "../rendering/fontSizing";
interface Props {
  template: Template;
  values: Values;
  fontSizes: FontSizes;
  fontFamilies: FontFamilies;
  onFontFamily: (id: string, family: string) => void;
  effectiveFontSizes: FontSizes;
  onValue: (id: string, value: string) => void;
  onFontSize: (id: string, size: number) => void;
  onResetFontSizes: () => void;
  hasCustomFontSizes: boolean;
  disabled: boolean;
}
export function PersonalizationPanel({
  template,
  values,
  fontSizes,
  fontFamilies,
  onFontFamily,
  effectiveFontSizes,
  onValue,
  onFontSize,
  onResetFontSizes,
  hasCustomFontSizes,
  disabled,
}: Props) {
  const fields = template.textFields.filter((field) => field.visible);
  return (
    <section className="control-section">
      <div className="control-title">
        <span>02</span>
        <h3>A little note from you</h3>
      </div>
      {fields.length ? (
        fields.map((field) => {
          const size = requestedFontSize(field, fontSizes[field.id]);
          const limits = fontSizeLimits(field);
          const effective = effectiveFontSizes[field.id];
          const fitNoteId = `font-fit-${template.id}-${field.id}`;
          return (
            <div className="personalization-field" key={field.id}>
              <label className="text-control">
                <span>
                  {field.label}
                  {!field.required && <small> Optional</small>}
                </span>
                <input
                  type="text"
                  aria-label={field.label}
                  value={values[field.id] ?? field.defaultValue}
                  placeholder={
                    field.kind === "family"
                      ? "The Anderson Family"
                      : field.kind === "year"
                        ? "2026"
                        : ""
                  }
                  maxLength={field.maxLength}
                  required={field.required}
                  disabled={disabled}
                  onChange={(e) => onValue(field.id, e.target.value)}
                />
                <small>
                  {(values[field.id] ?? field.defaultValue).length}/
                  {field.maxLength}
                </small>
              </label>
              <label className="text-control">
                <span>Font</span>
                <select
                  aria-label={`${field.label} font`}
                  value={fontFamilies[field.id] ?? field.fontFamily}
                  disabled={disabled}
                  style={{
                    fontFamily: selectedFont(
                      fontFamilies[field.id],
                      field.fontFamily,
                    ),
                  }}
                  onChange={(e) => onFontFamily(field.id, e.target.value)}
                >
                  {fontOptions.map((font) => (
                    <option key={font.id} value={font.id}>
                      {font.label}
                    </option>
                  ))}
                </select>
              </label>
              <SizeInput
                key={field.id}
                label={`${field.label} font size in points`}
                size={size}
                disabled={disabled}
                onSize={(size) => onFontSize(field.id, size)}
              />
              <label
                className="range-control font-size-control"
                htmlFor={`font-size-${template.id}-${field.id}`}
              >
                <span>
                  Font size{" "}
                  <output aria-hidden="true">{printPoints(size)} pt</output>
                </span>
                <input
                  type="range"
                  id={`font-size-${template.id}-${field.id}`}
                  aria-label={`${field.label} font size`}
                  aria-valuetext={`${printPoints(size)} points`}
                  aria-describedby={fitNoteId}
                  min={printPointValue(limits.min)}
                  max={printPointValue(Math.max(limits.max, size))}
                  step={0.24}
                  value={printPointValue(size)}
                  disabled={disabled}
                  onChange={(e) =>
                    onFontSize(
                      field.id,
                      Math.round((Number(e.target.value) * 300) / 72),
                    )
                  }
                />
              </label>
              <p id={fitNoteId} className="font-fit-note" aria-live="polite">
                {effective !== undefined && effective < size - 0.5
                  ? `Auto-fitted to ${printPoints(effective)} pt to keep your text inside the card.`
                  : "Your chosen size prints as shown. Large text can overlap the design or extend past the card edges."}
              </p>
            </div>
          );
        })
      ) : (
        <p className="helper">
          Personalization will open after safe text areas are verified against
          the original artwork.
        </p>
      )}
      {fields.length > 0 && (
        <button
          className="subtle-button"
          disabled={disabled || !hasCustomFontSizes}
          onClick={onResetFontSizes}
        >
          Reset text sizes
        </button>
      )}
      <p className="helper">
        {fields.some((field) => field.kind === "greeting")
          ? "Personalize your greeting, family name, and year."
          : "The design’s original greeting is preserved exactly as part of the artwork."}
      </p>
    </section>
  );
}

function SizeInput({
  label,
  size,
  disabled,
  onSize,
}: {
  label: string;
  size: number;
  disabled: boolean;
  onSize: (size: number) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <label className="text-control size-number">
      <span>Size (pt)</span>
      <input
        type="number"
        aria-label={label}
        min={0.24}
        step="any"
        value={draft ?? printPointValue(size)}
        disabled={disabled}
        onChange={(event) => {
          setDraft(event.target.value);
          const points = Number(event.target.value);
          if (
            Number.isFinite(points) &&
            points >= 0.24 &&
            Number.isFinite((points * 300) / 72)
          )
            onSize((points * 300) / 72);
        }}
        onBlur={() => setDraft(null)}
      />
    </label>
  );
}
