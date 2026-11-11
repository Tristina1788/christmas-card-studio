import type { Template } from "../config/templates";
import type { Values } from "../rendering/cardRenderer";
export function PersonalizationPanel({
  template,
  values,
  onValue,
  disabled,
}: {
  template: Template;
  values: Values;
  onValue: (id: string, value: string) => void;
  disabled: boolean;
}) {
  const fields = template.textFields.filter((f) => f.visible);
  return (
    <section className="control-section">
      <div className="control-title">
        <span>02</span>
        <h3>A little note from you</h3>
      </div>
      {fields.length ? (
        fields.map((f) => (
          <label className="text-control" key={f.id}>
            <span>
              {f.label}
              {!f.required && <small> Optional</small>}
            </span>
            <input
              type="text"
              aria-label={f.label}
              value={values[f.id] ?? f.defaultValue}
              placeholder={
                f.kind === "family"
                  ? "The Anderson Family"
                  : f.kind === "year"
                    ? "2026"
                    : ""
              }
              maxLength={f.maxLength}
              required={f.required}
              disabled={disabled}
              onChange={(e) => onValue(f.id, e.target.value)}
            />
            <small>
              {(values[f.id] ?? f.defaultValue).length}/{f.maxLength}
            </small>
          </label>
        ))
      ) : (
        <p className="helper">
          Personalization will open after safe text areas are verified against
          the original artwork.
        </p>
      )}
      <p className="helper">
        The design’s original greeting is preserved exactly as part of the
        artwork.
      </p>
    </section>
  );
}
