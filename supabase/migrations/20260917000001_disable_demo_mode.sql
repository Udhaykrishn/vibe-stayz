begin;

-- Production must never expose the sample/demo collection.
update public.site_settings
set show_demo = 0,
    updated_at = now()::text
where id = 'global';

commit;
