import type { MetadataRoute } from "next";
import { siteData } from "@/services/data";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const data = await siteData();
  const origin = process.env.SITE_ORIGIN || "http://localhost:3000";
  const pages = [
    "/",
    "/resorts",
    "/locations",
    "/offers",
    "/about",
    "/contact",
    ...data.resorts.map((r) => `/resorts/${r.slug}`),
    ...data.locations.map((l) => `/locations/${l.slug}`),
  ];
  return pages.map((path) => ({ url: new URL(path, origin).href }));
}
