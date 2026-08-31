import { hasSupabaseConfig } from '../lib/supabase';
import type { TripRepository } from './interfaces/TripRepository';
import { MockTripRepository } from './mock/MockTripRepository';
import { SupabaseTripRepository } from './supabase/SupabaseTripRepository';

export type TripRepositorySource = 'supabase' | 'demo';

/** Selects the only M1 Trip/Day/Member/Place read source used by feature queries. */
export const createTripRepository = (configured = hasSupabaseConfig): TripRepository => (
  configured ? new SupabaseTripRepository() : new MockTripRepository()
);

export const tripRepositorySource: TripRepositorySource = hasSupabaseConfig ? 'supabase' : 'demo';
export const tripRepository = createTripRepository();
