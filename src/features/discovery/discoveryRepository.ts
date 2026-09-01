import type { Database } from '../../../supabase/types/database.types';
import { supabase } from '../../lib/supabase';

type EventRow = Database['public']['Tables']['events']['Row'];
type PlaceRow = Database['public']['Tables']['canonical_places']['Row'];
type SourceRow = Database['public']['Tables']['data_sources']['Row'];
type Trust = Database['public']['Enums']['data_trust_level'] | 'stale';

export type DiscoveryKind = 'event' | 'place';
export type SourceAttribution = { name: string; url: string; observedAt: string } | null;
export type DiscoveryItem = {
  id: string; kind: DiscoveryKind; title: string; koreanName: string; region: string; category: string;
  trust: Trust; updatedAt: string; lastVerifiedAt: string | null; source: SourceAttribution;
  startsAt?: string; endsAt?: string; venue?: string | null; address?: string | null;
  description?: string | null; disabledReason?: string;
};
export type DiscoveryFilters = { kind: 'all' | DiscoveryKind; query: string; region: string; verifiedOnly: boolean; startDate?: string; endDate?: string; category?: string };
export type DiscoveryCursor = { events?: { startsAt: string; id: string }; places?: { updatedAt: string; id: string } };
export type DiscoveryPage = { items: DiscoveryItem[]; next: DiscoveryCursor | null };
export const initialDiscoveryFilters: DiscoveryFilters = { kind: 'all', query: '', region: 'SEOUL', verifiedOnly: false };

export const discoveryRegions = [{ code: 'SEOUL', label: '首爾' }, { code: 'BUSAN', label: '釜山' }] as const;
export function normalizeDiscoveryFilters(filters: DiscoveryFilters): DiscoveryFilters {
  return { ...filters, region: filters.region.trim().toUpperCase(), query: filters.query.trim() };
}

const title = (row: Pick<EventRow, 'title_zh_tw' | 'title_ko' | 'title_en'>) => row.title_zh_tw || row.title_ko || row.title_en || '未命名活動';
const placeTitle = (row: Pick<PlaceRow, 'name_zh_tw' | 'name_ko' | 'name_en'>) => row.name_zh_tw || row.name_ko || row.name_en || '未命名景點';
const stale = (lastVerifiedAt: string | null, trust: Database['public']['Enums']['data_trust_level']): Trust => {
  if (lastVerifiedAt && Date.now() - new Date(lastVerifiedAt).getTime() > 1000 * 60 * 60 * 24 * 30) return 'stale';
  return trust;
};

async function sourceFor(kind: DiscoveryKind, entityId: string): Promise<SourceAttribution> {
  if (!supabase) return null;
  const sourceQuery = kind === 'event'
    ? supabase.from('event_provenance').select('source_id, source_url, observed_at, is_primary').eq('event_id', entityId)
    : supabase.from('place_provenance').select('source_id, source_url, observed_at, is_primary').eq('place_id', entityId);
  const { data: provenance } = await sourceQuery.order('is_primary', { ascending: false }).limit(1).maybeSingle();
  if (!provenance) return null;
  const { data: source } = await supabase.from('data_sources').select('name').eq('id', provenance.source_id).maybeSingle();
  return source ? { name: (source as Pick<SourceRow, 'name'>).name, url: provenance.source_url, observedAt: provenance.observed_at } : null;
}

async function mapEvent(row: EventRow): Promise<DiscoveryItem> {
  const source = await sourceFor('event', row.id);
  return { id: row.id, kind: 'event', title: title(row), koreanName: row.title_ko, region: row.region_code, category: row.tags[0] || '活動', trust: stale(row.last_verified_at, row.trust_level), updatedAt: row.updated_at, lastVerifiedAt: row.last_verified_at, source, startsAt: row.starts_at, endsAt: row.ends_at, venue: row.venue_name, address: row.address, description: row.summary_zh_tw, disabledReason: row.lifecycle_status !== 'scheduled' ? '此活動目前無法加入行程。' : undefined };
}

async function mapPlace(row: PlaceRow): Promise<DiscoveryItem> {
  const source = await sourceFor('place', row.id);
  return { id: row.id, kind: 'place', title: placeTitle(row), koreanName: row.name_ko, region: row.region_code, category: row.category, trust: stale(row.last_verified_at, row.trust_level), updatedAt: row.updated_at, lastVerifiedAt: row.last_verified_at, source, address: row.address_zh_tw || row.address_ko || row.address_en, description: row.description_zh_tw };
}

