import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { invalidateQueries, queryMock, update, updateEq } = vi.hoisted(() => ({ invalidateQueries: vi.fn(), queryMock: vi.fn(), update: vi.fn(), updateEq: vi.fn() }));
const notices = [{ id: 'notice-1', change_kind: 'schedule_changed', created_at: '2026-09-02T00:00:00Z' }];
const chain = { update, eq: updateEq };

vi.mock('@tanstack/react-query', () => ({ useQuery: queryMock, useQueryClient: () => ({ invalidateQueries }) }));
vi.mock('../../lib/supabase', () => ({ supabase: { from: () => chain } }));

import { ChangeNotifications } from './ChangeNotifications';

describe('ChangeNotifications', () => {
  beforeEach(() => { invalidateQueries.mockReset(); queryMock.mockReset(); update.mockReset(); updateEq.mockReset(); queryMock.mockReturnValue({ data: notices }); update.mockReturnValue(chain); });
  it('acknowledges a source change without changing itinerary content', async () => {
    updateEq.mockResolvedValue({ error: null });
    render(<ChangeNotifications tripId="trip-001"/>);
    expect(screen.getByRole('status')).toHaveTextContent('schedule_changed；你的既有行程沒有被自動改寫。');
    await userEvent.click(screen.getByRole('button', { name: '知道了' }));
    await waitFor(() => expect(update).toHaveBeenCalledWith({ acknowledged_at: expect.any(String) }));
    expect(updateEq).toHaveBeenCalledWith('id', 'notice-1');
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['source-change-notices', 'trip-001'] });
  });
  it('shows a retry control when acknowledgement fails', async () => {
    updateEq.mockResolvedValue({ error: { message: 'network' } });
    render(<ChangeNotifications tripId="trip-001"/>);
    await userEvent.click(screen.getByRole('button', { name: '知道了' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('確認失敗');
    expect(screen.getByRole('button', { name: '再試一次' })).toBeEnabled();
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
