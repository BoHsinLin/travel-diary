import type { AppError, SyncState } from '../contracts/entities';
import { mapSupabaseError, syncStateForError } from '../lib/supabaseError';

export interface OptimisticState<T> {
  data: T;
  syncState: SyncState;
  error: AppError | null;
}

export const beginOptimistic = <T>(data: T): OptimisticState<T> => ({ data, syncState: 'saving', error: null });

export const completeOptimistic = <T>(data: T): OptimisticState<T> => ({ data, syncState: 'synced', error: null });

export const rollbackOptimistic = <T>(previous: T, cause: unknown, online = navigator.onLine): OptimisticState<T> => {
  const error = mapSupabaseError(cause);
  return { data: previous, syncState: syncStateForError(error, online), error };
};
