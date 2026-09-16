import "server-only";
import { cache } from "react";
import { cookies, draftMode } from "next/headers";
import { sessionValid } from "./auth";
/**
 * Preview runs on Next.js Draft Mode, switched on by /api/admin/preview. The draft
 * cookie alone is never enough: an editor session must still be valid, so an expired
 * or signed-out browser falls straight back to the live view.
 */
export const previewing = cache(async () => {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return false;
  try {
    return await sessionValid((await cookies()).get("vibe_admin")?.value);
  } catch {
    return false;
  }
});
/** A same-site path we are willing to send a browser to. */
export function safePath(value: string | null | undefined, fallback = "/") {
  const path = String(value ?? "").replace(/[\r\n\t]/g, "");
  return path.startsWith("/") && !path.startsWith("//") ? path : fallback;
}
/** Public paths an editor may preview. Admin screens, APIs and media are not pages. */
export function previewPath(value: string | null | undefined) {
  const path = safePath(value);
  return /^\/(admin|api|media)(\/|$)/.test(path) ? "/" : path;
}
/**
 * Where a record shows itself on the public site, so an editor can jump straight from
 * what they are editing to what a guest would see. `null` when it has no page of its own.
 */
export function recordPath(
  entity: string,
  record: Record<string, unknown>,
  resorts: { id: string; slug: string }[] = [],
) {
  const stay = (id: unknown) => {
    const slug = resorts.find((resort) => resort.id === id)?.slug;
    return slug ? `/resorts/${slug}` : null;
  };
  switch (entity) {
    case "resorts":
      return record.slug ? `/resorts/${record.slug}` : "/resorts";
    case "locations":
      return record.slug ? `/locations/${record.slug}` : "/locations";
    case "offers":
      return "/offers";
    case "page_content":
      return record.page === "home" ? "/" : `/${record.page}`;
    case "nearby_attractions":
      return stay(record.resort_id) || "/resorts";
    case "amenities":
      return "/resorts";
    case "faqs":
    case "navigation":
    case "site_settings":
      return "/";
    default:
      return null;
  }
}
/** Link into the preview screen, already pointed at a page. */
export const previewHref = (path: string) =>
  `/admin/preview?path=${encodeURIComponent(path)}`;
