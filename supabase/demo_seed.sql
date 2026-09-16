begin;

insert into public.locations
  (id, name, slug, subtitle, description, cover_image, image_alt, icon, featured, published, display_order, updated_at, is_demo)
values
  ('vagamon', 'Vagamon', 'vagamon', 'The art of doing nothing.', 'Rolling meadows, cool air and open horizons. A hill escape made for unhurried mornings.', '/images/vagamon-1080.webp', 'Scenery in Vagamon, Kerala', 'mountain', 1, 1, 0, current_timestamp::text, 1),
  ('munnar', 'Munnar', 'munnar', 'Wake up above the clouds.', 'Tea-covered hills and misty mornings. Find a quiet corner in one of Kerala’s most loved hill destinations.', '/images/munnar-1080.webp', 'Scenery in Munnar, Kerala', 'leaf', 1, 1, 1, current_timestamp::text, 1),
  ('wayanad', 'Wayanad', 'wayanad', 'A little closer to the wild.', 'Forest trails, green valleys and the rhythm of nature. Make room for an escape into the hills.', '/images/wayanad-1080.webp', 'Scenery in Wayanad, Kerala', 'trees', 1, 1, 2, current_timestamp::text, 1),
  ('kochi', 'Kochi', 'kochi', 'Slow days by the water.', 'Coastal charm, familiar flavours and quiet waterfront corners. Find your own pace by the coast.', '/images/kochi-1080.webp', 'Scenery in Kochi, Kerala', 'waves', 1, 1, 3, current_timestamp::text, 1)
on conflict (id) do nothing;

insert into public.amenities
  (id, name, icon, category, active, display_order, updated_at, is_demo)
values
  ('pool', 'Private pool', 'waves', 'Recreation', 1, 0, current_timestamp::text, 1),
  ('wifi', 'Wi-Fi', 'wifi', 'Essentials', 1, 1, current_timestamp::text, 1),
  ('ac', 'Air conditioning', 'snowflake', 'Essentials', 1, 2, current_timestamp::text, 1),
  ('kitchen', 'Kitchen', 'utensils', 'Food', 1, 3, current_timestamp::text, 1),
  ('parking', 'Free parking', 'car', 'Essentials', 1, 4, current_timestamp::text, 1),
  ('campfire', 'Campfire', 'flame', 'Outdoor', 1, 5, current_timestamp::text, 1),
  ('mountain', 'Mountain view', 'mountain', 'Outdoor', 1, 6, current_timestamp::text, 1),
  ('breakfast', 'Breakfast', 'coffee', 'Food', 1, 7, current_timestamp::text, 1),
  ('pets', 'Pet friendly', 'paw', 'Essentials', 1, 8, current_timestamp::text, 1),
  ('garden', 'Private garden', 'leaf', 'Outdoor', 1, 9, current_timestamp::text, 1)
on conflict (id) do nothing;

insert into public.resorts
  (id, name, slug, subtitle, short_description, description, location_id, property_type, starting_price, max_guests, bedrooms, bathrooms, cover_image, image_alt, featured, published, display_order, weekday_rate, weekend_rate, extra_guest_info, updated_at, is_demo)
