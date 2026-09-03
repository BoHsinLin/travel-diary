drop policy "authenticated can explore published events" on public.events;
drop policy "reviewers can read event drafts" on public.events;
create policy "authenticated can read allowed events" on public.events
for select to authenticated using (
  (publication_status = 'published' and lifecycle_status = 'scheduled' and ends_at >= now())
  or (select private.has_platform_role('data_reviewer'))
);

drop policy "authenticated can read published event provenance" on public.event_provenance;
drop policy "reviewers can read all event provenance" on public.event_provenance;
create policy "authenticated can read allowed event provenance" on public.event_provenance
for select to authenticated using (
  (select private.has_platform_role('data_reviewer'))
  or exists (select 1 from public.events e where e.id = event_id)
);

drop policy "authenticated can explore published canonical places" on public.canonical_places;
drop policy "reviewers can read canonical place drafts" on public.canonical_places;
create policy "authenticated can read allowed canonical places" on public.canonical_places
for select to authenticated using (
  publication_status = 'published'
  or (select private.has_platform_role('data_reviewer'))
);

drop policy "authenticated can read published place provenance" on public.place_provenance;
drop policy "reviewers can read all place provenance" on public.place_provenance;
create policy "authenticated can read allowed place provenance" on public.place_provenance
for select to authenticated using (
  (select private.has_platform_role('data_reviewer'))
  or exists (select 1 from public.canonical_places p where p.id = place_id)
);
