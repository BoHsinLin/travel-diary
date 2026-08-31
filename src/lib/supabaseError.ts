import type { AppError, SyncState } from '../contracts/entities';

type SupabaseLikeError = { code?: string; hint?: string | null; message?: string; status?: number };

export class SupabaseAppError extends Error implements AppError {
  constructor(
    public readonly code: string,
    message: string,
    public readonly retryable: boolean,
    public readonly field?: string,
  ) {
    super(message);
    this.name = 'SupabaseAppError';
  }
}

const hasErrorShape = (cause: unknown): cause is SupabaseLikeError => typeof cause === 'object' && cause !== null;

/** Converts PostgREST/Auth failures into stable UI-safe domain errors. */
export const mapSupabaseError = (cause: unknown): SupabaseAppError => {
  if (cause instanceof SupabaseAppError) return cause;
  if (!hasErrorShape(cause)) return new SupabaseAppError('UNKNOWN', '目前無法完成操作，請稍後再試。', true);
  const { code, hint, status } = cause;
  if (code === 'PT409' || hint === 'VERSION_CONFLICT') return new SupabaseAppError('VERSION_CONFLICT', '此行程已被其他旅伴更新，請載入最新版後再試。', true);
  if (code === '23505' || hint === 'SORT_KEY_CONFLICT') return new SupabaseAppError('SORT_KEY_CONFLICT', '排序已變更，請載入最新版後再試。', true, 'sortKey');
  if (code === '42501' || status === 403) return new SupabaseAppError('FORBIDDEN_ROLE', '你的權限不允許此操作。', false);
  if (status === 401 || code === 'PGRST301' || code === 'JWT_EXPIRED') return new SupabaseAppError('AUTH_REQUIRED', '登入已失效，請重新登入後再試。', false);
  if (status === 404 || code === 'PGRST116') return new SupabaseAppError('NOT_FOUND', '找不到要求的資料。', false);
  if (code === 'OFFLINE' || cause instanceof TypeError) return new SupabaseAppError('OFFLINE', '目前離線，請恢復連線後再試。', true);
  return new SupabaseAppError('UNKNOWN', '目前無法完成操作，請稍後再試。', true);
};

export const syncStateForError = (error: AppError, online = navigator.onLine): SyncState => {
  if (error.code === 'VERSION_CONFLICT' || error.code === 'SORT_KEY_CONFLICT') return 'conflict';
  if (error.code === 'OFFLINE' || !online) return 'offline';
  return 'failed';
};
