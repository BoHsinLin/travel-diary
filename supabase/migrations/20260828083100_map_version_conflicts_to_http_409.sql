do $$
declare
  function_signature regprocedure;
begin
  foreach function_signature in array array[
    'public.update_trip_with_version(uuid,integer,jsonb)'::regprocedure,
    'public.update_trip_day_with_version(uuid,integer,jsonb)'::regprocedure,
    'public.update_itinerary_item_with_version(uuid,integer,jsonb)'::regprocedure
  ]
  loop
    execute replace(
      pg_get_functiondef(function_signature),
      'errcode = ''40001''',
      'errcode = ''PT409'''
    );
  end loop;
end;
$$;
