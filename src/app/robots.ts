import type { MetadataRoute } from "next";
import { siteData } from "@/services/data";
export const dynamic = "force-dynamic";
export default async function robots(): Promise<MetadataRoute.Robots> {
  const data = await siteData();
  const origin = process.env.SITE_ORIGIN || "http://localhost:3000";
  return {
    rules: data.settings.show_demo
      ? { userAgent: "*", disallow: "/" }
      : { userAgent: "*", allow: "/", disallow: ["/admin", "/api/"] },
    sitemap: `${origin}/sitemap.xml`,
  };
}
