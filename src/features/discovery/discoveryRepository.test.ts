import { describe, expect, it } from 'vitest';
import { discoveryRegions, initialDiscoveryFilters, nextDiscoveryCursor, normalizeDiscoveryFilters } from './discoveryRepository';

describe('discovery filter contract', () => {
  it('uses the fixture-compatible uppercase Seoul default', () => {
    expect(initialDiscoveryFilters.region).toBe('SEOUL');
    expect(discoveryRegions).toContainEqual({ code: 'SEOUL', label: '首爾' });
  });
  it('normalizes Seoul and Busan region codes before building a query', () => {
    expect(normalizeDiscoveryFilters({ ...initialDiscoveryFilters, region: ' seoul ' }).region).toBe('SEOUL');
    expect(normalizeDiscoveryFilters({ ...initialDiscoveryFilters, region: 'busan' }).region).toBe('BUSAN');
  });
  it('keeps an exhausted event stream exhausted while places continue', () => {
    const cursor = nextDiscoveryCursor('all', 2, {}, {
      events: [{ id: 'event-1', starts_at: '2026-09-02T10:00:00Z' }],
      places: [{ id: 'place-1', updated_at: '2026-09-02T10:00:00Z' }, { id: 'place-2', updated_at: '2026-09-01T10:00:00Z' }],
    });
    expect(cursor).toEqual({
      events: { startsAt: '2026-09-02T10:00:00Z', id: 'event-1', exhausted: true },
      places: { updatedAt: '2026-09-01T10:00:00Z', id: 'place-2', exhausted: false },
    });
  });
  it('ends only after both active streams are exhausted', () => {
    expect(nextDiscoveryCursor('all', 2, { events: { startsAt: '2026-09-02T10:00:00Z', id: 'event-1', exhausted: true }, places: { updatedAt: '2026-09-01T10:00:00Z', id: 'place-2', exhausted: false } }, { events: [], places: [] })).toBeNull();
  });
});
