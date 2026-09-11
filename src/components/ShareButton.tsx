"use client";
import { useState } from "react";
import Icon from "./Icon";
export default function ShareButton() {
  const [status, setStatus] = useState("");
  return (
    <button
      aria-label={status || "Share this stay"}
      className="button button-outline"
      id="share-property"
      onClick={async () => {
        const data = { title: document.title, url: window.location.href };
        try {
          if (navigator.share) await navigator.share(data);
          else {
            await navigator.clipboard.writeText(data.url);
            setStatus("Stay link copied");
          }
        } catch (error) {
          if ((error as Error).name !== "AbortError")
            setStatus("Copy the address from your browser to share this stay");
        }
      }}
    >
      <Icon name="external" size={17} />
      {status || "Share this stay"}
    </button>
  );
}
