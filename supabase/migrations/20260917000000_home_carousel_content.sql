begin;

-- The homepage carousel built its stay and destination slides from copy baked into the
-- code, so an editor had no way to change them. These sections move that copy into
-- Site content. {name}, {location} and {type} are filled in per slide at render time.
insert into public.page_content
  (id, page, section, eyebrow, title, body, image, cta_label, cta_url, display_order, updated_at, is_demo)
values
  ('home-carousel_stay', 'home', 'carousel_stay',
   '{location} · {type}', '{name}',
   'A beautiful place to slow down, ready when you are.',
   '', 'Explore this stay', '', 1, now()::text, 0),
  ('home-carousel_destination', 'home', 'carousel_destination',
   'A PLACE TO GET AWAY', 'Slow down in {location}.',
   'Find your own corner of Kerala. Beautiful stays, thoughtfully selected.',
   '', 'Discover stays', '', 2, now()::text, 0),
  ('home-carousel_fallback', 'home', 'carousel_fallback',
   'YOUR NEXT KERALA ESCAPE', 'A little closer to nature.',
   'Private villas, cabins and beautiful Kerala escapes.',
   '/images/cabin-1680.webp', 'Explore stays', '/resorts', 3, now()::text, 0)
on conflict (id) do nothing;

commit;
