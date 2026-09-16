import type { ResortView } from "@/types";
export function validMapEmbed(value: string) {
  if (!value) return true;
  try { const u = new URL(value); return u.protocol === "https:" && ["www.google.com", "maps.google.com", "www.google.co.in"].includes(u.hostname) && (u.pathname.startsWith("/maps/embed") || u.searchParams.get("output") === "embed"); } catch { return false; }
}
export function resortMap(r: ResortView) {
  const exact = !!r.show_address && (!!r.address || (r.latitude != null && r.longitude != null) || !!r.map_embed_url);
  const query = r.show_address && r.latitude != null && r.longitude != null ? `${r.latitude},${r.longitude}` : r.show_address && r.address ? r.address : `${r.location.name}, Kerala, India`;
  return { exact, embed: r.show_address && r.map_embed_url && validMapEmbed(r.map_embed_url) ? r.map_embed_url : `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`, href: r.show_address && r.map_url ? r.map_url : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}` };
}
