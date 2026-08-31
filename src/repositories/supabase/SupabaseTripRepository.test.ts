import { describe, expect, it } from 'vitest';
import type { Database } from '../../../supabase/types/database.types';
import { mapPlace, mapTrip, mapTripDay, mapTripMember, SupabaseTripRepository, throwRepositoryError } from './SupabaseTripRepository';

type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];

const tripRow: Row<'trips'> = {
  id: 'trip-remote', owner_id: 'owner-1', title: '首爾 5 天 4 夜', destination: '首爾', timezone: 'Asia/Seoul',
  start_date: '2026-09-21', end_date: '2026-09-25', default_pace: 'balanced', currency: 'KRW', current_day_id: null,
  version: 1, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
};

const dayRow: Row<'trip_days'> = {
  id: 'day-remote', trip_id: 'trip-remote', date: '2026-09-21', title: '抵達首爾', pace_override: null, sort_key: 'a0',
  version: 1, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
};

const placeRow: Row<'places'> = {
  id: 'place-remote', trip_id: 'trip-remote', name: '測試景點', category: 'unknown-from-api', region: '鐘路區',
  travel_minutes: 12, suggested_duration_minutes: 75, rating: null, address: null, lat: null, lng: null,
  created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
};

describe('SupabaseTripRepository mapping', () => {
  it('maps nullable trip and day fields into the M1 domain empty states', () => {
    expect(mapTrip(tripRow).currentDayId).toBe('');
    expect(mapTripDay(dayRow, 2)).toMatchObject({ sortOrder: 2 });
    expect(mapTripDay(dayRow, 2)).not.toHaveProperty('paceOverride');
  });

  it('normalizes an unknown place category and omits a null rating', () => {
    expect(mapPlace(placeRow)).toMatchObject({ category: 'generic', categoryLabel: '景點' });
    expect(mapPlace(placeRow)).not.toHaveProperty('rating');
  });

  it('preserves a Viewer membership on the read path', () => {
    expect(mapTripMember({
      trip_id: 'trip-remote', user_id: 'viewer-1', display_name: 'Rin', role: 'viewer',
      created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    })).toMatchObject({ role: 'viewer', displayName: 'Rin' });
  });

  it('surfaces repository errors and fails clearly without configuration', async () => {
    try {
      throwRepositoryError({ message: 'permission denied', code: '42501' });
      throw new Error('expected repository error');
    } catch (error) {
      expect(error).toMatchObject({ code: 'FORBIDDEN_ROLE', retryable: false });
    }
    await expect(new SupabaseTripRepository(null).listTrips()).rejects.toThrow('Supabase is not configured');
  });
});
