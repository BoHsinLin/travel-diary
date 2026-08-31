-- Stable semantic category contract shared with Figma and the frontend.
-- NOT VALID avoids rewriting or rejecting existing rows; new writes are enforced.
alter table public.places
  add constraint places_category_code_check
  check (category in (
    'heritage','food','neighborhood','cafe','shopping','nature','museum','activity',
    'hotel','airport','flight','train','subway','bus','walk','taxi','ferry',
    'ticket','reservation','generic'
  )) not valid;

comment on column public.places.category is
  'Stable ItineraryCategory code. UI labels and icon SVGs are resolved by clients; unknown legacy values normalize to generic.';
