import type { Media } from "@/types";
import { runtime } from "./env";
export function storageUrl(item: Pick<Media, "object_key">) {
  return runtime()
    .supabase.storage.from(runtime().SUPABASE_STORAGE_BUCKET)
    .getPublicUrl(item.object_key).data.publicUrl;
}
/** The stable address of a library image. It never changes, so replacing the
 * photograph behind it updates every page that points at it. */
export const mediaPath = (id: string) => `/media/${id}`;
/** Every column an editor can point at a library image. */
export const imageColumns: { table: string; label: string; columns: string[] }[] =
  [
    { table: "resorts", label: "Resorts", columns: ["cover_image"] },
    { table: "resort_images", label: "Resort galleries", columns: ["url"] },
    { table: "locations", label: "Destinations", columns: ["cover_image"] },
    { table: "offers", label: "Offers", columns: ["image", "mobile_image"] },
    { table: "nearby_attractions", label: "Attractions", columns: ["image"] },
    { table: "page_content", label: "Site content", columns: ["image"] },
    {
      table: "site_settings",
      label: "Settings",
      columns: ["logo", "favicon", "og_image"],
    },
  ];
export type Usage = { label: string; count: number };
/** Where each library image is used, keyed by its `/media/{id}` address. */
export async function mediaUsage() {
  const db = runtime().supabase;
  const usage = new Map<string, Usage[]>();
  await Promise.all(
    imageColumns.map(async ({ table, label, columns }) => {
      const result = await db.from(table).select(columns.join(","));
      if (result.error) return;
      for (const row of (result.data || []) as unknown as Record<
        string,
        string | null
      >[])
        for (const column of columns) {
          const value = row[column];
          if (!value?.startsWith("/media/")) continue;
          const places = usage.get(value) || [];
          const place = places.find((p) => p.label === label);
          if (place) place.count += 1;
          else places.push({ label, count: 1 });
          usage.set(value, places);
        }
    }),
  );
  return usage;
}
export const usageTotal = (places: Usage[] = []) =>
  places.reduce((sum, place) => sum + place.count, 0);
export const usageSummary = (places: Usage[] = []) =>
  places.map((p) => (p.count > 1 ? `${p.label} (${p.count})` : p.label)).join(", ");