export async function listDiscovery(filters: DiscoveryFilters, limit = 24, cursor: DiscoveryCursor = {}): Promise<DiscoveryPage> {
  if (!supabase) return { items: [], next: null };
  const normalized = normalizeDiscoveryFilters(filters); const query = normalized.query;
  let eventQuery = supabase.from('events').select('*').eq('publication_status', 'published').eq('lifecycle_status', 'scheduled').gte('ends_at', new Date().toISOString()).eq('region_code', normalized.region).order('starts_at').order('id').limit(limit);
  let placeQuery = supabase.from('canonical_places').select('*').eq('publication_status', 'published').eq('region_code', normalized.region).order('updated_at', { ascending: false }).order('id').limit(limit);
  if (normalized.startDate) eventQuery = eventQuery.gte('starts_at', normalized.startDate);
  if (normalized.endDate) eventQuery = eventQuery.lte('starts_at', `${normalized.endDate}T23:59:59.999Z`);
  if (normalized.category) { eventQuery = eventQuery.contains('tags', [normalized.category]); placeQuery = placeQuery.eq('category', normalized.category); }
  if (query) { const safe = query.replace(/[%_,()]/g, ''); eventQuery = eventQuery.or(`title_zh_tw.ilike.%${safe}%,title_ko.ilike.%${safe}%,title_en.ilike.%${safe}%`); placeQuery = placeQuery.or(`name_zh_tw.ilike.%${safe}%,name_ko.ilike.%${safe}%,name_en.ilike.%${safe}%`); }
  if (cursor.events) eventQuery = eventQuery.or(`starts_at.gt.${cursor.events.startsAt},and(starts_at.eq.${cursor.events.startsAt},id.gt.${cursor.events.id})`);
  if (cursor.places) placeQuery = placeQuery.or(`updated_at.lt.${cursor.places.updatedAt},and(updated_at.eq.${cursor.places.updatedAt},id.gt.${cursor.places.id})`);
  const events = normalized.kind === 'place' ? [] : await eventQuery;
  const places = normalized.kind === 'event' ? [] : await placeQuery;
  if ('error' in events && events.error) throw events.error;
  if ('error' in places && places.error) throw places.error;
  const eventRows = Array.isArray(events) ? [] : events.data || []; const placeRows = Array.isArray(places) ? [] : places.data || [];
  const mapped = await Promise.all([...eventRows.map(mapEvent), ...placeRows.map(mapPlace)]);
  const items = mapped.filter((item) => !normalized.verifiedOnly || item.trust === 'official' || item.trust === 'verified');
  const lastEvent = eventRows.at(-1); const lastPlace = placeRows.at(-1);
  return { items, next: (eventRows.length === limit || placeRows.length === limit) ? { events: lastEvent ? { startsAt: lastEvent.starts_at, id: lastEvent.id } : undefined, places: lastPlace ? { updatedAt: lastPlace.updated_at, id: lastPlace.id } : undefined } : null };
}

export async function getDiscovery(kind: DiscoveryKind, id: string): Promise<DiscoveryItem | null> {
  if (!supabase) return null;
  if (kind === 'event') { const { data, error } = await supabase.from('events').select('*').eq('id', id).maybeSingle(); if (error) throw error; return data ? mapEvent(data) : null; }
  const { data, error } = await supabase.from('canonical_places').select('*').eq('id', id).maybeSingle(); if (error) throw error; return data ? mapPlace(data) : null;
}

export async function addEventToItinerary(eventId: string, tripDayId: string, startsAt: string, durationMinutes: number, sortKey: string, idempotencyKey: string) {
  if (!supabase) throw new Error('需要資料連線才能加入官方活動。');
  const { data, error } = await supabase.rpc('add_event_to_itinerary', { target_event_id: eventId, target_trip_day_id: tripDayId, target_starts_at: startsAt, target_duration_minutes: durationMinutes, target_sort_key: sortKey, request_idempotency_key: idempotencyKey });
  if (error) throw error;
  return data;
}

export async function reportEvent(eventId: string, category: string, details: string, reporterId: string) {
  if (!supabase) throw new Error('需要登入後才能回報。');
  const { error } = await supabase.from('data_reports').insert({ event_id: eventId, category, details, reporter_id: reporterId });
  if (error) throw error;
}

export async function currentPlatformRole() {
  if (!supabase) return null;
  const { data, error } = await supabase.from('platform_roles').select('role').limit(1).maybeSingle();
  if (error) throw error;
  return data?.role ?? null;
}

export async function reviewAction(targetId: string, targetKind: DiscoveryKind, decision: 'approve' | 'request_changes' | 'reject' | 'publish', notes: string) {
  if (!supabase) throw new Error('需要管理權限。');
  const { error } = await supabase.rpc('review_data_item', { target_id: targetId, target_kind: targetKind, decision, notes });
  if (error) throw error;
}
