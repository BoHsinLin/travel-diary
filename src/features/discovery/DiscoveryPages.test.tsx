import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, reportEventMock, reviewActionMock } = vi.hoisted(() => ({ queryMock: vi.fn(), reportEventMock: vi.fn(), reviewActionMock: vi.fn() }));

vi.mock('@tanstack/react-query', () => ({ useQuery: queryMock, useQueryClient: () => ({ invalidateQueries: vi.fn() }) }));
vi.mock('../../app/AuthContext', () => ({ useAuth: () => ({ user: { id: 'owner-id' } }) }));
vi.mock('../../app/TripDataContext', () => ({ useTripData: () => ({ days: {} }) }));
vi.mock('../trips/queries', () => ({ useTripDays: () => ({ data: [] }) }));
vi.mock('./discoveryRepository', async (importOriginal) => ({ ...(await importOriginal<typeof import('./discoveryRepository')>()), reportEvent: reportEventMock, reviewAction: reviewActionMock }));

import { DiscoveryDetailPage, ReviewerQueuePage } from './DiscoveryPages';

const event = { id: 'event-1', kind: 'event' as const, title: '首爾燈節', koreanName: '서울빛초롱축제', region: 'SEOUL', category: 'festival', trust: 'official' as const, updatedAt: '2026-09-01T00:00:00Z', lastVerifiedAt: '2026-09-01T00:00:00Z', startsAt: '2026-09-02T10:00:00Z', endsAt: '2026-09-02T11:00:00Z' };

describe('M2 discovery interactions', () => {
  beforeEach(() => {
    queryMock.mockReset(); reportEventMock.mockReset(); reviewActionMock.mockReset();
  });

  it('submits an Event report and shows a completion state', async () => {
    queryMock.mockReturnValue({ isLoading: false, isError: false, data: event, refetch: vi.fn() });
    reportEventMock.mockResolvedValue(undefined);
    render(<MemoryRouter initialEntries={['/trips/trip-001/discover/event/event-1']}><Routes><Route path="/trips/:tripId/discover/:kind/:id" element={<DiscoveryDetailPage/>}/></Routes></MemoryRouter>);
    await userEvent.click(screen.getByRole('button', { name: '回報資料問題' }));
    await userEvent.type(screen.getByRole('textbox', { name: '問題說明' }), '官方時間有誤');
    await userEvent.click(screen.getByRole('button', { name: '送交審核' }));
    await waitFor(() => expect(reportEventMock).toHaveBeenCalledWith('event-1', 'incorrect_information', '官方時間有誤', 'owner-id'));
    expect(screen.getByRole('status')).toHaveTextContent('已送交審核');
  });

  it('keeps Reviewer dialog open with a retry state when the RPC fails', async () => {
    const refetch = vi.fn().mockResolvedValue({ data: [] });
    queryMock.mockImplementation(({ queryKey }: { queryKey: string[] }) => queryKey[0] === 'platform-role'
      ? { isLoading: false, data: 'reviewer' }
      : { isLoading: false, isError: false, data: [{ id: 'queue-1', event_id: 'event-1', place_id: null, priority: 1, risk_flags: [], status: 'pending' }], refetch });
    reviewActionMock.mockRejectedValueOnce(new Error('denied'));
    render(<MemoryRouter><ReviewerQueuePage/></MemoryRouter>);
    const action = screen.getByRole('button', { name: '核准' });
    await userEvent.click(action);
    expect(screen.getByRole('dialog')).toBeVisible();
    await waitFor(() => expect(screen.getByRole('button', { name: '確認' })).toHaveFocus());
    await userEvent.click(screen.getByRole('button', { name: '確認' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('更新失敗');
    expect(screen.getByRole('button', { name: '再試一次' })).toBeEnabled();
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(action).toHaveFocus());
  });
});
