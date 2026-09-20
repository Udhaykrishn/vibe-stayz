export interface Field {
  key: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "number"
    | "decimal"
    | "checkbox"
    | "image"
    | "select"
    | "date"
    | "email";
  required?: boolean;
  options?: string[];
  /** Friendly labels for `options`. Display only — the stored value is the option itself. */
  optionLabels?: Record<string, string>;
  relation?: "locations" | "resorts";
  help?: string;
  full?: boolean;
}
export interface Group {
  title: string;
  fields: Field[];
}
export interface Config {
  label: string;
  singular: string;
  icon: string;
  description: string;
  groups: Group[];
}
const f = (
  key: string,
  label: string,
  type: Field["type"] = "text",
  extras: Partial<Field> = {},
): Field => ({ key, label, type, ...extras });
/** Destination icons an editor can choose from. Keys match the `Icon` component. */
export const DESTINATION_ICONS: Record<string, string> = {
  pin: "Map pin (default)",
  mountain: "Hills & meadows",
  peak: "High peaks",
  mist: "Misty hills",
  leaf: "Tea gardens",
  trees: "Forest & wild",
  camp: "Camping & trails",
  waves: "Backwaters & sea",
  boat: "Houseboats",
  anchor: "Harbour town",
  ship: "Port city",
  palm: "Palms & beaches",
  shell: "Beach & shore",
  fish: "Fishing village",
  water: "Lakes & waterfalls",
  sunrise: "Sunrise views",
  sunset: "Sunset views",
  landmark: "Heritage town",
  fort: "Forts & palaces",
  church: "Old quarter",
  bird: "Wildlife & birds",
  flower: "Gardens & blooms",
  umbrella: "Resort & leisure",
  compass: "Off the map",
};
const seo: Group = {
  title: "Search appearance",
  fields: [
    f("seo_title", "SEO title"),
    f("seo_description", "SEO description", "textarea"),
  ],
};
const visibility: Group = {
  title: "Visibility & order",
  fields: [
    f("published", "Published", "checkbox"),
    f("featured", "Featured", "checkbox"),
    f("display_order", "Display order", "number"),
  ],
};
const photo: Group = {
  title: "Cover photograph",
  fields: [
    f("cover_image", "Cover image", "image"),
    f("image_alt", "Image description (alt text)"),
  ],
};
export const cms: Record<string, Config> = {
  hero_banners: {
    label: "Banners / Hero Carousel",
    singular: "Banner",
    icon: "image",
    description: "Manage the homepage carousel independently of locations, resorts and offers. Active banners rotate every nine seconds, in display order.",
    groups: [
      { title: "Banner content", fields: [
        f("title", "Title", "text", { required: true }),
        f("subtitle", "Short subtitle", "textarea"),
        f("label", "Small location / category label", "text", { help: "Free text for this banner; not linked to Locations." }),
        f("image", "Background image", "image", { required: true, help: "Upload or choose a wide landscape image. Keep the subject near the centre for mobile cropping." }),
      ] },
      { title: "Call to action", fields: [
        f("cta_label", "CTA text", "text", { required: true }),
        f("cta_url", "CTA link", "text", { required: true, help: "Use a site path such as /resorts, or a full https:// link." }),
      ] },
      { title: "Visibility & order", fields: [
        f("active", "Active", "checkbox", { help: "Inactive banners appear only in admin preview." }),
        f("display_order", "Display order", "number", { required: true, help: "Lower numbers appear first." }),
      ] },
    ],
  },
  resorts: {
    label: "Resorts",
    singular: "Resort",
    icon: "bed",
    description: "Beautiful places, thoughtfully presented.",
    groups: [
      {
        title: "The essentials",
        fields: [
          f("name", "Property name", "text", { required: true }),
          f("slug", "Page slug", "text", {
            required: true,
            help: "Lowercase words separated by hyphens.",
          }),
          f("subtitle", "Subtitle"),
          f("location_id", "Destination", "select", {
            relation: "locations",
            required: true,
          }),
          f("property_type", "Property type", "text", { required: true }),
          f("short_description", "Short description", "textarea", {
            full: true,
          }),
          f("description", "Full description", "textarea", {
            full: true,
            help: "Separate paragraphs with a blank line.",
          }),
        ],
      },
      photo,
      {
        title: "Spaces & capacity",
        fields: [
          f("max_guests", "Maximum guests", "number", { required: true }),
          f("bedrooms", "Bedrooms", "number"),
          f("bathrooms", "Bathrooms", "number"),
          f("highlights", "Property highlights", "textarea", {
            help: "One highlight per line.",
            full: true,
          }),
        ],
      },
      {
        title: "Location & privacy",
        fields: [
          f("address", "Property address", "textarea"),
          f("show_address", "Show address and map publicly", "checkbox"),
          f("map_url", "Google Maps link"),
          f("map_embed_url", "Google Maps embed URL", "text", { help: "Paste only the https://www.google.com/maps/embed… URL, not iframe HTML. If left blank, the address is used. Hidden addresses show a destination-area map." }),
          f("whatsapp_override", "Property WhatsApp override"),
        ],
      },
      {
        title: "Informational pricing",
        fields: [
          f("starting_price", "Starting price (₹)", "number"),
          f("price_label", "Price label"),
          f("weekday_rate", "Weekday pricing"),
          f("weekend_rate", "Weekend pricing"),
          f("group_package", "Group package information"),
          f("extra_guest_info", "Additional guest information"),
          f("pricing_disclaimer", "Pricing disclaimer", "textarea", {
            full: true,
          }),
        ],
      },
      {
        title: "House information",
        fields: [
          f("check_in", "Check-in time"),
          f("check_out", "Check-out time"),
          f("rules", "House rules", "textarea", {
            full: true,
            help: "One rule per line. These times are informational only.",
          }),
        ],
      },
      seo,
      visibility,
      {
        title: "Archive",
        fields: [f("archived", "Archived (hidden from visitors)", "checkbox")],
      },
    ],
  },
  locations: {
    label: "Locations",
    singular: "Location",
    icon: "pin",
    description: "Give every getaway a beautiful backdrop.",
    groups: [
      {
        title: "Destination",
        fields: [
          f("name", "Location name", "text", { required: true }),
          f("slug", "Page slug", "text", { required: true }),
          f("subtitle", "Short tagline"),
          f("description", "Description", "textarea", { full: true }),
          f("icon", "Destination icon", "select", {
            options: Object.keys(DESTINATION_ICONS),
            optionLabels: DESTINATION_ICONS,
            help: "Shown beside this destination on the homepage. Pick the one that matches the place — a harbour for Kochi, tea gardens for Munnar.",
          }),
        ],
      },
      photo,
      seo,
      visibility,
    ],
  },
  amenities: {
    label: "Amenities",
    singular: "Amenity",
    icon: "leaf",
    description: "Reusable comforts for every property.",
    groups: [
      {
        title: "Amenity details",
        fields: [
          f("name", "Amenity name", "text", { required: true }),
          f("icon", "Icon", "select", {
            options: [
              "waves",
              "wifi",
              "snowflake",
              "utensils",
              "car",
              "flame",
              "mountain",
              "coffee",
              "paw",
              "leaf",
              "trees",
              "bed",
              "bath",
              "check",
            ],
          }),
          f("category", "Category", "select", {
            options: [
              "Essentials",
              "Recreation",
              "Outdoor",
              "Food",
              "Wellness",
              "Accessibility",
            ],
          }),
          f("active", "Active", "checkbox"),
          f("display_order", "Display order", "number"),
        ],
      },
    ],
  },
  offers: {
    label: "Offers",
    singular: "Offer",
    icon: "offer",
    description: "Scheduled campaigns and individual stay prices. Dates use India time; lower order wins within each targeting level.",
    groups: [
      {
        title: "Offer",
        fields: [
          f("title", "Title", "text", { required: true }),
          f("description", "Description", "textarea", { full: true }),
          f("image", "Promotional image", "image"),
          f("mobile_image", "Mobile promotional image (optional)", "image"),
          f("location_id", "Destination (optional)", "select", { relation: "locations", help: "Select participating stays below. A destination does not automatically include every stay." }),
          f("badge", "Badge"),
          f("promotional_text", "Promotional text"),
          f("cta_label", "Button label"),
          f("cta_type", "Button action", "select", {
            options: ["resort", "whatsapp", "custom"],
          }),
          f("cta_url", "Custom button destination", "text", { help: "A /resorts path or an https:// URL. Used for custom actions." }),
        ],
      },
      {
        title: "Display period",
        fields: [
          f("start_date", "Show from", "date"),
          f("end_date", "Show until (inclusive)", "date"),
          f("active", "Active", "checkbox"),
          f("display_order", "Display order", "number"),
        ],
      },
    ],
  },
  faqs: {
    label: "FAQs", singular: "FAQ", icon: "help", description: "Helpful answers for guests on the homepage.",
    groups: [{ title: "Question & answer", fields: [f("question", "Question", "text", { required: true, full: true }), f("answer", "Answer", "textarea", { required: true, full: true }), f("published", "Published", "checkbox"), f("display_order", "Display order", "number")] }],
  },
  nearby_attractions: {
    label: "Nearby attractions",
    singular: "Attraction",
    icon: "mountain",
    description: "Help guests discover the surrounding area.",
    groups: [
      {
        title: "Attraction",
        fields: [
          f("name", "Attraction name", "text", { required: true }),
          f("resort_id", "Related resort", "select", {
            relation: "resorts",
            required: true,
          }),
          f("image", "Attraction image", "image"),
          f("distance", "Distance"),
          f("travel_time", "Approximate travel time"),
          f("description", "Description", "textarea"),
          f("display_order", "Display order", "number"),
        ],
      },
    ],
  },
  page_content: {
    label: "Site content",
    singular: "Page section",
    icon: "file",
    description:
      "Shape your page content. Manage the homepage hero separately in Banners / Hero Carousel.",
    groups: [
      {
        title: "Page section",
        fields: [
          f("page", "Page", "select", {
            options: [
              "home",
              "about",
              "contact",
              "resorts",
              "locations",
              "offers",
            ],
            required: true,
          }),
          f("section", "Section key", "text", {
            required: true,
            help: "Keep existing section keys to preserve their position on the site.",
          }),
          f("eyebrow", "Small heading", "text", {
            help: "The small label above the section heading.",
          }),
          f("title", "Heading", "textarea", {
            help: "The heading displayed in this page section.",
          }),
          f("body", "Body text", "textarea", { full: true }),
          f("image", "Section image", "image"),
          f("cta_label", "Button label"),
          f("cta_url", "Button link"),
          f("display_order", "Display order", "number"),
        ],
      },
    ],
  },
  navigation: {
    label: "Navigation",
    singular: "Navigation item",
    icon: "menu",
    description: "Manage footer links. The main menu contains Home, Resorts, About and Contact, with a WhatsApp button.",
    groups: [
      {
        title: "Navigation item",
        fields: [
          f("label", "Link label", "text", { required: true }),
          f("url", "Link URL", "text", { required: true }),
          f("in_footer", "Show in footer", "checkbox"),
          f("display_order", "Display order", "number"),
        ],
      },
    ],
  },
  site_settings: {
    label: "Settings",
    singular: "Website settings",
    icon: "settings",
    description: "Your brand, contact details and enquiry preferences.",
    groups: [
      {
        title: "Branding",
        fields: [
          f("site_name", "Website name", "text", { required: true }),
          f("logo", "Logo", "image"),
          f("favicon", "Favicon", "image"),
          f("footer_description", "Footer description", "textarea"),
          f("copyright", "Copyright text"),
        ],
      },
      {
        title: "Contact details",
        fields: [
          f("whatsapp", "WhatsApp number", "text", {
            help: "Country code and number, e.g. 91 followed by your 10-digit Indian number. No + or spaces needed.",
          }),
          f("phone", "Phone"),
          f("email", "Email", "email"),
          f("address", "Business address", "textarea"),
          f("business_hours", "Business hours", "textarea"),
          f("map_url", "Google Maps link"),
        ],
      },
      {
        title: "WhatsApp enquiries",
        fields: [
          f("greeting", "Default greeting"),
          f("enquiry_message", "General enquiry message", "textarea"),
          f("property_template", "Property enquiry template", "textarea", {
            full: true,
            help: "Available placeholders: {greeting}, {property}, {location}, {url}.",
          }),
          f("cta_label", "Enquiry button label"),
          f("floating_enabled", "Show floating WhatsApp button", "checkbox"),
        ],
      },
      {
        title: "Social links",
        fields: [
          f("instagram", "Instagram URL"),
          f("facebook", "Facebook URL"),
          f("youtube", "YouTube URL"),
          f("linkedin", "LinkedIn URL"),
        ],
      },
      seo,
      {
        title: "Search & launch",
        fields: [
          f("og_image", "Default sharing image", "image"),
        ],
      },
    ],
  },
};
