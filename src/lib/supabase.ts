import { createClient } from '@supabase/supabase-js';
import type { Database } from '../../supabase/types/database.types';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
export const hasSupabaseConfig = Boolean(url && key);
export const supabase = hasSupabaseConfig ? createClient<Database>(url!, key!, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}) : null;
