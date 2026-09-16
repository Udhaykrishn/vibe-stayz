/**
 * Clears the demo/sample catalogue and seeds the real destinations.
 *
 * Wipes: resorts and everything hanging off them, offers, FAQs,
 * locations. Leaves the site's own furniture alone — page copy, navigation,
 * the amenity library, media and settings all survive.
 *
 * Run with:  node scripts/reset-content.mjs
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const match = /^([A-Z0-9_]+)=(.*)$/.exec(line.trim());
  if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
}

const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const now = new Date().toISOString();

/** WhatsApp links go through wa.me, which needs the country code. */
const WHATSAPP = "918848431474";
const PHONE = "+91 88484 31474";

/** Child rows first: the foreign keys are ON DELETE RESTRICT. */
const wipe = [
  ["resort_images", "id"],
  ["resort_features", "id"],
  ["resort_amenities", "resort_id"],
  ["nearby_attractions", "id"],
  ["offer_resorts", "offer_id"],
  ["faqs", "id"],
  ["offers", "id"],
  ["resorts", "id"],
  ["locations", "id"],
];

const locations = [
  {
    id: "kochi",
    name: "Kochi",
    slug: "kochi",
    subtitle: "Harbour light and old streets.",
    description:
      "A port city on the Kerala coast, where the harbour, the old quarter and the backwaters all sit within a short drive of one another.",
    icon: "anchor",
    display_order: 1,
  },
  {
    id: "idukki-dam",
    name: "Idukki Dam",
    slug: "idukki-dam",
    subtitle: "Still water between the hills.",
    description:
      "The reservoir and the high ranges around it, held between steep forested hills in central Kerala.",
    icon: "water",
    display_order: 2,
  },
  {
    id: "ramakkalmedu",
    name: "Ramakkalmedu",
    slug: "ramakkalmedu",
    subtitle: "Wind, ridgelines and long views.",
    description:
      "A hilltop village in Idukki known for its windswept ridge and the wide view out across the plains below.",
    icon: "peak",
    display_order: 3,
  },
];

const check = (result, label) => {
  if (result.error) {
    console.error(`FAILED ${label}: ${result.error.message}`);
    process.exit(1);
  }
  return result;
};

for (const [table, key] of wipe) {
  const { count } = check(
    await db.from(table).delete({ count: "exact" }).not(key, "is", null),
    `clear ${table}`,
  );
  console.log(`cleared ${table} (${count ?? 0} rows)`);
}

for (const location of locations) {
  check(
    await db.from("locations").insert({
      ...location,
      cover_image: "",
      image_alt: "",
      seo_title: "",
      seo_description: "",
      featured: 1,
      published: 1,
      is_demo: 0,
      updated_at: now,
    }),
    `insert ${location.name}`,
  );
  console.log(`added location ${location.name}`);
}

check(
  await db
    .from("site_settings")
    .update({ whatsapp: WHATSAPP, phone: PHONE, updated_at: now })
    .eq("id", "global"),
  "update site_settings",
);
console.log(`whatsapp set to ${WHATSAPP}, phone set to ${PHONE}`);
console.log("done");
