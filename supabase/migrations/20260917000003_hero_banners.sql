begin;

-- Independent editorial content: intentionally no location/resort/offer foreign keys.
create table public.hero_banners (
  id text primary key,
  title text not null check (length(trim(title)) > 0),
  subtitle text not null default '',
  label text not null default '',
  image text not null check (length(trim(image)) > 0),
  cta_label text not null check (length(trim(cta_label)) > 0),
  cta_url text not null check (length(trim(cta_url)) > 0),
  display_order integer not null default 0 check (display_order >= 0),
  active integer not null default 0 check (active in (0, 1)),
  updated_at timestamptz not null default now()
);
alter table public.hero_banners enable row level security;
revoke all on public.hero_banners from anon, authenticated;
grant all on public.hero_banners to service_role;
create index hero_banners_display_order on public.hero_banners (active, display_order, id);

-- Preserve only the existing, explicitly authored hero. Never derive slides from Locations.
insert into public.hero_banners (id, title, subtitle, label, image, cta_label, cta_url, active)
select 'home-hero', title, body, eyebrow, image, cta_label, cta_url, 1
from public.page_content
where page = 'home' and section = 'hero'
  and trim(title) <> '' and trim(image) <> ''
  and trim(cta_label) <> '' and trim(cta_url) <> ''
limit 1;

notify pgrst, 'reload schema';
commit;
