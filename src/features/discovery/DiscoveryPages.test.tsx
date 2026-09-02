import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { addEventMock, queryMock, reportEventMock, reviewActionMock, tripDaysMock } = vi.hoisted(() => ({ addEventMock: vi.fn(), queryMock: vi.fn(), reportEventMock: vi.fn(), reviewActionMock: vi.fn(), tripDaysMock: vi.fn() }));

vi.mock('@tanstack/react-query', () => ({ useQuery: queryMock, useQueryClient: () => ({ invalidateQueries: vi.fn() }) }));
vi.mock('../../app/AuthContext', () => ({ useAuth: () => ({ user: { id: 'owner-id' } }) }));
vi.mock('../../app/TripDataContext', () => ({ useTripData: () => ({ days: {} }) }));
vi.mock('../trips/queries', () => ({ useTripDays: (...args: unknown[]) => tripDaysMock(...args) }));
vi.mock('./discoveryRepository', async (importOriginal) => ({ ...(await importOriginal<typeof import('./discoveryRepository')>()), addEventToItinerary: addEventMock, reportEvent: reportEventMock, reviewAction: reviewActionMock }));

import { AddEventPage, DiscoveryDetailPage, DiscoveryExplorePage, ReviewerQueuePage } from './DiscoveryPages';

const event = { id: 'event-1', kind: 'event' as const, title: '首爾燈節', koreanName: '서울빛초롱축제', region: 'SEOUL', category: 'festival', trust: 'official' as const, updatedAt: '2026-09-01T00:00:00Z', lastVerifiedAt: '2026-09-01T00:00:00Z', startsAt: '2026-09-02T10:00:00Z', endsAt: '2026-09-02T11:00:00Z' };

describe('M2 discovery interactions', () => {
  beforeEach(() => {
    addEventMock.mockReset(); queryMock.mockReset(); reportEventMock.mockReset(); reviewActionMock.mockReset(); tripDaysMock.mockReset(); tripDaysMock.mockReturnValue({ data: [] });
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

  it('keeps one selected Explore tab and returns focus after closing filters with Escape', async () => {
    queryMock.mockReturnValue({ isLoading: false, isError: false, isFetching: false, data: { items: [], next: null }, refetch: vi.fn() });
    render(<MemoryRouter initialEntries={['/trips/trip-001/discover']}><Routes><Route path="/trips/:tripId/discover" element={<DiscoveryExplorePage/>}/></Routes></MemoryRouter>);
    expect(screen.getAllByRole('tab', { selected: true })).toHaveLength(1);
    expect(screen.getByRole('tab', { name: '全部' })).toHaveAttribute('aria-selected', 'true');
    const trigger = screen.getByRole('button', { name: '篩選' });
    await userEvent.click(trigger);
    expect(screen.getByRole('dialog', { name: '篩選探索結果' })).toBeVisible();
    await waitFor(() => expect(screen.getByLabelText('區域')).toHaveFocus());
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('preserves the itinerary and shows the PT409 conflict state when adding an event', async () => {
    tripDaysMock.mockReturnValue({ data: [{ id: 'day-1', sortOrder: 1, date: '2026-09-02' }] });
    addEventMock.mockRejectedValueOnce({ code: 'PT409', hint: 'ITINERARY_TIME_CONFLICT' });
    render(<MemoryRouter initialEntries={['/trips/trip-001/discover/event/event-1/add']}><Routes><Route path="/trips/:tripId/discover/event/:id/add" element={<AddEventPage/>}/></Routes></MemoryRouter>);
    await userEvent.click(screen.getByRole('button', { name: '加入行程' }));
    expect(await screen.findByText('時間發生衝突')).toBeVisible();
    expect(screen.getByText('不會覆寫既有行程。請改時間或查看行程。')).toBeVisible();
  });

  it('shows a 403 state instead of the review queue for a non-reviewer', () => {
    queryMock.mockReturnValue({ isLoading: false, data: null });
    render(<MemoryRouter><ReviewerQueuePage/></MemoryRouter>);
    expect(screen.getByRole('alert')).toHaveTextContent('403：你沒有資料審核權限。');
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
