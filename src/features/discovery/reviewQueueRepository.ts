import { supabase } from '../../lib/supabase';

type ReviewQueueStatus = 'pending' | 'needs_changes' | 'approved' | 'rejected' | 'published';
type ReviewQueueQuery = {
  select(columns: string): {
    in(column: 'status', values: ReviewQueueStatus[]): {
      order(column: 'priority', options: { ascending: boolean }): Promise<{ data: ReviewQueueItem[] | null; error: unknown }>;
    };
  };
};

export type ReviewQueueItem = { id: string; event_id: string | null; place_id: string | null; priority: number; risk_flags: string[]; status: ReviewQueueStatus };

export async function listReviewQueue(): Promise<ReviewQueueItem[]> {
  if (!supabase) return [];
  // The committed generated client predates this M2 table. Keep the compatibility
  // cast inside the repository boundary; pages consume only the DTO above.
  const query = supabase as unknown as { from(table: 'data_review_queue'): ReviewQueueQuery };
  const { data, error } = await query
    .from('data_review_queue')
    .select('id, event_id, place_id, priority, risk_flags, status')
    .in('status', ['pending', 'needs_changes', 'approved'])
    .order('priority', { ascending: false });
  if (error) throw error;
  return data ?? [];
}
