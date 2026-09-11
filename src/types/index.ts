import type {D1Database,R2Bucket} from '@cloudflare/workers-types/index.ts';
import type * as schema from '../../db/schema';
export type Resort=typeof schema.resorts.$inferSelect;
export type Location=typeof schema.locations.$inferSelect;
export type Amenity=typeof schema.amenities.$inferSelect;
export type Offer=typeof schema.offers.$inferSelect;
export type Testimonial=typeof schema.testimonials.$inferSelect;
export type PageContent=typeof schema.pageContent.$inferSelect;
export type Settings=typeof schema.siteSettings.$inferSelect;
export type NavItem=typeof schema.navigation.$inferSelect;
export type GalleryImage=typeof schema.resortImages.$inferSelect;
export type Attraction=typeof schema.nearbyAttractions.$inferSelect;
export type Media=typeof schema.media.$inferSelect;
export type ResortView=Resort & {location:Location; amenities:Amenity[]; gallery:GalleryImage[]; highlights:string[]; rules:string[]; attractions:Attraction[]; offers:Offer[]};
export type SiteData={settings:Settings;resorts:ResortView[];locations:Location[];amenities:Amenity[];offers:(Offer & {resorts:ResortView[]})[];testimonials:Testimonial[];content:PageContent[];navigation:NavItem[]};
export interface RuntimeEnv { DB:D1Database; MEDIA:R2Bucket; ADMIN_PASSWORD_HASH?:string; ADMIN_USERNAME?:string; DEMO_MODE?:string; SITE_ORIGIN?:string; }
