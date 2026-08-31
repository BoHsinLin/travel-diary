import { describe, expect, it } from 'vitest';
import { mapSupabaseError, syncStateForError } from './supabaseError';

describe('mapSupabaseError', () => {
  it.each([
    [{ code: 'PT409', hint: 'VERSION_CONFLICT' }, 'VERSION_CONFLICT'],
    [{ code: '23505', hint: 'SORT_KEY_CONFLICT' }, 'SORT_KEY_CONFLICT'],
    [{ code: '42501' }, 'FORBIDDEN_ROLE'],
    [{ status: 401 }, 'AUTH_REQUIRED'],
    [{ status: 404 }, 'NOT_FOUND'],
  ])('maps PostgREST contract error %#', (input, code) => {
    expect(mapSupabaseError(input).code).toBe(code);
  });

  it('keeps conflict, permission, and offline sync states distinct for rollback UI', () => {
    expect(syncStateForError(mapSupabaseError({ code: 'PT409', hint: 'VERSION_CONFLICT' }), true)).toBe('conflict');
    expect(syncStateForError(mapSupabaseError({ code: '42501' }), true)).toBe('failed');
    expect(syncStateForError(mapSupabaseError({ code: 'OFFLINE' }), true)).toBe('offline');
  });
});
