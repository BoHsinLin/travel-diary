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
export type DiscoveryFilters = { kind: 'all' | DiscoveryKind; query: string; region: string; verifiedOnly: boolean };
export const initialDiscoveryFilters: DiscoveryFilters = { kind: 'all', query: '', region: 'seoul', verifiedOnly: false };

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

export async function listDiscovery(filters: DiscoveryFilters, limit = 24): Promise<DiscoveryItem[]> {
  if (!supabase) return [];
  const query = filters.query.trim();
  const events = filters.kind === 'place' ? [] : await supabase.from('events').select('*').eq('publication_status', 'published').eq('lifecycle_status', 'scheduled').gte('ends_at', new Date().toISOString()).eq('region_code', filters.region).order('starts_at').limit(limit);
  const places = filters.kind === 'event' ? [] : await supabase.from('canonical_places').select('*').eq('publication_status', 'published').eq('region_code', filters.region).order('updated_at', { ascending: false }).limit(limit);
  if ('error' in events && events.error) throw events.error;
  if ('error' in places && places.error) throw places.error;
  const mapped = await Promise.all([...(Array.isArray(events) ? [] : events.data || []).map(mapEvent), ...(Array.isArray(places) ? [] : places.data || []).map(mapPlace)]);
  return mapped.filter((item) => (!filters.verifiedOnly || item.trust === 'official' || item.trust === 'verified') && (!query || `${item.title}${item.koreanName}${item.category}${item.region}`.toLowerCase().includes(query.toLowerCase())));
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
