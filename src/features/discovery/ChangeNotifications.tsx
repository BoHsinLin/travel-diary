import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon } from '../../components/icons/Icon';
import { supabase } from '../../lib/supabase';

export function ChangeNotifications({ tripId }: { tripId?: string }) {
  const queryClient = useQueryClient();
  const notices = useQuery({ queryKey: ['source-change-notices', tripId], enabled: Boolean(tripId && supabase), queryFn: async () => {
    if (!supabase || !tripId) return [];
    const { data, error } = await supabase.from('event_change_notifications').select('id, change_kind, created_at').eq('trip_id', tripId).is('acknowledged_at', null).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } });
  if (!notices.data?.length) return null;
  const acknowledge = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('event_change_notifications').update({ acknowledged_at: new Date().toISOString() }).eq('id', id);
    if (!error) await queryClient.invalidateQueries({ queryKey: ['source-change-notices', tripId] });
  };
  return <aside className="source-change-notices" aria-label="來源資料變更通知">{notices.data.map((notice) => <section key={notice.id} role="status"><Icon name="notification" size={20}/><div><strong>來源資訊已更新</strong><span>{notice.change_kind}；你的既有行程沒有被自動改寫。</span></div><button onClick={() => void acknowledge(notice.id)}>知道了</button></section>)}</aside>;
}
