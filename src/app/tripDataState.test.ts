import { describe, expect, it } from 'vitest';
import { beginOptimistic, completeOptimistic, rollbackOptimistic } from './tripDataState';

describe('TripData optimistic state machine', () => {
  const previous = { 'day-002': ['museum', 'lunch'] };
  const next = { 'day-002': ['lunch', 'museum'] };

  it('commits a successful optimistic operation and clears the error', () => {
    expect(beginOptimistic(next)).toMatchObject({ data: next, syncState: 'saving', error: null });
    expect(completeOptimistic(next)).toMatchObject({ data: next, syncState: 'synced', error: null });
  });

  it.each([
    [{ code: 'PT409', hint: 'VERSION_CONFLICT' }, 'conflict', 'VERSION_CONFLICT'],
    [{ code: '23505', hint: 'SORT_KEY_CONFLICT' }, 'conflict', 'SORT_KEY_CONFLICT'],
    [{ code: '42501' }, 'failed', 'FORBIDDEN_ROLE'],
    [{ code: 'OFFLINE' }, 'offline', 'OFFLINE'],
  ])('rolls back for contract error %#', (cause, syncState, code) => {
    expect(rollbackOptimistic(previous, cause, true)).toMatchObject({ data: previous, syncState, error: { code } });
  });

  it('restores the prior itinerary after an insert sort-key collision', () => {
    const pendingInsert = { 'day-002': ['museum', 'lunch', 'market'] };
    expect(rollbackOptimistic(previous, { code: '23505', hint: 'SORT_KEY_CONFLICT' }, true)).toMatchObject({ data: previous, syncState: 'conflict', error: { code: 'SORT_KEY_CONFLICT' } });
    expect(pendingInsert['day-002']).toHaveLength(3);
  });

  it('clears the prior failure after retry reload succeeds', () => {
    const failed = rollbackOptimistic(previous, { code: '42501' }, true);
    expect(failed.error?.code).toBe('FORBIDDEN_ROLE');
    expect(completeOptimistic(previous)).toEqual({ data: previous, syncState: 'synced', error: null });
  });
});
