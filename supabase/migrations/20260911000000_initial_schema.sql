CREATE TABLE "admin_sessions" (
	"token_hash" text PRIMARY KEY NOT NULL,
	"expires_at" bigint NOT NULL,
	"created_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "amenities" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"icon" text DEFAULT 'check' NOT NULL,
	"category" text DEFAULT 'Essentials' NOT NULL,
	"active" integer DEFAULT 1 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"updated_at" text NOT NULL,
	"is_demo" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"subtitle" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"cover_image" text DEFAULT '' NOT NULL,
	"image_alt" text DEFAULT '' NOT NULL,
	"seo_title" text DEFAULT '' NOT NULL,
	"seo_description" text DEFAULT '' NOT NULL,
	"icon" text DEFAULT 'mountain' NOT NULL,
	"featured" integer DEFAULT 0 NOT NULL,
	"published" integer DEFAULT 1 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"updated_at" text NOT NULL,
	"is_demo" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "locations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "login_attempts" (
	"key" text PRIMARY KEY NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"reset_at" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media" (
	"id" text PRIMARY KEY NOT NULL,
	"object_key" text NOT NULL,
	"filename" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"width" integer,
	"height" integer,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "navigation" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"url" text NOT NULL,
	"in_header" integer DEFAULT 1 NOT NULL,
	"in_footer" integer DEFAULT 1 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"updated_at" text NOT NULL,
	"is_demo" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "nearby_attractions" (
	"id" text PRIMARY KEY NOT NULL,
	"resort_id" text NOT NULL,
	"name" text NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"distance" text DEFAULT '' NOT NULL,
	"travel_time" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"updated_at" text NOT NULL,
	"is_demo" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "offer_resorts" (
	"offer_id" text NOT NULL,
	"resort_id" text NOT NULL,
	CONSTRAINT "offer_resorts_offer_id_resort_id_pk" PRIMARY KEY("offer_id","resort_id")
);
--> statement-breakpoint
CREATE TABLE "offers" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"badge" text DEFAULT '' NOT NULL,
	"promotional_text" text DEFAULT '' NOT NULL,
	"cta_label" text DEFAULT 'Explore this escape' NOT NULL,
	"cta_type" text DEFAULT 'resort' NOT NULL,
	"start_date" text DEFAULT '' NOT NULL,
	"end_date" text DEFAULT '' NOT NULL,
	"active" integer DEFAULT 1 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"updated_at" text NOT NULL,
	"is_demo" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "page_content" (
	"id" text PRIMARY KEY NOT NULL,
	"page" text NOT NULL,
	"section" text NOT NULL,
	"eyebrow" text DEFAULT '' NOT NULL,
	"title" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"image" text DEFAULT '' NOT NULL,
	"cta_label" text DEFAULT '' NOT NULL,
	"cta_url" text DEFAULT '' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"updated_at" text NOT NULL,
	"is_demo" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resort_amenities" (
	"resort_id" text NOT NULL,
	"amenity_id" text NOT NULL,
	CONSTRAINT "resort_amenities_resort_id_amenity_id_pk" PRIMARY KEY("resort_id","amenity_id")
);
--> statement-breakpoint
CREATE TABLE "resort_features" (
	"id" text PRIMARY KEY NOT NULL,
	"resort_id" text NOT NULL,
	"kind" text NOT NULL,
	"text" text NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resort_images" (
	"id" text PRIMARY KEY NOT NULL,
	"resort_id" text NOT NULL,
	"url" text NOT NULL,
	"alt" text DEFAULT '' NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resorts" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"subtitle" text DEFAULT '' NOT NULL,
	"short_description" text DEFAULT '' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"location_id" text NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"show_address" integer DEFAULT 0 NOT NULL,
	"map_url" text DEFAULT '' NOT NULL,
	"property_type" text DEFAULT 'Private villa' NOT NULL,
	"starting_price" integer,
	"price_label" text DEFAULT '/ night onwards' NOT NULL,
	"weekday_rate" text DEFAULT '' NOT NULL,
	"weekend_rate" text DEFAULT '' NOT NULL,
	"group_package" text DEFAULT '' NOT NULL,
	"extra_guest_info" text DEFAULT '' NOT NULL,
	"pricing_disclaimer" text DEFAULT 'Prices are indicative and may vary. Contact us on WhatsApp for current pricing and stay details.' NOT NULL,
	"max_guests" integer DEFAULT 2 NOT NULL,
	"bedrooms" integer,
	"bathrooms" integer,
	"cover_image" text DEFAULT '' NOT NULL,
	"image_alt" text DEFAULT '' NOT NULL,
	"check_in" text DEFAULT '2:00 PM' NOT NULL,
	"check_out" text DEFAULT '11:00 AM' NOT NULL,
	"whatsapp_override" text DEFAULT '' NOT NULL,
	"seo_title" text DEFAULT '' NOT NULL,
	"seo_description" text DEFAULT '' NOT NULL,
	"featured" integer DEFAULT 0 NOT NULL,
	"published" integer DEFAULT 0 NOT NULL,
	"archived" integer DEFAULT 0 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"updated_at" text NOT NULL,
	"is_demo" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "resorts_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "site_settings" (
	"id" text PRIMARY KEY DEFAULT 'global' NOT NULL,
	"site_name" text DEFAULT 'Vibe Stayz' NOT NULL,
	"logo" text DEFAULT '/images/brand-round.png' NOT NULL,
	"favicon" text DEFAULT '/images/brand-round.png' NOT NULL,
	"footer_description" text DEFAULT '' NOT NULL,
	"whatsapp" text DEFAULT '' NOT NULL,
	"phone" text DEFAULT '' NOT NULL,
	"email" text DEFAULT '' NOT NULL,
	"address" text DEFAULT '' NOT NULL,
	"business_hours" text DEFAULT '' NOT NULL,
	"map_url" text DEFAULT '' NOT NULL,
	"greeting" text DEFAULT 'Hi Vibe Stayz,' NOT NULL,
	"enquiry_message" text DEFAULT 'I would love some help finding my next getaway.' NOT NULL,
	"property_template" text DEFAULT '{greeting}
I''m interested in {property}, {location}.

Could you please share the current price and stay details?

Property: {property}
Location: {location}
Page: {url}' NOT NULL,
	"cta_label" text DEFAULT 'Enquire on WhatsApp' NOT NULL,
	"floating_enabled" integer DEFAULT 1 NOT NULL,
	"instagram" text DEFAULT '' NOT NULL,
	"facebook" text DEFAULT '' NOT NULL,
	"youtube" text DEFAULT '' NOT NULL,
	"linkedin" text DEFAULT '' NOT NULL,
	"seo_title" text DEFAULT 'Vibe Stayz | Private villas & beautiful Kerala escapes' NOT NULL,
	"seo_description" text DEFAULT 'Discover private villas, mountain cabins and peaceful resorts across Kerala. Find a stay you love and enquire directly on WhatsApp.' NOT NULL,
	"og_image" text DEFAULT '/images/hero-1680.webp' NOT NULL,
	"copyright" text DEFAULT 'All rights reserved.' NOT NULL,
	"show_demo" integer DEFAULT 1 NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"location" text DEFAULT '' NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"quote" text NOT NULL,
	"photo" text DEFAULT '' NOT NULL,
	"resort_id" text,
	"published" integer DEFAULT 0 NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"updated_at" text NOT NULL,
	"is_demo" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "nearby_attractions" ADD CONSTRAINT "nearby_attractions_resort_id_resorts_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_resorts" ADD CONSTRAINT "offer_resorts_offer_id_offers_id_fk" FOREIGN KEY ("offer_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "offer_resorts" ADD CONSTRAINT "offer_resorts_resort_id_resorts_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resort_amenities" ADD CONSTRAINT "resort_amenities_resort_id_resorts_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resort_amenities" ADD CONSTRAINT "resort_amenities_amenity_id_amenities_id_fk" FOREIGN KEY ("amenity_id") REFERENCES "public"."amenities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resort_features" ADD CONSTRAINT "resort_features_resort_id_resorts_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resort_images" ADD CONSTRAINT "resort_images_resort_id_resorts_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resorts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resorts" ADD CONSTRAINT "resorts_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "testimonials" ADD CONSTRAINT "testimonials_resort_id_resorts_id_fk" FOREIGN KEY ("resort_id") REFERENCES "public"."resorts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "resort_location_idx" ON "resorts" USING btree ("location_id");--> statement-breakpoint
CREATE INDEX "resort_visibility_idx" ON "resorts" USING btree ("published","archived");

-- The application uses the server-only service role. No table is exposed to anon users.
ALTER TABLE "admin_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "amenities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "locations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "login_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "media" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "navigation" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "nearby_attractions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "offer_resorts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "offers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "page_content" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "resort_amenities" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "resort_features" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "resort_images" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "resorts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "site_settings" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "testimonials" ENABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
VALUES ('media','media',true,8388608,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET public=true,file_size_limit=8388608,allowed_mime_types=EXCLUDED.allowed_mime_types;
