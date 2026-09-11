import type { Metadata } from "next";
import type { SiteData } from "@/types";
export function pageMetadata(
  data: SiteData,
  {
    title,
    description,
    image,
    path = "/",
    noindex = false,
  }: {
    title?: string;
    description?: string;
    image?: string;
    path?: string;
    noindex?: boolean;
  } = {},
): Metadata {
  const s = data.settings;
  const origin = process.env.SITE_ORIGIN || "http://localhost:3000";
  const pageTitle = title ? `${title} | ${s.site_name}` : s.seo_title;
  const canonical = new URL(path, origin).href;
  const imageUrl = new URL(image || s.og_image, origin).href;
  return {
    title: pageTitle,
    description: description || s.seo_description,
    alternates: { canonical },
    openGraph: {
      title: pageTitle,
      description: description || s.seo_description,
      url: canonical,
      images: [imageUrl],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: description || s.seo_description,
      images: [imageUrl],
    },
    icons: { icon: s.favicon },
    robots:
      noindex || s.show_demo === 1 ? { index: false, follow: true } : undefined,
  };
}