values
  ('mountain-mist', 'Mountain Mist Villa', 'mountain-mist', 'Your own little world above the hills', 'Your own little world above the hills', E'Leave the everyday behind at Mountain Mist Villa. This thoughtfully imagined private villa brings generous living spaces and a beautiful natural setting together, with plenty of room to spend time your own way.\n\nStart the morning slowly, gather around the table, and settle into an evening without an itinerary. Whether you’re here with family, friends or someone special, the whole place is yours to enjoy.', 'vagamon', 'Private villa', 15000, 10, 3, 3, '/images/hero-1680.webp', 'Illustrative exterior of Mountain Mist Villa', 1, 1, 0, 'Ask us for current weekday pricing', 'Ask us for current weekend pricing', 'Discuss additional guest arrangements with our team.', current_timestamp::text, 1),
  ('fern-and-fog', 'Fern & Fog Cabin', 'fern-and-fog', 'A quiet hideaway among the tea hills', 'A quiet hideaway among the tea hills', E'Leave the everyday behind at Fern & Fog Cabin. This thoughtfully imagined mountain cabin brings generous living spaces and a beautiful natural setting together, with plenty of room to spend time your own way.\n\nStart the morning slowly, gather around the table, and settle into an evening without an itinerary. Whether you’re here with family, friends or someone special, the whole place is yours to enjoy.', 'munnar', 'Mountain cabin', 8500, 4, 2, 2, '/images/cabin-1680.webp', 'Illustrative exterior of Fern & Fog Cabin', 1, 1, 1, 'Ask us for current weekday pricing', 'Ask us for current weekend pricing', 'Discuss additional guest arrangements with our team.', current_timestamp::text, 1),
  ('coconut-courtyard', 'The Coconut Courtyard', 'coconut-courtyard', 'Old-world warmth, a world of your own', 'Old-world warmth, a world of your own', E'Leave the everyday behind at The Coconut Courtyard. This thoughtfully imagined heritage stay brings generous living spaces and a beautiful natural setting together, with plenty of room to spend time your own way.\n\nStart the morning slowly, gather around the table, and settle into an evening without an itinerary. Whether you’re here with family, friends or someone special, the whole place is yours to enjoy.', 'kochi', 'Heritage stay', 18000, 12, 4, 4, '/images/heritage-1680.webp', 'Illustrative exterior of The Coconut Courtyard', 1, 1, 2, 'Ask us for current weekday pricing', 'Ask us for current weekend pricing', 'Discuss additional guest arrangements with our team.', current_timestamp::text, 1),
  ('wildwood-retreat', 'Wildwood Retreat', 'wildwood-retreat', 'Where the forest sets the pace', 'Where the forest sets the pace', E'Leave the everyday behind at Wildwood Retreat. This thoughtfully imagined mountain cabin brings generous living spaces and a beautiful natural setting together, with plenty of room to spend time your own way.\n\nStart the morning slowly, gather around the table, and settle into an evening without an itinerary. Whether you’re here with family, friends or someone special, the whole place is yours to enjoy.', 'wayanad', 'Mountain cabin', 9500, 6, 2, 2, '/images/cabin-1680.webp', 'Illustrative exterior of Wildwood Retreat', 0, 1, 3, 'Ask us for current weekday pricing', 'Ask us for current weekend pricing', 'Discuss additional guest arrangements with our team.', current_timestamp::text, 1),
  ('palm-house', 'The Palm House', 'palm-house', 'Sun-dappled afternoons, together', 'Sun-dappled afternoons, together', E'Leave the everyday behind at The Palm House. This thoughtfully imagined private villa brings generous living spaces and a beautiful natural setting together, with plenty of room to spend time your own way.\n\nStart the morning slowly, gather around the table, and settle into an evening without an itinerary. Whether you’re here with family, friends or someone special, the whole place is yours to enjoy.', 'kochi', 'Private villa', 22000, 12, 4, 4, '/images/hero-1680.webp', 'Illustrative exterior of The Palm House', 0, 1, 4, 'Ask us for current weekday pricing', 'Ask us for current weekend pricing', 'Discuss additional guest arrangements with our team.', current_timestamp::text, 1),
  ('meadow-house', 'Meadow House', 'meadow-house', 'A gentler kind of mountain escape', 'A gentler kind of mountain escape', E'Leave the everyday behind at Meadow House. This thoughtfully imagined heritage stay brings generous living spaces and a beautiful natural setting together, with plenty of room to spend time your own way.\n\nStart the morning slowly, gather around the table, and settle into an evening without an itinerary. Whether you’re here with family, friends or someone special, the whole place is yours to enjoy.', 'vagamon', 'Heritage stay', 12000, 8, 3, 3, '/images/heritage-1680.webp', 'Illustrative exterior of Meadow House', 0, 1, 5, 'Ask us for current weekday pricing', 'Ask us for current weekend pricing', 'Discuss additional guest arrangements with our team.', current_timestamp::text, 1)
