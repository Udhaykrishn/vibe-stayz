"use client";
import { usePathname } from "next/navigation";
import { exitPreview } from "@/lib/preview-actions";
/** Leaves preview and stays on the same page, now rendered exactly as guests see it. */
export default function PreviewExit() {
  return (
    <form action={exitPreview}>
      <input type="hidden" name="back" value={usePathname() || "/"} />
      <button type="submit">Exit preview</button>
    </form>
  );
}
