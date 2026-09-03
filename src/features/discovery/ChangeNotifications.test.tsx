import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { acknowledgeChangeNotification, invalidateQueries, queryMock } = vi.hoisted(() => ({ acknowledgeChangeNotification: vi.fn(), invalidateQueries: vi.fn(), queryMock: vi.fn() }));
const notices = [{ id: 'notice-1', change_kind: 'schedule_changed', created_at: '2026-09-02T00:00:00Z' }];

vi.mock('@tanstack/react-query', () => ({ useQuery: queryMock, useQueryClient: () => ({ invalidateQueries }) }));
vi.mock('../../lib/supabase', () => ({ supabase: {} }));
vi.mock('./changeNotificationsRepository', () => ({ acknowledgeChangeNotification, listChangeNotifications: vi.fn(), sourceChangeNoticesKey: (tripId?: string) => ['source-change-notices', tripId] }));

import { ChangeNotifications } from './ChangeNotifications';

describe('ChangeNotifications', () => {
  beforeEach(() => { acknowledgeChangeNotification.mockReset(); invalidateQueries.mockReset(); queryMock.mockReset(); queryMock.mockReturnValue({ data: notices }); });
  it('acknowledges a source change without changing itinerary content', async () => {
    acknowledgeChangeNotification.mockResolvedValue(undefined);
    render(<ChangeNotifications tripId="trip-001"/>);
    expect(screen.getByRole('status')).toHaveTextContent('schedule_changed；你的既有行程沒有被自動改寫。');
    await userEvent.click(screen.getByRole('button', { name: '知道了' }));
    await waitFor(() => expect(acknowledgeChangeNotification).toHaveBeenCalledWith('notice-1', expect.any(String)));
    expect(invalidateQueries).toHaveBeenCalledWith({ queryKey: ['source-change-notices', 'trip-001'] });
  });
  it('shows a retry control when acknowledgement fails', async () => {
    acknowledgeChangeNotification.mockRejectedValue(new Error('network'));
    render(<ChangeNotifications tripId="trip-001"/>);
    await userEvent.click(screen.getByRole('button', { name: '知道了' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('確認失敗');
    expect(screen.getByRole('button', { name: '再試一次' })).toBeEnabled();
    expect(invalidateQueries).not.toHaveBeenCalled();
  });
});
