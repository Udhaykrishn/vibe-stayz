import type { Field as FieldConfig } from "@/lib/cms-config";
import type { SiteData } from "@/types";
import Icon from "./Icon";
export function Field({
  field: f,
  value,
  data,
}: {
  field: FieldConfig;
  value: unknown;
  data: SiteData;
}) {
  const id = `field-${f.key}`;
  const options = f.relation
    ? data[f.relation].map((r) => ({ id: r.id, label: r.name }))
    : f.options?.map((s) => ({ id: s, label: s })) || [];
  return (
    <div
      className={`field cms-field${f.full ? " full" : ""}${f.type === "checkbox" ? " checkbox-field" : ""}`}
    >
      {f.type === "checkbox" ? (
        <label htmlFor={id}>
          <input
            type="checkbox"
            id={id}
            name={f.key}
            defaultChecked={!!value}
          />
          <span>{f.label}</span>
        </label>
      ) : (
        <>
          <label htmlFor={id}>
            {f.label}
            {f.required && <span className="required-mark"> *</span>}
          </label>
          {f.type === "textarea" ? (
            <textarea
              id={id}
              name={f.key}
              rows={
                f.key === "description" ||
                f.key === "body" ||
                f.key === "property_template"
                  ? 7
                  : 3
              }
              required={f.required}
              defaultValue={String(value ?? "")}
            />
          ) : f.type === "select" ? (
            <select
              id={id}
              name={f.key}
              required={f.required}
              defaultValue={String(value ?? "")}
            >
              {(!f.required || !value) && (
                <option value="">Select {f.label.toLowerCase()}</option>
              )}
              {options.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : (
            <input
              id={id}
              name={f.key}
              type={
                f.type === "number"
                  ? "number"
                  : f.type === "date"
                    ? "date"
                    : f.type === "email"
                      ? "email"
                      : "text"
              }
              defaultValue={String(value ?? "")}
              required={f.required}
              min={f.key === "max_guests" || f.key === "rating" ? 1 : 0}
              max={f.key === "rating" ? 5 : undefined}
              step={f.type === "number" ? 1 : undefined}
            />
          )}
        </>
      )}
      {f.type === "image" && (
        <div className="image-field-preview">
          <img
            src={String(value || "/images/heritage-640.webp")}
            alt="Selected image preview"
            width="150"
            height="90"
            data-image-preview={f.key}
          />
          <button
            type="button"
            className="button button-outline"
            data-choose-image={f.key}
          >
            Choose image
          </button>
          <button
            type="button"
            className="plain-button"
            data-clear-image={f.key}
          >
            Remove
          </button>
        </div>
      )}
      {f.help && <p className="field-help">{f.help}</p>}
      <p
        className="field-error"
        id={`${id}-error`}
        data-error-for={f.key}
        hidden
      />
    </div>
  );
}
export function MediaPicker() {
  return (
    <dialog
      id="media-picker"
      className="media-picker"
      aria-labelledby="media-title"
    >
      <div className="picker-top">
        <div>
          <h2 id="media-title">Choose a photograph</h2>
          <p>Select an image or upload something new.</p>
        </div>
        <button
          type="button"
          className="icon-button"
          data-close-picker
          aria-label="Close image library"
        >
          <Icon name="close" />
        </button>
      </div>
      <label className="upload-button button button-dark">
        <Icon name="plus" size={18} />
        Upload image
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          data-media-upload
          hidden
        />
      </label>
      <p className="upload-note">
        JPEG, PNG or WebP. Images are resized and optimized automatically.
      </p>
      <p id="media-status" role="status" />
      <div id="media-options" className="media-options" />
    </dialog>
  );
}
