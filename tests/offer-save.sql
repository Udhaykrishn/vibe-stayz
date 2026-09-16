-- Local/integration DB verification; every test write is rolled back.
begin;
do $$
declare r public.resorts; saved_title text; price integer; rejected boolean := false;
begin
  select * into r from public.resorts where starting_price > 100 order by id limit 1;
  if r.id is null then raise exception 'Test needs one existing priced stay'; end if;
  perform public.save_offer('qa-transaction-test', jsonb_build_object('title','QA transaction','updated_at',now()::text,'active',1), jsonb_build_array(jsonb_build_object('resort_id',r.id,'offer_price',r.starting_price-100)));
  select offer_price into price from public.offer_resorts where offer_id='qa-transaction-test';
  if price <> r.starting_price-100 then raise exception 'Price save failed'; end if;
  begin
    perform public.save_offer('qa-transaction-test',jsonb_build_object('title','Should roll back'),jsonb_build_array(jsonb_build_object('resort_id',r.id,'offer_price',r.starting_price+100)));
  exception when others then rejected:=true;
  end;
  if not rejected then raise exception 'Invalid price accepted'; end if;
  select title into saved_title from public.offers where id='qa-transaction-test';
  if saved_title <> 'QA transaction' then raise exception 'Atomic rollback failed'; end if;
  select starting_price into price from public.resorts where id=r.id;
  if price <> r.starting_price then raise exception 'Base price was changed'; end if;
  rejected:=false;
  begin
    perform public.save_offer('qa-transaction-test',jsonb_build_object('start_date','2026-09-27','end_date','2026-09-20'),null);
  exception when others then rejected:=true;
  end;
  if not rejected then raise exception 'Reversed dates accepted'; end if;
  if has_function_privilege('anon','public.save_offer(text,jsonb,jsonb)','execute') or has_function_privilege('authenticated','public.save_offer(text,jsonb,jsonb)','execute') then raise exception 'Public campaign write access'; end if;
  raise notice 'PASS: save, invalid-price rollback, base-price preservation, dates, RPC permissions';
end $$;
rollback;
