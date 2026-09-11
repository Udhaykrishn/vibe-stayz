import "server-only";
import { runtime } from "../lib/env";
import { initializeContent } from "../lib/seed";
import type {
  SiteData,
  Settings,
  Resort,
  Location,
  Amenity,
  Offer,
  Testimonial,
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
  "testimonials",
  "page_content",
  "navigation",
  "nearby_attractions",
  "site_settings",
  "media",
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

export async function siteData(admin = false): Promise<SiteData> {
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
    db().from("testimonials").select("*"),
    db().from("page_content").select("*"),
    db().from("navigation").select("*"),
    db().from("resort_images").select("*"),
    db().from("resort_amenities").select("*"),
    db().from("resort_features").select("*"),
    db().from("nearby_attractions").select("*"),
    db().from("offer_resorts").select("*"),
  ]);
  results.forEach((result, index) =>
    fail(result.error, `Load site data ${index + 1}`),
  );
  const rawResorts = (results[0].data || []) as Resort[];
  const rawLocations = (results[1].data || []) as Location[];
  const rawAmenities = (results[2].data || []) as Amenity[];
  const rawOffers = (results[3].data || []) as Offer[];
  const rawTestimonials = (results[4].data || []) as Testimonial[];
  const showDemo = admin || !!settings.show_demo;
  const visible = <T extends { is_demo: number }>(items: T[]) =>
    showDemo ? items : items.filter((item) => !item.is_demo);
  const today = new Date().toISOString().slice(0, 10);
  const locations = visible(rawLocations)
    .filter((item) => admin || !!item.published)
    .sort(byOrderName);
  const amenities = visible(rawAmenities)
    .filter((item) => admin || !!item.active)
    .sort(byOrderName);
  const offers = visible(rawOffers)
    .filter(
      (item) =>
        admin ||
        (!!item.active &&
          (!item.start_date || item.start_date <= today) &&
          (!item.end_date || item.end_date >= today)),
    )
    .sort(byOrderName);
  const testimonials = visible(rawTestimonials)
    .filter((item) => admin || !!item.published)
    .sort(byOrderName);
  const content = ((results[5].data || []) as PageContent[]).sort(byOrderName);
  const navigation = ((results[6].data || []) as NavItem[]).sort(byOrderName);
  const gallery = ((results[7].data || []) as GalleryImage[]).sort(byOrderName);
  const relations = (results[8].data || []) as {
    resort_id: string;
    amenity_id: string;
  }[];
  const features = (
    (results[9].data || []) as {
      resort_id: string;
      kind: string;
      text: string;
      display_order: number;
    }[]
  ).sort(byOrderName);
  const attractions = ((results[10].data || []) as Attraction[]).sort(
    byOrderName,
  );
  const offerRelations = (results[11].data || []) as {
    resort_id: string;
    offer_id: string;
  }[];
  const resorts = visible(rawResorts)
    .filter((item) => admin || (!!item.published && !item.archived))
    .sort(byOrderName);
  const views = resorts
    .filter((resort) =>
      locations.some((location) => location.id === resort.location_id),
    )
    .map((resort) => ({
      ...resort,
      ...(!admin && !resort.show_address ? { address: "", map_url: "" } : {}),
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
    testimonials,
    content,
    navigation,
  };
}
