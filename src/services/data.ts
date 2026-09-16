import "server-only";
import { runtime } from "../lib/env";
import { previewing } from "../lib/preview";
import { initializeContent } from "../lib/seed";
import { cache } from "react";
import { effectivePromotion, offerStatus } from "../lib/offers";
import type { FAQ, OfferLink } from "../types";
import type {
  SiteData,
  Settings,
  Resort,
  Location,
  Amenity,
  Offer,
  PageContent,
  NavItem,
  GalleryImage,
  Attraction,
} from "../types";

const TABLES = [
  "resorts",
  "locations",
  "amenities",
  "offers",
  "page_content",
  "navigation",
  "nearby_attractions",
  "site_settings",
  "media",
  "faqs",
] as const;
export type Entity = (typeof TABLES)[number];
export const isEntity = (value: string): value is Entity =>
  (TABLES as readonly string[]).includes(value);
export const db = () => runtime().supabase;

function fail(error: { message: string } | null, context: string) {
  if (error) throw new Error(`${context}: ${error.message}`);
}
const byOrderName = <
  T extends { display_order?: number; name?: string; title?: string },
>(
  a: T,
  b: T,
) =>
  (a.display_order || 0) - (b.display_order || 0) ||
  String(a.name || a.title || "").localeCompare(
    String(b.name || b.title || ""),
  );

export async function tableRows<T>(entity: Entity): Promise<T[]> {
  const result = await db().from(entity).select("*");
  fail(result.error, `Load ${entity}`);
  return (result.data || []) as T[];
}

export async function recordById<T>(
  entity: Entity,
  id: string,
): Promise<T | null> {
  const result = await db().from(entity).select("*").eq("id", id).maybeSingle();
  fail(result.error, `Load ${entity}`);
  return result.data as T | null;
}

/**
 * `public` renders exactly what a visitor sees. `preview` relaxes the visibility
 * filters only — drafts, inactive amenities and scheduled campaigns appear, while
 * hidden addresses, sample-content settings and archived stays stay as they are
 * on the live site. `admin` returns everything, unmasked, for the editors.
 */
export type DataMode = "public" | "preview" | "admin";
export const siteData = cache(async (mode: DataMode = "public"): Promise<SiteData> => {
  const admin = mode === "admin";
  const draft = mode !== "public";
  const env = runtime();
  await initializeContent(env);
  const settingsResult = await db()
    .from("site_settings")
    .select("*")
    .eq("id", "global")
    .single();
  fail(settingsResult.error, "Load settings");
  const settings = settingsResult.data as Settings;
  const results = await Promise.all([
    db().from("resorts").select("*"),
    db().from("locations").select("*"),
    db().from("amenities").select("*"),
    db().from("offers").select("*"),
    db().from("page_content").select("*"),
    db().from("navigation").select("*"),
    db().from("resort_images").select("*"),
    db().from("resort_amenities").select("*"),
    db().from("resort_features").select("*"),
    db().from("nearby_attractions").select("*"),
    db().from("offer_resorts").select("*"),
    db().from("faqs").select("*"),
  ]);
  results.forEach((result, index) =>
    fail(result.error, `Load site data ${index + 1}`),
  );
  const rawResorts = (results[0].data || []) as Resort[];
  const rawLocations = (results[1].data || []) as Location[];
  const rawAmenities = (results[2].data || []) as Amenity[];
  const rawOffers = (results[3].data || []) as Offer[];
  const showDemo = admin || !!settings.show_demo;
  const visible = <T extends { is_demo: number }>(items: T[]) =>
    showDemo ? items : items.filter((item) => !item.is_demo);
  const locations = visible(rawLocations)
    .filter((item) => draft || !!item.published)
    .sort(byOrderName);
  const amenities = visible(rawAmenities)
    .filter((item) => draft || !!item.active)
    .sort(byOrderName);
  const offers = visible(rawOffers)
    .filter((item) => draft || offerStatus(item) === "Active")
    .sort(byOrderName);
  const content = ((results[4].data || []) as PageContent[]).sort(byOrderName);
  const navigation = ((results[5].data || []) as NavItem[]).sort(byOrderName);
  const gallery = ((results[6].data || []) as GalleryImage[]).sort(byOrderName);
  const relations = (results[7].data || []) as {
    resort_id: string;
    amenity_id: string;
  }[];
  const features = (
    (results[8].data || []) as {
      resort_id: string;
      kind: string;
      text: string;
      display_order: number;
    }[]
  ).sort(byOrderName);
  const attractions = ((results[9].data || []) as Attraction[]).sort(
    byOrderName,
  );
  const offerRelations = (results[10].data || []) as OfferLink[];
  const resorts = visible(rawResorts)
    .filter(
      (item) => admin || (!item.archived && (draft || !!item.published)),
    )
    .sort(byOrderName);
  const views = resorts
    .filter((resort) =>
      locations.some((location) => location.id === resort.location_id),
    )
    .map((resort) => ({
      ...resort,
      ...(!admin && !resort.show_address ? { address: "", map_url: "", latitude: null, longitude: null, map_embed_url: "" } : {}),
      promotion: effectivePromotion(resort, offers, offerRelations),
      location: locations.find(
        (location) => location.id === resort.location_id,
      )!,
      amenities: amenities.filter((amenity) =>
        relations.some(
          (link) =>
            link.resort_id === resort.id && link.amenity_id === amenity.id,
        ),
      ),
      gallery: gallery.filter((image) => image.resort_id === resort.id),
      highlights: features
        .filter(
          (feature) =>
            feature.resort_id === resort.id && feature.kind === "highlight",
        )
        .map((feature) => feature.text),
      rules: features
        .filter(
          (feature) =>
            feature.resort_id === resort.id && feature.kind === "rule",
        )
        .map((feature) => feature.text),
      attractions: attractions.filter(
        (attraction) => attraction.resort_id === resort.id,
      ),
      offers: offers.filter((offer) =>
        offerRelations.some(
          (link) => link.offer_id === offer.id && link.resort_id === resort.id,
        ),
      ),
    }));
  return {
    settings,
    resorts: views,
    locations,
    amenities,
    offers: offers.map((offer) => ({
      ...offer,
      resorts: views.filter((resort) =>
        offerRelations.some(
          (link) => link.offer_id === offer.id && link.resort_id === resort.id,
        ),
      ),
    })),
    content,
    navigation,
    faqs: ((results[11].data || []) as FAQ[]).filter(f => draft || f.published).sort(byOrderName),
    offerLinks: admin ? offerRelations : [],
  };
});
/** Data for the public site: the live view, unless a signed-in editor is previewing. */
export const publicData = async (): Promise<SiteData> =>
  siteData((await previewing()) ? "preview" : "public");
