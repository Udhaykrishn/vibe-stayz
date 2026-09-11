"use client";
import { useState } from "react";
import type { Location } from "@/types";
import Icon from "./Icon";
export default function ContactForm({
  locations,
  number,
  greeting,
}: {
  locations: Location[];
  number: string;
  greeting: string;
}) {
  const [error, setError] = useState("");
  return (
    <form
      id="enquiry-form"
      className="enquiry-form"
      onSubmit={(event) => {
        event.preventDefault();
        if (!number) {
          setError(
            "WhatsApp enquiries are not open yet. Please check back soon.",
          );
          return;
        }
        const fd = new FormData(event.currentTarget);
        const message = `${greeting}\nMy name is ${fd.get("name")}.\nDestination: ${fd.get("destination")}\n\n${fd.get("message")}`;
        window.location.href = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
      }}
    >
      <h2>What does your getaway look like?</h2>
      <p>Tell us a little. We’ll take it from there.</p>
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Your name</label>
          <input
            id="name"
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            placeholder="How should we call you?"
          />
        </div>
        <div className="field">
          <label htmlFor="destination">Where would you like to go?</label>
          <select
            id="destination"
            name="destination"
            defaultValue="I'm still exploring"
          >
            <option value="I'm still exploring">I’m still exploring</option>
            {locations.map((l) => (
              <option key={l.id}>{l.name}</option>
            ))}
          </select>
        </div>
        <div className="field full">
          <label htmlFor="message">A little about your plans</label>
          <textarea
            id="message"
            name="message"
            rows={4}
            maxLength={2000}
            required
            placeholder="A quiet weekend for two, a family gathering, a special occasion…"
          />
        </div>
      </div>
      {error && (
        <div
          id="enquiry-error"
          className="error-note"
          role="alert"
          tabIndex={-1}
        >
          {error}
        </div>
      )}
      <button className="button button-dark" type="submit">
        <Icon name="whatsapp" size={20} />
        Continue on WhatsApp
        <Icon name="arrow" size={18} />
      </button>
      <p className="form-note">
        Your message opens in WhatsApp. You choose when to send it.
      </p>
    </form>
  );
}
