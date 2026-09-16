-- Local test database only. All fixture mutations roll back.
begin;
do $$
declare loc text; before_row jsonb;
begin
  select id into loc from locations limit 1;
  if loc is null then raise exception 'Seed a local destination first'; end if;
  perform save_resort('qa-atomic-regression',jsonb_build_object('name','QA atomic resort','slug','qa-atomic-regression','location_id',loc,'updated_at',now()::text,'starting_price',15000),
    '[{"url":"/images/cabin-640.webp","alt":"Original"}]'::jsonb,'[]'::jsonb,'["Original highlight"]'::jsonb,'["Original rule"]'::jsonb);
  select to_jsonb(r) into before_row from resorts r where id='qa-atomic-regression';
  begin
    perform save_resort('qa-atomic-regression','{"name":"Should roll back","starting_price":999}'::jsonb,
      '[{"url":"/images/hero-640.webp","alt":"Changed"}]'::jsonb,'["qa-nonexistent-amenity"]'::jsonb);
    raise exception 'Expected foreign key violation';
  exception when foreign_key_violation then null;
  end;
  if (select to_jsonb(r) from resorts r where id='qa-atomic-regression') <> before_row then raise exception 'Property write was not rolled back'; end if;
  if (select alt from resort_images where resort_id='qa-atomic-regression') <> 'Original' then raise exception 'Gallery was not rolled back'; end if;
  perform save_resort('qa-atomic-regression','{"starting_price":16000}'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb,'[]'::jsonb);
  if exists(select 1 from resort_images where resort_id='qa-atomic-regression') or exists(select 1 from resort_features where resort_id='qa-atomic-regression') then raise exception 'Removal did not persist'; end if;
  if (select starting_price from resorts where id='qa-atomic-regression') <> 16000 then raise exception 'Price update failed'; end if;
  if has_function_privilege('anon','public.save_resort(text,jsonb,jsonb,jsonb,jsonb,jsonb)','execute') or has_function_privilege('authenticated','public.save_resort(text,jsonb,jsonb,jsonb,jsonb,jsonb)','execute') then raise exception 'RPC exposed to public clients'; end if;
end $$;
rollback;
