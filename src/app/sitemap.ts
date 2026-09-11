import type { MetadataRoute } from "next";
import { siteData } from "@/services/data";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await siteData();
  if (data.settings.show_demo) return [];
  const origin = process.env.SITE_ORIGIN || "http://localhost:3000";
  const pages = [
    "/",
    "/resorts",
    "/locations",
    "/offers",
    "/about",
    "/contact",
    ...data.resorts.filter((r) => !r.is_demo).map((r) => `/resorts/${r.slug}`),
    ...data.locations
      .filter((l) => !l.is_demo)
      .map((l) => `/locations/${l.slug}`),
  ];
  return pages.map((path) => ({ url: new URL(path, origin).href }));
}
