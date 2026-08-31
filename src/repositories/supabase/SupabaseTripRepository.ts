import type { SupabaseClient } from '@supabase/supabase-js';
import type { Pace, Place, Role, Trip, TripDay, TripMember } from '../../contracts/entities';
import { normalizeItineraryCategory } from '../../contracts/icons';
import { supabase } from '../../lib/supabase';
import { mapSupabaseError } from '../../lib/supabaseError';
import type { Database } from '../../../supabase/types/database.types';
import type { TripRepository } from '../interfaces/TripRepository';

type TripsRow = Database['public']['Tables']['trips']['Row'];
type TripDaysRow = Database['public']['Tables']['trip_days']['Row'];
type TripMembersRow = Database['public']['Tables']['trip_members']['Row'];
type PlacesRow = Database['public']['Tables']['places']['Row'];

const categoryLabels: Record<Place['category'], string> = {
  heritage: '歷史街區', food: '美食', neighborhood: '街區', cafe: '咖啡', shopping: '購物', nature: '自然',
  museum: '美術館', activity: '活動', hotel: '住宿', airport: '機場', flight: '航班', train: '火車',
  subway: '地鐵', bus: '公車', walk: '步行', taxi: '計程車', ferry: '渡輪', ticket: '票券',
  reservation: '預約', generic: '景點',
};

export const mapTrip = (row: TripsRow): Trip => ({
  id: row.id,
  ownerId: row.owner_id,
  title: row.title,
  destination: row.destination,
  timezone: row.timezone,
  startDate: row.start_date,
  endDate: row.end_date,
  defaultPace: row.default_pace as Pace,
  currency: row.currency as Trip['currency'],
  // The M1 UI treats a missing current day as an empty state rather than selecting an arbitrary day.
  currentDayId: row.current_day_id ?? '',
});

export const mapTripDay = (row: TripDaysRow, sortOrder: number): TripDay => ({
  id: row.id,
  tripId: row.trip_id,
  date: row.date,
  title: row.title,
  ...(row.pace_override ? { paceOverride: row.pace_override as Pace } : {}),
  sortOrder,
});

export const mapTripMember = (row: TripMembersRow): TripMember => ({
  tripId: row.trip_id,
  userId: row.user_id,
  displayName: row.display_name,
  role: row.role as Role,
});

export const mapPlace = (row: PlacesRow): Place => {
  const category = normalizeItineraryCategory(row.category);
  return {
    id: row.id,
    name: row.name,
    category,
    categoryLabel: categoryLabels[category],
    region: row.region,
    travelMinutes: row.travel_minutes,
    suggestedDurationMinutes: row.suggested_duration_minutes,
    ...(row.rating === null ? {} : { rating: row.rating }),
  };
};

export const throwRepositoryError = (error: { message: string; code?: string; hint?: string | null; status?: number } | null): void => {
  if (error) throw mapSupabaseError(error);
};

export class SupabaseTripRepository implements TripRepository {
  constructor(private readonly client: SupabaseClient<Database> | null = supabase) {}

  private get database(): SupabaseClient<Database> {
    if (!this.client) throw new Error('Supabase is not configured');
    return this.client;
  }

  async listTrips(): Promise<Trip[]> {
    const { data, error } = await this.database.from('trips').select('*').order('start_date', { ascending: false });
    throwRepositoryError(error);
    return (data ?? []).map(mapTrip);
  }

  async getTrip(tripId: string): Promise<Trip | null> {
    const { data, error } = await this.database.from('trips').select('*').eq('id', tripId).maybeSingle();
    throwRepositoryError(error);
    return data ? mapTrip(data) : null;
  }

  async listDays(tripId: string): Promise<TripDay[]> {
    const { data, error } = await this.database.from('trip_days').select('*').eq('trip_id', tripId).order('sort_key');
    throwRepositoryError(error);
    return (data ?? []).map((row, index) => mapTripDay(row, index + 1));
  }

  async listMembers(tripId: string): Promise<TripMember[]> {
    const { data, error } = await this.database.from('trip_members').select('*').eq('trip_id', tripId).order('created_at');
    throwRepositoryError(error);
    return (data ?? []).map(mapTripMember);
  }

  async listPlaces(tripId: string): Promise<Place[]> {
    const { data, error } = await this.database.from('places').select('*').eq('trip_id', tripId).order('name');
    throwRepositoryError(error);
    return (data ?? []).map(mapPlace);
  }

  async getPlace(tripId: string, placeId: string): Promise<Place | null> {
    const { data, error } = await this.database.from('places').select('*').eq('trip_id', tripId).eq('id', placeId).maybeSingle();
    throwRepositoryError(error);
    return data ? mapPlace(data) : null;
  }
}
