begin;

-- Static sample records are no longer part of the product. Remove them before
-- removing the legacy flags that could make them visible again.
delete from public.testimonials where is_demo = 1;
delete from public.nearby_attractions where is_demo = 1;
delete from public.offers where is_demo = 1;
delete from public.resorts where is_demo = 1;
delete from public.locations where is_demo = 1;
delete from public.amenities where is_demo = 1;
delete from public.navigation where is_demo = 1;
delete from public.page_content where is_demo = 1;

-- A blank installation still needs the singleton settings record so an editor
-- can sign in and enter the real site content.
insert into public.site_settings (id, updated_at)
values ('global', now()::text)
on conflict (id) do nothing;

-- Keep the atomic CMS writers aligned with the production-only schema.
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
    display_order=item.display_order, updated_at=item.updated_at where id=p_id;
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

create or replace function public.save_resort(
  p_id text, p_fields jsonb, p_gallery jsonb default null,
  p_amenities jsonb default null, p_highlights jsonb default null, p_rules jsonb default null
) returns void language plpgsql set search_path = public as $$
declare item public.resorts; existing jsonb;
begin
  select to_jsonb(r) into existing from public.resorts r where id=p_id for update;
  if existing is null then
    insert into public.resorts (id,name,slug,location_id,updated_at)
    values (p_id,p_fields->>'name',p_fields->>'slug',p_fields->>'location_id',p_fields->>'updated_at');
    select to_jsonb(r) into existing from public.resorts r where id=p_id;
  end if;
  item := jsonb_populate_record(null::public.resorts,existing || p_fields || jsonb_build_object('id',p_id));
  update public.resorts set
    name=item.name, slug=item.slug, subtitle=item.subtitle,
    short_description=item.short_description, description=item.description,
    location_id=item.location_id, address=item.address,
    show_address=item.show_address, map_url=item.map_url,
    property_type=item.property_type, starting_price=item.starting_price,
    price_label=item.price_label, weekday_rate=item.weekday_rate,
    weekend_rate=item.weekend_rate, group_package=item.group_package,
    extra_guest_info=item.extra_guest_info, pricing_disclaimer=item.pricing_disclaimer,
    max_guests=item.max_guests, bedrooms=item.bedrooms, bathrooms=item.bathrooms,
    cover_image=item.cover_image, image_alt=item.image_alt,
    check_in=item.check_in, check_out=item.check_out,
    whatsapp_override=item.whatsapp_override, seo_title=item.seo_title,
    seo_description=item.seo_description, featured=item.featured,
    published=item.published, archived=item.archived,
    display_order=item.display_order, updated_at=item.updated_at,
    latitude=item.latitude, longitude=item.longitude, map_embed_url=item.map_embed_url
  where id=p_id;
  if p_gallery is not null then
    delete from public.resort_images where resort_id=p_id;
    insert into public.resort_images(id,resort_id,url,alt,display_order)
      select gen_random_uuid()::text,p_id,value->>'url',value->>'alt',(ordinality-1)::integer
      from jsonb_array_elements(p_gallery) with ordinality;
  end if;
  if p_amenities is not null then
    delete from public.resort_amenities where resort_id=p_id;
    insert into public.resort_amenities(resort_id,amenity_id)
      select p_id,value from jsonb_array_elements_text(p_amenities);
  end if;
  if p_highlights is not null then
    delete from public.resort_features where resort_id=p_id and kind='highlight';
    insert into public.resort_features(id,resort_id,kind,text,display_order)
      select gen_random_uuid()::text,p_id,'highlight',value,(ordinality-1)::integer
      from jsonb_array_elements_text(p_highlights) with ordinality;
  end if;
  if p_rules is not null then
    delete from public.resort_features where resort_id=p_id and kind='rule';
    insert into public.resort_features(id,resort_id,kind,text,display_order)
      select gen_random_uuid()::text,p_id,'rule',value,(ordinality-1)::integer
      from jsonb_array_elements_text(p_rules) with ordinality;
  end if;
end; $$;

alter table public.amenities drop column is_demo;
alter table public.locations drop column is_demo;
alter table public.navigation drop column is_demo;
alter table public.nearby_attractions drop column is_demo;
alter table public.offers drop column is_demo;
alter table public.page_content drop column is_demo;
alter table public.resorts drop column is_demo;
alter table public.testimonials drop column is_demo;
alter table public.site_settings drop column show_demo;

commit;
notify pgrst, 'reload schema';