on conflict (id) do nothing;

insert into public.resort_images (id, resort_id, url, alt, display_order)
values
  ('mountain-mist-img', 'mountain-mist', '/images/hero-1680.webp', 'Illustrative private villa exterior', 0),
  ('mountain-mist-interior', 'mountain-mist', '/images/hero-interior-1680.webp', 'Illustrative interior living space at Mountain Mist Villa', 1),
  ('mountain-mist-exterior', 'mountain-mist', '/images/hero-exterior-1680.webp', 'Illustrative poolside view at Mountain Mist Villa', 2),
  ('fern-and-fog-img', 'fern-and-fog', '/images/cabin-1680.webp', 'Illustrative mountain cabin exterior', 0),
  ('fern-and-fog-interior', 'fern-and-fog', '/images/cabin-interior-1680.webp', 'Illustrative interior living space at Fern & Fog Cabin', 1),
  ('coconut-courtyard-img', 'coconut-courtyard', '/images/heritage-1680.webp', 'Illustrative heritage stay exterior', 0),
  ('coconut-courtyard-interior', 'coconut-courtyard', '/images/heritage-interior-1680.webp', 'Illustrative interior living space at The Coconut Courtyard', 1),
  ('coconut-courtyard-exterior', 'coconut-courtyard', '/images/heritage-exterior-1680.webp', 'Illustrative poolside view at The Coconut Courtyard', 2),
  ('wildwood-retreat-img', 'wildwood-retreat', '/images/cabin-1680.webp', 'Illustrative mountain cabin exterior', 0),
  ('wildwood-retreat-interior', 'wildwood-retreat', '/images/cabin-interior-1680.webp', 'Illustrative interior living space at Wildwood Retreat', 1),
  ('palm-house-img', 'palm-house', '/images/hero-1680.webp', 'Illustrative private villa exterior', 0),
  ('palm-house-interior', 'palm-house', '/images/hero-interior-1680.webp', 'Illustrative interior living space at The Palm House', 1),
  ('palm-house-exterior', 'palm-house', '/images/hero-exterior-1680.webp', 'Illustrative poolside view at The Palm House', 2),
  ('meadow-house-img', 'meadow-house', '/images/heritage-1680.webp', 'Illustrative heritage stay exterior', 0),
  ('meadow-house-interior', 'meadow-house', '/images/heritage-interior-1680.webp', 'Illustrative interior living space at Meadow House', 1),
  ('meadow-house-exterior', 'meadow-house', '/images/heritage-exterior-1680.webp', 'Illustrative poolside view at Meadow House', 2)
on conflict (id) do nothing;

insert into public.resort_features (id, resort_id, kind, text, display_order)
values
  ('mountain-mist-f0', 'mountain-mist', 'highlight', 'Private infinity pool', 0),
  ('mountain-mist-f1', 'mountain-mist', 'highlight', 'Mountain views', 1),
  ('mountain-mist-f2', 'mountain-mist', 'highlight', 'Entire property', 2),
  ('fern-and-fog-f0', 'fern-and-fog', 'highlight', 'Tea garden setting', 0),
  ('fern-and-fog-f1', 'fern-and-fog', 'highlight', 'Forest-facing deck', 1),
  ('fern-and-fog-f2', 'fern-and-fog', 'highlight', 'Made for slow mornings', 2),
  ('coconut-courtyard-f0', 'coconut-courtyard', 'highlight', 'Private courtyard', 0),
  ('coconut-courtyard-f1', 'coconut-courtyard', 'highlight', 'Private pool', 1),
  ('coconut-courtyard-f2', 'coconut-courtyard', 'highlight', 'Traditional architecture', 2),
  ('wildwood-retreat-f0', 'wildwood-retreat', 'highlight', 'Forest surrounds', 0),
  ('wildwood-retreat-f1', 'wildwood-retreat', 'highlight', 'Room for the whole family', 1),
  ('wildwood-retreat-f2', 'wildwood-retreat', 'highlight', 'Outdoor firepit', 2),
  ('palm-house-f0', 'palm-house', 'highlight', 'Private pool', 0),
  ('palm-house-f1', 'palm-house', 'highlight', 'Tropical garden', 1),
  ('palm-house-f2', 'palm-house', 'highlight', 'Spacious living areas', 2),
  ('meadow-house-f0', 'meadow-house', 'highlight', 'Private garden', 0),
  ('meadow-house-f1', 'meadow-house', 'highlight', 'Family-friendly spaces', 1),
  ('meadow-house-f2', 'meadow-house', 'highlight', 'A peaceful setting', 2)
