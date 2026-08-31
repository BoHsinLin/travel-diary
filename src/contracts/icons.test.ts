import { describe, expect, it } from 'vitest';
import { normalizeItineraryCategory, travelIconRegistry } from './icons';

describe('travel icon contract', () => {
  it('contains 74 unique stable keys', () => {
    const keys = Object.values(travelIconRegistry).flat();
    expect(keys).toHaveLength(74);
    expect(new Set(keys).size).toBe(74);
  });

  it('normalizes unknown backend categories to generic', () => {
    expect(normalizeItineraryCategory('museum')).toBe('museum');
    expect(normalizeItineraryCategory('美術館')).toBe('generic');
    expect(normalizeItineraryCategory(undefined)).toBe('generic');
  });
});
