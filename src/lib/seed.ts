import type { RuntimeEnv } from "../types";
type Row = Record<string, string | number | null>;
export async function initializeContent(env: RuntimeEnv) {
  const existing = await env.supabase
    .from("site_settings")
    .select("id")
    .limit(1)
    .maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return;
  const now = new Date().toISOString();
  const records = new Map<string, Row[]>();
  const add = (table: string, record: Row) =>
    records.set(table, [...(records.get(table) || []), { ...record }]);
  const stamp = { updated_at: now, is_demo: 0 };
  const sections = [
    [
      "home",
      "hero",
      "PRIVATE VILLAS · RESORTS · NATURE ESCAPES",
      "Stay beyond\nthe ordinary.",
      "A little closer to nature. A little further from the everyday.\nFind your kind of escape with Vibe Stayz.",
      "/images/hero-1680.webp",
      "Explore resorts",
      "/resorts",
    ],
    [
      "home",
      "featured",
      "THE VIBE STAYZ COLLECTION",
      "Some places just feel right.",
      "Private pools. Slow mornings. Room to be yourself.",
      "",
      "View all stays",
      "/resorts",
    ],
    [
      "home",
      "destinations",
      "A CHANGE OF SCENERY",
      "Where will you find your vibe?",
      "From mist-wrapped hills to palm-fringed backwaters.",
      "",
      "All destinations",
      "/locations",
    ],
    [
      "home",
      "story",
      "A LITTLE ABOUT US",
      "More than a stay.\nA feeling to take home.",
      "We believe the best getaways leave space for the unexpected. A long breakfast, a new favourite view, one more evening together.\n\nVibe Stayz brings beautiful places and thoughtful hospitality together, so you can find a stay that feels like you.",
      "/images/heritage-1080.webp",
      "Our story",
      "/about",
    ],
    [
      "home",
      "offers",
      "A GOOD REASON TO GET AWAY",
      "A little more to look forward to.",
      "Thoughtfully put-together escapes for your next time away.",
      "",
      "Explore offers",
      "/offers",
    ],
    [
      "home",
      "testimonials",
      "GUEST STORIES",
      "The moments that stay with you.",
      "",
      "",
      "",
      "",
    ],
    [
      "home",
      "cta",
      "YOUR NEXT CHAPTER",
      "Good company.\nAn unforgettable setting.",
      "Tell us the kind of escape you have in mind. We’ll help you find your place.",
      "",
      "Explore resorts",
      "/resorts",
    ],
    [
      "about",
      "hero",
      "STAY · ESCAPE · EXPERIENCE",
      "Beautiful places.\nMeaningful moments.",
      "Some journeys are about going further. Ours is about feeling closer — to nature, to the people you love, and to yourself.",
      "/images/brand-story.png",
      "",
      "",
    ],
    [
      "about",
      "story",
      "OUR STORY",
      "A slower way to get away.",
      "Vibe Stayz began with a simple idea: finding a beautiful private stay should feel personal.\n\nWe bring together villas, hill retreats and quiet hideaways, with clear information and an easy way to speak to a real person. From a couple’s weekend to a long-awaited family gathering, there is room for your kind of getaway.",
      "/images/cabin-1080.webp",
      "",
      "",
    ],
    [
      "about",
      "mission",
      "OUR PHILOSOPHY",
      "Thoughtful stays, from the very first hello.",
      "Space to switch off. Information you can understand. And someone to ask when you need a little guidance. That is the experience we want every guest to have.",
      "",
      "Explore the collection",
      "/resorts",
    ],
    [
      "contact",
      "hero",
      "LET’S PLAN SOMETHING LOVELY",
      "Your getaway starts\nwith a conversation.",
      "Have a stay in mind, or still exploring? Tell us a little about your plans and we’ll help you find the right place.",
      "",
      "",
      "",
    ],
    [
      "resorts",
      "hero",
      "FIND YOUR KIND OF ESCAPE",
      "Places worth slowing down for.",
      "Explore private villas, peaceful resorts and nature escapes. A place for every kind of together.",
      "",
      "",
      "",
    ],
    [
      "locations",
      "hero",
      "EXPLORE KERALA",
      "Follow your sense of somewhere.",
      "Cool mountain air, quiet backwaters, or a little coastal sunshine. Choose your backdrop.",
      "",
      "",
      "",
    ],
    [
      "offers",
      "hero",
      "MORE REASONS TO GET AWAY",
      "Make a little time for yourself.",
      "Explore our current escape ideas. Speak with our team for the latest details and personalised pricing.",
      "",
      "",
      "",
    ],
  ];
  sections.forEach(
    ([page, section, eyebrow, title, body, image, cta_label, cta_url], i) =>
      add("page_content", {
        id: `${page}-${section}`,
        page,
        section,
        eyebrow,
        title,
        body,
        image,
        cta_label,
        cta_url,
        display_order: i,
        ...stamp,
      }),
  );
  [
    ["Home", "/"],
    ["Resorts", "/resorts"],
    ["Locations", "/locations"],
    ["Offers", "/offers"],
    ["About", "/about"],
    ["Contact", "/contact"],
  ].forEach(([label, url], i) =>
    add("navigation", {
      id: `nav-${i}`,
      label,
      url,
      in_header: 1,
      in_footer: 1,
      display_order: i,
      ...stamp,
    }),
  );
  if (env.DEMO_MODE === "true") {
    const demo = { updated_at: now, is_demo: 1 };
    const destinations = [
      [
        "vagamon",
        "Vagamon",
        "The art of doing nothing.",
        "Rolling meadows, cool air and open horizons. A hill escape made for unhurried mornings.",
        "mountain",
      ],
      [
        "munnar",
        "Munnar",
        "Wake up above the clouds.",
        "Tea-covered hills and misty mornings. Find a quiet corner in one of Kerala’s most loved hill destinations.",
        "leaf",
      ],
      [
        "wayanad",
        "Wayanad",
        "A little closer to the wild.",
        "Forest trails, green valleys and the rhythm of nature. Make room for an escape into the hills.",
        "trees",
      ],
      [
        "kochi",
        "Kochi",
        "Slow days by the water.",
        "Coastal charm, familiar flavours and quiet waterfront corners. Find your own pace by the coast.",
        "waves",
      ],
    ];
    destinations.forEach(([id, name, subtitle, description, icon], i) =>
      add("locations", {
        id,
        name,
        slug: id,
        subtitle,
        description,
        icon,
        cover_image: `/images/${id}-1080.webp`,
        image_alt: `Scenery in ${name}, Kerala`,
        featured: 1,
        published: 1,
        display_order: i,
        ...demo,
      }),
    );
    const ams = [
      ["pool", "Private pool", "waves", "Recreation"],
      ["wifi", "Wi-Fi", "wifi", "Essentials"],
      ["ac", "Air conditioning", "snowflake", "Essentials"],
      ["kitchen", "Kitchen", "utensils", "Food"],
      ["parking", "Free parking", "car", "Essentials"],
      ["campfire", "Campfire", "flame", "Outdoor"],
      ["mountain", "Mountain view", "mountain", "Outdoor"],
      ["breakfast", "Breakfast", "coffee", "Food"],
      ["pets", "Pet friendly", "paw", "Essentials"],
      ["garden", "Private garden", "leaf", "Outdoor"],
    ];
    ams.forEach(([id, name, icon, category], i) =>
      add("amenities", {
        id,
        name,
        icon,
        category,
        active: 1,
        display_order: i,
        ...demo,
      }),
    );
    const stays = [
      {
        id: "mountain-mist",
        name: "Mountain Mist Villa",
        location_id: "vagamon",
        subtitle: "Your own little world above the hills",
        property_type: "Private villa",
        starting_price: 15000,
        max_guests: 10,
        bedrooms: 3,
        bathrooms: 3,
        cover: "hero",
        features: [
          "Private infinity pool",
          "Mountain views",
          "Entire property",
        ],
        amenities: ["pool", "wifi", "ac", "kitchen", "parking", "mountain"],
      },
      {
        id: "fern-and-fog",
        name: "Fern & Fog Cabin",
        location_id: "munnar",
        subtitle: "A quiet hideaway among the tea hills",
        property_type: "Mountain cabin",
        starting_price: 8500,
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 2,
        cover: "cabin",
        features: [
          "Tea garden setting",
          "Forest-facing deck",
          "Made for slow mornings",
        ],
        amenities: ["wifi", "parking", "campfire", "mountain", "breakfast"],
      },
      {
        id: "coconut-courtyard",
        name: "The Coconut Courtyard",
        location_id: "kochi",
        subtitle: "Old-world warmth, a world of your own",
        property_type: "Heritage stay",
        starting_price: 18000,
        max_guests: 12,
        bedrooms: 4,
        bathrooms: 4,
        cover: "heritage",
        features: [
          "Private courtyard",
          "Private pool",
          "Traditional architecture",
        ],
        amenities: ["pool", "wifi", "ac", "kitchen", "parking", "garden"],
      },
      {
        id: "wildwood-retreat",
        name: "Wildwood Retreat",
        location_id: "wayanad",
        subtitle: "Where the forest sets the pace",
        property_type: "Mountain cabin",
        starting_price: 9500,
        max_guests: 6,
        bedrooms: 2,
        bathrooms: 2,
        cover: "cabin",
        features: [
          "Forest surrounds",
          "Room for the whole family",
          "Outdoor firepit",
        ],
        amenities: ["wifi", "campfire", "parking", "pets", "garden"],
      },
      {
        id: "palm-house",
        name: "The Palm House",
        location_id: "kochi",
        subtitle: "Sun-dappled afternoons, together",
        property_type: "Private villa",
        starting_price: 22000,
        max_guests: 12,
        bedrooms: 4,
        bathrooms: 4,
        cover: "hero",
        features: ["Private pool", "Tropical garden", "Spacious living areas"],
        amenities: ["pool", "wifi", "ac", "kitchen", "garden"],
      },
      {
        id: "meadow-house",
        name: "Meadow House",
        location_id: "vagamon",
        subtitle: "A gentler kind of mountain escape",
        property_type: "Heritage stay",
        starting_price: 12000,
        max_guests: 8,
        bedrooms: 3,
        bathrooms: 3,
        cover: "heritage",
        features: [
          "Private garden",
          "Family-friendly spaces",
          "A peaceful setting",
        ],
        amenities: ["wifi", "parking", "breakfast", "garden", "mountain"],
      },
    ];
    stays.forEach((s, i) => {
      const { cover, features, amenities: stayAmenities, ...fields } = s;
      add("resorts", {
        ...fields,
        slug: s.id,
        short_description: s.subtitle,
        description: `Leave the everyday behind at ${s.name}. This thoughtfully imagined ${s.property_type.toLowerCase()} brings generous living spaces and a beautiful natural setting together, with plenty of room to spend time your own way.\n\nStart the morning slowly, gather around the table, and settle into an evening without an itinerary. Whether you’re here with family, friends or someone special, the whole place is yours to enjoy.`,
        cover_image: `/images/${cover}-1680.webp`,
        image_alt: `Illustrative exterior of ${s.name}`,
        featured: i < 3 ? 1 : 0,
        published: 1,
        display_order: i,
        weekday_rate: "Ask us for current weekday pricing",
        weekend_rate: "Ask us for current weekend pricing",
        extra_guest_info:
          "Discuss additional guest arrangements with our team.",
        ...demo,
      });
      add("resort_images", {
        id: `${s.id}-img`,
        resort_id: s.id,
        url: `/images/${cover}-1680.webp`,
        alt: `Illustrative ${s.property_type.toLowerCase()} exterior`,
        display_order: 0,
      });
      for (const [j, view] of (cover === "cabin"
        ? ["interior"]
        : ["interior", "exterior"]
      ).entries())
        add("resort_images", {
          id: `${s.id}-${view}`,
          resort_id: s.id,
          url: `/images/${cover}-${view}-1680.webp`,
          alt: `Illustrative ${view === "interior" ? "interior living space" : "poolside view"} at ${s.name}`,
          display_order: j + 1,
        });
      features.forEach((text, j) =>
        add("resort_features", {
          id: `${s.id}-f${j}`,
          resort_id: s.id,
          kind: "highlight",
          text,
          display_order: j,
        }),
      );
      [
        "Please respect quiet hours after 10 PM.",
        "Smoking is permitted only in designated outdoor areas.",
        "Discuss pets and gatherings with our team before your stay.",
      ].forEach((text, j) =>
        add("resort_features", {
          id: `${s.id}-r${j}`,
          resort_id: s.id,
          kind: "rule",
          text,
          display_order: j,
        }),
      );
      stayAmenities.forEach((id) =>
        add("resort_amenities", { resort_id: s.id, amenity_id: id }),
      );
    });
    add("offers", {
      id: "slow-weekends",
      title: "Take the scenic route to the weekend.",
      description:
        "Trade the noise for misty mornings and a private mountain escape. Ask our team about a getaway for your group.",
      image: "/images/cabin-1080.webp",
      badge: "THE HILL ESCAPE",
      promotional_text: "A little mountain time",
      cta_label: "Explore the escape",
      cta_type: "resort",
      active: 1,
      display_order: 0,
      ...demo,
    });
    add("offer_resorts", {
      offer_id: "slow-weekends",
      resort_id: "fern-and-fog",
    });
    add("offers", {
      id: "together-time",
      title: "A whole place. All your favourite people.",
      description:
        "Gather the family for poolside afternoons and long conversations. Let us help you plan a stay together.",
      image: "/images/heritage-1080.webp",
      badge: "BETTER TOGETHER",
      promotional_text: "Your next family getaway",
      cta_label: "Find your family stay",
      cta_type: "resort",
      active: 1,
      display_order: 1,
      ...demo,
    });
    add("offer_resorts", {
      offer_id: "together-time",
      resort_id: "coconut-courtyard",
    });
    add("testimonials", {
      id: "demo-story",
      name: "Anjali S.",
      location: "Kochi",
      rating: 5,
      quote:
        "The kind of place where you put your phone away and forget what day it is. We came for the view and left with the loveliest memories.",
      resort_id: "mountain-mist",
      published: 1,
      display_order: 0,
      ...demo,
    });
  }
  add("site_settings", {
    id: "global",
    site_name: "Vibe Stayz",
    footer_description:
      "Beautiful private stays. Thoughtful escapes. Find a little more of what makes you feel alive.",
    show_demo: env.DEMO_MODE === "true" ? 1 : 0,
    updated_at: now,
  });
  for (const [table, items] of records) {
    const result = await env.supabase
      .from(table)
      .upsert(items, { ignoreDuplicates: true });
    if (result.error) throw result.error;
  }
}
