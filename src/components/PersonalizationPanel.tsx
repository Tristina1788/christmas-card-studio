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
                  max={printPointValue(limits.max)}
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
                  : "Adjust the size to suit your card."}
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
