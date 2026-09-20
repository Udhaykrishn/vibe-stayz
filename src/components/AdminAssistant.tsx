"use client";

import { useState } from "react";
import Icon from "@/components/Icon";

type Message = { role: "user" | "assistant"; content: string };
type AssistantTask = "property_draft" | "location_draft" | "analysis";
type AssistantResult = {
  task: AssistantTask;
  reply: string;
  fields: Record<string, string | number | string[] | null>;
  location_fields: Record<string, string | null>;
  amenities: string[];
  amenity_ids: string[];
  analysis: string;
};

const fieldLabels: Record<string, string> = {
  name: "Name", slug: "Page slug", subtitle: "Subtitle", location_name: "Destination",
  location_id: "Destination record", property_type: "Property type", short_description: "Short description",
  description: "Description", max_guests: "Maximum guests", bedrooms: "Bedrooms", bathrooms: "Bathrooms",
  highlights: "Highlights", address: "Address", show_address: "Show address publicly", map_url: "Map link",
  map_embed_url: "Map embed link", whatsapp_override: "WhatsApp number", starting_price: "Starting price",
  price_label: "Price label", weekday_rate: "Weekday pricing", weekend_rate: "Weekend pricing",
  group_package: "Group package", extra_guest_info: "Additional guest information", check_in: "Check-in",
  check_out: "Check-out", rules: "House rules", image_alt: "Photo description", seo_title: "SEO title",
  seo_description: "SEO description",
};

