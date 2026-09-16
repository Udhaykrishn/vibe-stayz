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
    : f.options?.map((s) => ({ id: s, label: f.optionLabels?.[s] || s })) || [];
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
                f.type === "number" || f.type === "decimal"
                  ? "number"
                  : f.type === "date"
                    ? "date"
                    : f.type === "email"
                      ? "email"
                      : "text"
              }
              defaultValue={String(value ?? "")}
              required={f.required}
              min={f.type === "decimal" ? (f.key === "latitude" ? -90 : -180) : f.key === "max_guests" || f.key === "rating" ? 1 : 0}
              max={f.key === "rating" ? 5 : undefined}
              step={f.type === "decimal" ? "any" : f.type === "number" ? 1 : undefined}
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
/** Replace, rename and delete controls for the media library. */
export function MediaTools() {
  return (
    <>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        data-replace-upload
        hidden
      />
      <dialog
        id="media-details"
        className="confirm-dialog media-details"
        aria-labelledby="media-details-title"
      >
        <h2 id="media-details-title">Image details</h2>
        <p>
          Rename this photograph, or describe it for readers who cannot see it.
        </p>
        <div className="field">
          <label htmlFor="media-filename">File name</label>
          <input id="media-filename" name="filename" required />
        </div>
        <div className="field">
          <label htmlFor="media-alt-text">Image description (alt text)</label>
          <input
            id="media-alt-text"
            name="alt"
            placeholder="Describe this photograph"
          />
        </div>
        <p className="field-error" id="media-details-error" hidden />
        <div>
          <button
            type="button"
            className="button button-outline"
            data-cancel-details
          >
            Cancel
          </button>
          <button
            type="button"
            className="button button-dark"
            data-save-details
          >
            Save details
          </button>
        </div>
      </dialog>
      <dialog
        id="media-delete"
        className="confirm-dialog"
        aria-labelledby="media-delete-title"
      >
        <h2 id="media-delete-title">Delete this photograph?</h2>
        <p id="media-delete-note" />
        <div>
          <button
            type="button"
            className="button button-outline"
            data-cancel-media-delete
            autoFocus
          >
            Keep image
          </button>
          <button
            type="button"
            className="button button-dark"
            data-confirm-media-delete
          >
            Delete image
          </button>
        </div>
      </dialog>
    </>
  );
}
