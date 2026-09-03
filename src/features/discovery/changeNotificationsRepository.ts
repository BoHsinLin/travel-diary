import type { Database } from '../../../supabase/types/database.types';
import { supabase } from '../../lib/supabase';

type ChangeNotificationRow = Database['public']['Tables']['event_change_notifications']['Row'];
type ChangeNotificationUpdate = Database['public']['Tables']['event_change_notifications']['Update'];

export type ChangeNotification = Pick<ChangeNotificationRow, 'id' | 'change_kind' | 'created_at'>;

export const sourceChangeNoticesKey = (tripId?: string) => ['source-change-notices', tripId] as const;

export async function listChangeNotifications(tripId: string): Promise<ChangeNotification[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('event_change_notifications')
    .select('id, change_kind, created_at')
    .eq('trip_id', tripId)
    .is('acknowledged_at', null)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function acknowledgeChangeNotification(id: string, acknowledgedAt: string): Promise<void> {
  if (!supabase) return;
  const update: ChangeNotificationUpdate = { acknowledged_at: acknowledgedAt };
  const { error } = await supabase.from('event_change_notifications').update(update).eq('id', id);
  if (error) throw error;
}
