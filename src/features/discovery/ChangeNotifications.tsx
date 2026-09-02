import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Icon } from '../../components/icons/Icon';
import { supabase } from '../../lib/supabase';

export function ChangeNotifications({ tripId }: { tripId?: string }) {
  const queryClient = useQueryClient();
  const [failedId, setFailedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const notices = useQuery({ queryKey: ['source-change-notices', tripId], enabled: Boolean(tripId && supabase), queryFn: async () => {
    if (!supabase || !tripId) return [];
    const { data, error } = await supabase.from('event_change_notifications').select('id, change_kind, created_at').eq('trip_id', tripId).is('acknowledged_at', null).order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } });
  if (!notices.data?.length) return null;
  const acknowledge = async (id: string) => {
    if (!supabase) return;
    setSavingId(id); setFailedId(null);
    try {
      const { error } = await supabase.from('event_change_notifications').update({ acknowledged_at: new Date().toISOString() }).eq('id', id);
      if (error) { setFailedId(id); return; }
      await queryClient.invalidateQueries({ queryKey: ['source-change-notices', tripId] });
    } catch { setFailedId(id); } finally { setSavingId(null); }
  };
  return <aside className="source-change-notices" aria-label="來源資料變更通知">{notices.data.map((notice) => <section key={notice.id} role="status"><Icon name="notification" size={20}/><div><strong>來源資訊已更新</strong><span>{notice.change_kind}；你的既有行程沒有被自動改寫。</span>{failedId === notice.id && <span role="alert">確認失敗，請再試一次。</span>}</div><button disabled={savingId === notice.id} onClick={() => void acknowledge(notice.id)}>{savingId === notice.id ? '正在確認…' : failedId === notice.id ? '再試一次' : '知道了'}</button></section>)}</aside>;
}
