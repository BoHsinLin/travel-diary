drop policy "reviewers can update review queue" on public.data_review_queue;
revoke update on table public.data_review_queue from authenticated;

create or replace function private.invalidate_data_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    to_jsonb(new) - array['publication_status', 'published_at', 'version', 'created_at', 'updated_at', 'last_verified_at']
    is distinct from
    to_jsonb(old) - array['publication_status', 'published_at', 'version', 'created_at', 'updated_at', 'last_verified_at']
  ) then
    if tg_table_name = 'events' then
      update public.data_review_queue
      set status = 'pending', reviewed_by = null, review_notes = null, reviewed_at = null
      where event_id = new.id and status <> 'pending';
    elsif tg_table_name = 'canonical_places' then
      update public.data_review_queue
      set status = 'pending', reviewed_by = null, review_notes = null, reviewed_at = null
      where place_id = new.id and status <> 'pending';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.invalidate_data_approval() from public, anon, authenticated;

create trigger invalidate_event_approval_after_content_update
after update on public.events
for each row execute function private.invalidate_data_approval();

create trigger invalidate_place_approval_after_content_update
after update on public.canonical_places
for each row execute function private.invalidate_data_approval();

comment on function private.invalidate_data_approval()
is 'Invalidates prior review approval whenever reviewer-editable Event or canonical Place content changes. Status-only review transitions do not invalidate themselves.';