export default function AdminAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState<AssistantResult | null>(null);
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function sendMessage() {
    const content = prompt.trim();
    if (!content || busy) return;
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setPrompt("");
    setError("");
    setBusy(true);
    try {
      const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || "";
      const response = await fetch("/api/admin/property-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({ messages: nextMessages }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The assistant couldn’t respond.");
      const answer = result as AssistantResult;
      const assistantMessage = answer.task === "analysis" && answer.analysis
        ? `${answer.reply}\n\n${answer.analysis}`
        : answer.reply;
      setDraft((previous) => {
        if (!previous || previous.task !== answer.task || answer.task === "analysis") return answer;
        const merge = <T extends Record<string, string | number | string[] | null>>(
          oldFields: T,
          newFields: T,
        ) => {
          const fields = { ...oldFields };
          for (const [key, value] of Object.entries(newFields)) {
            if (value !== null && value !== "" && (!Array.isArray(value) || value.length))
              (fields as Record<string, string | number | string[] | null>)[key] = value;
          }
          return fields as T;
        };
        return answer.task === "property_draft"
          ? {
              ...answer,
              fields: merge(previous.fields, answer.fields),
              amenities: answer.amenities.length ? answer.amenities : previous.amenities,
            }
          : {
              ...answer,
              location_fields: merge(previous.location_fields, answer.location_fields),
            };
      });
      setMessages([...nextMessages, { role: "assistant", content: assistantMessage }]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The assistant couldn’t respond.");
    } finally {
      setBusy(false);
    }
  }

  function reviewDraft() {
    if (!draft || draft.task === "analysis") return;
    const entity = draft.task === "property_draft" ? "resorts" : "locations";
    const fields = draft.task === "property_draft" ? draft.fields : draft.location_fields;
    sessionStorage.setItem(
      "vibe-stayz-admin-assistant-draft",
      JSON.stringify({ entity, fields, amenities: draft.task === "property_draft" ? draft.amenities : [] }),
    );
    window.location.assign(`/admin/${entity}/new`);
  }

  const canCreate = draft?.task === "location_draft"
    ? !!draft.location_fields.name?.trim() && !!draft.location_fields.slug?.trim()
    : draft?.task === "property_draft"
      ? !!draft.fields.name && !!draft.fields.slug && !!draft.fields.property_type && Number(draft.fields.max_guests) > 0 && !!draft.fields.location_id
      : false;

  async function createAsDraft() {
    if (!draft || !canCreate || creating) return;
    const entity = draft.task === "property_draft" ? "resorts" : "locations";
    const apiFields: Record<string, unknown> = draft.task === "property_draft"
      ? { ...draft.fields }
      : { ...draft.location_fields };
    delete apiFields.location_name;
    delete apiFields.location_id;
    delete apiFields.amenities;
    if (draft.task === "property_draft") {
      const stringDefaults: Record<string, string> = {
        cover_image: "",
        image_alt: "",
        price_label: "/ night onwards",
        pricing_disclaimer: "Prices are indicative and may vary. Contact us on WhatsApp for current pricing and stay details.",
        check_in: "2:00 PM",
        check_out: "11:00 AM",
      };
      for (const [key, value] of Object.entries(apiFields)) {
        if (key === "highlights" || key === "rules") apiFields[key] = Array.isArray(value) ? value.join("\n") : "";
        else if (value === null && key === "show_address") apiFields[key] = false;
        else if (value === null && ["starting_price", "bedrooms", "bathrooms"].includes(key)) apiFields[key] = null;
        else if (value === null) apiFields[key] = stringDefaults[key] ?? "";
      }
      apiFields.location_id = draft.fields.location_id;
      Object.assign(apiFields, {
        published: false,
        featured: false,
        archived: false,
        display_order: 0,
        cover_image: "",
        price_label: apiFields.price_label || stringDefaults.price_label,
        pricing_disclaimer: apiFields.pricing_disclaimer || stringDefaults.pricing_disclaimer,
        check_in: apiFields.check_in || stringDefaults.check_in,
        check_out: apiFields.check_out || stringDefaults.check_out,
      });
    } else {
      for (const [key, value] of Object.entries(apiFields))
        if (value === null) apiFields[key] = "";
      Object.assign(apiFields, {
        cover_image: "",
        image_alt: apiFields.image_alt ?? "",
        icon: "leaf",
        published: false,
        featured: false,
        display_order: 0,
      });
    }

    setCreating(true);
    setError("");
    try {
      const csrf = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content || "";
      const response = await fetch(`/api/admin/${entity}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({
          fields: apiFields,
          ...(entity === "resorts" ? { gallery: [], amenity_ids: draft.amenity_ids } : {}),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The draft couldn’t be created.");
      sessionStorage.removeItem("vibe-stayz-admin-assistant-draft");
      window.location.assign(`/admin/${entity}/${result.id}?saved=1`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "The draft couldn’t be created. Review the details and try again.");
    } finally {
      setCreating(false);
    }
  }

  function startNewRequest() {
    setMessages([]);
    setDraft(null);
    setError("");
    setPrompt("");
  }

  const canReview = draft?.task === "property_draft" || draft?.task === "location_draft";

  return (
    <section className="admin-panel property-assistant" id="assistant" aria-labelledby="admin-assistant-title">
      <div className="property-assistant-heading">
        <div>
          <h2 id="admin-assistant-title">What would you like to work on?</h2>
          <p>Ask for a property or destination draft, or have the assistant analyze the listings already in your catalog.</p>
        </div>
        <span className="property-assistant-mark" aria-hidden="true"><Icon name="star" size={19} /></span>
      </div>
      <div className="property-assistant-log" role="log" aria-live="polite" aria-relevant="additions text">
        {!messages.length && (
          <ul className="property-assistant-examples">
            <li>“Add a new destination in Wayanad. It has tea gardens and a cool climate.”</li>
            <li>“Create a 3-bedroom Munnar villa for 8 guests with a pool.”</li>
            <li>“Analyze my catalog. Which listings are missing important details?”</li>
          </ul>
        )}
        {messages.map((message, index) => (
          <p className={`property-assistant-message ${message.role}`} key={`${index}-${message.role}`}>
            <strong>{message.role === "user" ? "You" : "Assistant"}</strong>{message.content}
          </p>
        ))}
        {busy && <p className="property-assistant-thinking" role="status">Reviewing your request…</p>}
      </div>
      {canReview && draft && (
        <details className="property-assistant-review">
          <summary>Review draft details</summary>
          <dl>
            {Object.entries(draft.task === "property_draft" ? draft.fields : draft.location_fields)
              .filter(([key, value]) => key !== "location_id" && value !== null && value !== "" && (!Array.isArray(value) || value.length > 0))
              .map(([key, value]) => (
                <div key={key}><dt>{fieldLabels[key] || key}</dt><dd>{Array.isArray(value) ? value.join(", ") : String(value)}</dd></div>
              ))}
            {draft.task === "property_draft" && draft.amenities.length > 0 && (
              <div><dt>Amenities</dt><dd>{draft.amenities.join(", ")}</dd></div>
            )}
          </dl>
        </details>
      )}
      <label className="sr-only" htmlFor="property-assistant-prompt">Ask about a new location, property, or your catalog</label>
      <textarea
        id="property-assistant-prompt"
        value={prompt}
        maxLength={1800}
        rows={3}
        placeholder="Describe what you want to add, or ask about your catalog…"
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            void sendMessage();
          }
        }}
      />
      {error && <p className="error-note property-assistant-error" role="alert">{error}</p>}
      {canReview && !canCreate && (
        <p className="property-assistant-reminder">
          To create directly, the draft needs its required name and slug
          {draft.task === "property_draft" ? ", property type, guest capacity, and a destination already in your list" : ""}.
          Answer the assistant’s question or open the editor to complete it yourself.
        </p>
      )}
      <div className="property-assistant-actions">
        <span>Creation happens only when you choose Create as draft. New records stay unpublished.</span>
        {!!messages.length && <button type="button" className="button button-outline" onClick={startNewRequest}>New request</button>}
        {canReview && (
          <button type="button" className="button button-outline" onClick={reviewDraft}>
            Open in editor
          </button>
        )}
        {canReview && <button type="button" className="button button-dark" onClick={() => void createAsDraft()} disabled={!canCreate || creating}>
          <Icon name="check" size={16} />{creating ? "Creating…" : "Create as draft"}
        </button>}
        <button type="button" className="button button-dark" onClick={() => void sendMessage()} disabled={busy || !prompt.trim()}>
          <Icon name="arrow" size={16} />
          {busy ? "Thinking…" : "Send"}
        </button>
      </div>
    </section>
  );
}
