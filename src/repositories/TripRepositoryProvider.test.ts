import { describe, expect, it } from 'vitest';
import { createTripRepository } from './TripRepositoryProvider';
import { MockTripRepository } from './mock/MockTripRepository';
import { SupabaseTripRepository } from './supabase/SupabaseTripRepository';

describe('TripRepositoryProvider', () => {
  it('uses the demo repository only when Supabase configuration is unavailable', () => {
    expect(createTripRepository(false)).toBeInstanceOf(MockTripRepository);
  });

  it('selects the Supabase repository for all M1 trip reads when configured', () => {
    expect(createTripRepository(true)).toBeInstanceOf(SupabaseTripRepository);
  });
});
