import { describe, expect, it } from 'vitest';
import { discoveryRegions, initialDiscoveryFilters, normalizeDiscoveryFilters } from './discoveryRepository';

describe('discovery filter contract', () => {
  it('uses the fixture-compatible uppercase Seoul default', () => {
    expect(initialDiscoveryFilters.region).toBe('SEOUL');
    expect(discoveryRegions).toContainEqual({ code: 'SEOUL', label: '首爾' });
  });
  it('normalizes Seoul and Busan region codes before building a query', () => {
    expect(normalizeDiscoveryFilters({ ...initialDiscoveryFilters, region: ' seoul ' }).region).toBe('SEOUL');
    expect(normalizeDiscoveryFilters({ ...initialDiscoveryFilters, region: 'busan' }).region).toBe('BUSAN');
  });
});
