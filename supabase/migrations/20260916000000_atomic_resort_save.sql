begin;
-- A failed gallery, amenity or content write must roll back the property too.
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
    name=item.name,
    slug=item.slug,
    subtitle=item.subtitle,
    short_description=item.short_description,
    description=item.description,
    location_id=item.location_id,
    address=item.address,
    show_address=item.show_address,
    map_url=item.map_url,
    property_type=item.property_type,
    starting_price=item.starting_price,
    price_label=item.price_label,
    weekday_rate=item.weekday_rate,
    weekend_rate=item.weekend_rate,
    group_package=item.group_package,
    extra_guest_info=item.extra_guest_info,
    pricing_disclaimer=item.pricing_disclaimer,
    max_guests=item.max_guests,
    bedrooms=item.bedrooms,
    bathrooms=item.bathrooms,
    cover_image=item.cover_image,
    image_alt=item.image_alt,
    check_in=item.check_in,
    check_out=item.check_out,
    whatsapp_override=item.whatsapp_override,
    seo_title=item.seo_title,
    seo_description=item.seo_description,
    featured=item.featured,
    published=item.published,
    archived=item.archived,
    display_order=item.display_order,
    updated_at=item.updated_at,
    is_demo=item.is_demo,
    latitude=item.latitude,
    longitude=item.longitude,
    map_embed_url=item.map_embed_url
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
revoke all on function public.save_resort(text,jsonb,jsonb,jsonb,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.save_resort(text,jsonb,jsonb,jsonb,jsonb,jsonb) to service_role;
commit;
notify pgrst, 'reload schema';