on conflict (id) do nothing;

insert into public.resort_features (id, resort_id, kind, text, display_order)
select r.id || '-r' || rules.n, r.id, 'rule', rules.text, rules.n
from (values
  ('mountain-mist'), ('fern-and-fog'), ('coconut-courtyard'),
  ('wildwood-retreat'), ('palm-house'), ('meadow-house')
) as r(id)
cross join (values
  (0, 'Please respect quiet hours after 10 PM.'),
  (1, 'Smoking is permitted only in designated outdoor areas.'),
  (2, 'Discuss pets and gatherings with our team before your stay.')
) as rules(n, text)
on conflict (id) do nothing;

insert into public.resort_amenities (resort_id, amenity_id)
values
  ('mountain-mist', 'pool'), ('mountain-mist', 'wifi'), ('mountain-mist', 'ac'), ('mountain-mist', 'kitchen'), ('mountain-mist', 'parking'), ('mountain-mist', 'mountain'),
  ('fern-and-fog', 'wifi'), ('fern-and-fog', 'parking'), ('fern-and-fog', 'campfire'), ('fern-and-fog', 'mountain'), ('fern-and-fog', 'breakfast'),
  ('coconut-courtyard', 'pool'), ('coconut-courtyard', 'wifi'), ('coconut-courtyard', 'ac'), ('coconut-courtyard', 'kitchen'), ('coconut-courtyard', 'parking'), ('coconut-courtyard', 'garden'),
  ('wildwood-retreat', 'wifi'), ('wildwood-retreat', 'campfire'), ('wildwood-retreat', 'parking'), ('wildwood-retreat', 'pets'), ('wildwood-retreat', 'garden'),
  ('palm-house', 'pool'), ('palm-house', 'wifi'), ('palm-house', 'ac'), ('palm-house', 'kitchen'), ('palm-house', 'garden'),
  ('meadow-house', 'wifi'), ('meadow-house', 'parking'), ('meadow-house', 'breakfast'), ('meadow-house', 'garden'), ('meadow-house', 'mountain')
on conflict do nothing;

insert into public.offers
  (id, title, description, image, badge, promotional_text, cta_label, cta_type, active, display_order, updated_at, is_demo)
values
  ('slow-weekends', 'Take the scenic route to the weekend.', 'Trade the noise for misty mornings and a private mountain escape. Ask our team about a getaway for your group.', '/images/cabin-1080.webp', 'THE HILL ESCAPE', 'A little mountain time', 'Explore the escape', 'resort', 1, 0, current_timestamp::text, 1),
  ('together-time', 'A whole place. All your favourite people.', 'Gather the family for poolside afternoons and long conversations. Let us help you plan a stay together.', '/images/heritage-1080.webp', 'BETTER TOGETHER', 'Your next family getaway', 'Find your family stay', 'resort', 1, 1, current_timestamp::text, 1)
on conflict (id) do nothing;

insert into public.offer_resorts (offer_id, resort_id)
values
  ('slow-weekends', 'fern-and-fog'),
  ('together-time', 'coconut-courtyard')
on conflict do nothing;

update public.site_settings
set show_demo = 1,
    updated_at = current_timestamp::text
where id = 'global';

commit;

notify pgrst, 'reload schema';
