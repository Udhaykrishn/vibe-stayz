begin;
alter table public.resorts add column if not exists created_at timestamptz not null default now();
alter table public.resorts add column if not exists latitude double precision check (latitude between -90 and 90);
alter table public.resorts add column if not exists longitude double precision check (longitude between -180 and 180);
alter table public.resorts add column if not exists map_embed_url text not null default '';
alter table public.offers add column if not exists location_id text references public.locations(id) on delete set null;
alter table public.offers add column if not exists mobile_image text not null default '';
alter table public.offers add column if not exists featured_home integer not null default 0;
alter table public.offers add column if not exists cta_url text not null default '';
alter table public.offer_resorts add column if not exists offer_price integer check (offer_price > 0);
create table if not exists public.faqs (
  id text primary key,
  question text not null,
  answer text not null,
  published integer not null default 1,
  display_order integer not null default 0,
  updated_at text not null
);
alter table public.faqs enable row level security;
grant usage on schema public to service_role;
grant select, insert, update, delete on public.faqs, public.offers, public.offer_resorts, public.resorts to service_role;

-- Save a campaign and its per-stay prices together. A failure rolls back everything.
create or replace function public.save_offer(p_id text, p_fields jsonb, p_links jsonb default null)
returns void language plpgsql set search_path = public as $$
declare item public.offers; existing jsonb;
begin
  select to_jsonb(o) into existing from public.offers o where id = p_id for update;
  if existing is null then
    insert into public.offers (id, title, updated_at) values (p_id, p_fields->>'title', p_fields->>'updated_at');
    select to_jsonb(o) into existing from public.offers o where id = p_id;
  end if;
  item := jsonb_populate_record(null::public.offers, existing || p_fields || jsonb_build_object('id', p_id));
  if item.start_date <> '' and item.end_date <> '' and item.end_date < item.start_date then
    raise exception 'Offer ends before it starts';
  end if;
  update public.offers set title=item.title, description=item.description, image=item.image,
    mobile_image=item.mobile_image, badge=item.badge, promotional_text=item.promotional_text,
    cta_label=item.cta_label, cta_type=item.cta_type, cta_url=item.cta_url, location_id=item.location_id,
    start_date=item.start_date, end_date=item.end_date, active=item.active, featured_home=item.featured_home,
    display_order=item.display_order, is_demo=item.is_demo, updated_at=item.updated_at where id=p_id;
  if p_links is not null then
    if exists (
      select 1 from jsonb_to_recordset(p_links) as l(resort_id text, offer_price integer)
      left join public.resorts r on r.id=l.resort_id
      where r.id is null or (item.location_id is not null and r.location_id <> item.location_id)
        or (l.offer_price is not null and (l.offer_price <= 0 or r.starting_price is null or l.offer_price >= r.starting_price))
    ) then raise exception 'Invalid stay or promotional price'; end if;
    delete from public.offer_resorts where offer_id=p_id;
    insert into public.offer_resorts (offer_id, resort_id, offer_price)
      select p_id,l.resort_id,l.offer_price from jsonb_to_recordset(p_links) as l(resort_id text,offer_price integer);
  end if;
end; $$;
revoke all on function public.save_offer(text,jsonb,jsonb) from public, anon, authenticated;
grant execute on function public.save_offer(text,jsonb,jsonb) to service_role;

insert into public.faqs (id,question,answer,display_order,updated_at) values
('booking','How do I book a stay?','Find a stay you love and choose Enquire on WhatsApp. Our team will help you confirm availability, current pricing and the next steps for your booking.',0,now()::text),
('pricing','Are the prices shown final?','Prices are starting rates. They can vary with dates, group size and your requirements. Please confirm the full price and any offer conditions with our team on WhatsApp.',1,now()::text),
('enquiry','Can I ask questions before booking?','Of course. Message us about the property, amenities, travel plans or anything else you would like to know before deciding.',2,now()::text),
('help','Can you help me choose a stay?','Tell us your preferred destination, group size and what matters to you, whether that is a private pool, mountain views or room for the family. We will help you explore suitable stays.',3,now()::text),
('destinations','Where can I find your stays?','Browse our destination collection to see where we currently have stays. If you have somewhere else in mind, ask our team for guidance.',4,now()::text),
('groups','Can I enquire for a family or group?','Yes. Share your group size and any special requirements on WhatsApp. We will help you find a suitable property and confirm capacity and pricing.',5,now()::text)
on conflict (id) do nothing;
update public.navigation set in_header=0 where url in ('/locations','/offers');
update public.navigation set label='Get Your Stay' where url='/resorts';
commit;
notify pgrst, 'reload schema';
