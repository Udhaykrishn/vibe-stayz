"use client";

import { useEffect, useState } from "react";

type StoredDraft = {
  entity: string;
  fields: Record<string, string | number | string[] | null>;
  amenities: string[];
};

const storageKey = "vibe-stayz-admin-assistant-draft";
const clean = (value: string) => value.trim().toLowerCase().replace(/\s+/g, " ");

export default function AssistantDraftApply({ entity }: { entity: string }) {
  const [draft, setDraft] = useState<StoredDraft | null>(null);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (!saved) return;
      const parsed = JSON.parse(saved) as StoredDraft;
      if (parsed.entity === entity) setDraft(parsed);
    } catch {
      sessionStorage.removeItem(storageKey);
    }
  }, [entity]);

  function apply() {
    if (!draft) return;
    const form = document.querySelector<HTMLFormElement>("#cms-editor");
    if (!form) return;
    let missingLocation = false;
    for (const [key, value] of Object.entries(draft.fields)) {
      if (value === null || value === "" || (Array.isArray(value) && !value.length)) continue;
      const field = form.elements.namedItem(key);
      if (key === "location_name") {
        const select = form.elements.namedItem("location_id");
        if (select instanceof HTMLSelectElement) {
          const option = Array.from(select.options).find((item) => clean(item.textContent || "") === clean(String(value)));
          if (option) {
            select.value = option.value;
            select.dispatchEvent(new Event("input", { bubbles: true }));
            select.dispatchEvent(new Event("change", { bubbles: true }));
          } else missingLocation = true;
        }
        continue;
      }
      if (key === "highlights" || key === "rules") {
        if (field instanceof HTMLTextAreaElement) {
          field.value = (value as string[]).join("\n");
          field.dispatchEvent(new Event("input", { bubbles: true }));
          field.dispatchEvent(new Event("change", { bubbles: true }));
        }
        continue;
      }
      if (field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement || field instanceof HTMLSelectElement) {
        field.value = String(value);
        field.dispatchEvent(new Event("input", { bubbles: true }));
        field.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    if (entity === "resorts") {
      const amenities = new Set(draft.amenities.map(clean));
      for (const checkbox of form.querySelectorAll<HTMLInputElement>('input[name="amenity_ids"]')) {
        if (!amenities.has(clean(checkbox.closest("label")?.textContent || ""))) continue;
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event("input", { bubbles: true }));
        checkbox.dispatchEvent(new Event("change", { bubbles: true }));
      }
    }
    sessionStorage.removeItem(storageKey);
    setDraft(null);
    setNotice(missingLocation
      ? "Draft applied. Choose a destination manually; this location does not exist yet. Review the other fields before saving."
      : "Draft applied. Review and complete the form before saving.");
    form.querySelector<HTMLInputElement>('[name="name"]')?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function discard() {
    sessionStorage.removeItem(storageKey);
    setDraft(null);
    setNotice("Assistant draft discarded.");
  }

  return (
    <>
      {draft && (
        <section className="admin-panel assistant-draft-panel" aria-labelledby="assistant-draft-title">
          <div>
            <h2 id="assistant-draft-title">Assistant draft ready</h2>
            <p>Apply these suggestions to the form, then check each field before saving.</p>
          </div>
          <div className="page-actions">
            <button type="button" className="button button-outline" onClick={discard}>Discard draft</button>
            <button type="button" className="button button-dark" onClick={apply}>Apply draft to form</button>
          </div>
        </section>
      )}
      {notice && <p className="success-note" role="status">{notice}</p>}
    </>
  );
}
