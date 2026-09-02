import { describe, expect, it, vi } from 'vitest';

type Call = [string, unknown[]];
const { fromMock, queries } = vi.hoisted(() => {
  const queries: Record<string, { calls: Call[]; builder: Record<string, unknown> }> = {};
  const makeQuery = (table: string) => {
    const calls: Call[] = [];
    const builder: Record<string, unknown> = {};
    for (const method of ['select', 'eq', 'gte', 'lte', 'contains', 'in', 'or', 'order', 'limit']) builder[method] = (...args: unknown[]) => { calls.push([method, args]); return builder; };
    builder.then = (resolve: (value: unknown) => unknown) => Promise.resolve({ data: [], error: null }).then(resolve);
    queries[table] = { calls, builder };
    return builder;
  };
  return { fromMock: vi.fn((table: string) => makeQuery(table)), queries };
});

vi.mock('../../lib/supabase', () => ({ supabase: { from: fromMock } }));

import { listDiscovery, type DiscoveryFilters } from './discoveryRepository';

const filters: DiscoveryFilters = { kind: 'all', query: '  light  ', region: ' seoul ', verifiedOnly: true, startDate: '2026-09-02', endDate: '2026-09-04', category: 'festival' };

describe('listDiscovery server query contract', () => {
  it('applies published, region, trust, date, category, and search filters before the limit', async () => {
    await listDiscovery(filters, 24);
    const eventCalls = queries.events.calls;
    const placeCalls = queries.canonical_places.calls;
    expect(eventCalls).toEqual(expect.arrayContaining([
      ['eq', ['publication_status', 'published']], ['eq', ['lifecycle_status', 'scheduled']], ['eq', ['region_code', 'SEOUL']], ['gte', ['starts_at', '2026-09-02']], ['lte', ['starts_at', '2026-09-04T23:59:59.999Z']], ['contains', ['tags', ['festival']]], ['in', ['trust_level', ['official', 'verified']]], ['or', ['title_zh_tw.ilike.%light%,title_ko.ilike.%light%,title_en.ilike.%light%']], ['limit', [24]],
    ]));
    expect(placeCalls).toEqual(expect.arrayContaining([
      ['eq', ['publication_status', 'published']], ['eq', ['region_code', 'SEOUL']], ['eq', ['category', 'festival']], ['in', ['trust_level', ['official', 'verified']]], ['or', ['name_zh_tw.ilike.%light%,name_ko.ilike.%light%,name_en.ilike.%light%']], ['limit', [24]],
    ]));
  });
});
