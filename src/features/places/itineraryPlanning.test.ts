import { describe, expect, it } from 'vitest';
import type { ItineraryItem } from '../../contracts/entities';
import { nextAppendSortKey, toZonedIso } from './itineraryPlanning';

const item = (sortKey: string): ItineraryItem => ({ id: sortKey, tripDayId: 'day-2', startsAt: '2026-10-10T00:00:00.000Z', durationMinutes: 30, title: 'Test', meta: '', type: 'place', category: 'generic', status: 'planned', sortKey, version: 1 });

describe('itinerary planning values', () => {
  it('uses the selected TripDay date and trip timezone for the persisted timestamp', () => {
    expect(toZonedIso('2026-10-10', '14:15', 'Asia/Seoul')).toBe('2026-10-10T05:15:00.000Z');
    expect(toZonedIso('2026-07-04', '09:00', 'America/New_York')).toBe('2026-07-04T13:00:00.000Z');
  });

  it('creates distinct append keys for consecutive additions on the same day', () => {
    const first = nextAppendSortKey([item('a0'), item('b0')], () => 'first');
    const second = nextAppendSortKey([item('a0'), item('b0'), item(first)], () => 'second');
    expect(first).toBe('b0~first');
    expect(second).toBe('b0~first~second');
    expect(new Set([first, second]).size).toBe(2);
  });
});
