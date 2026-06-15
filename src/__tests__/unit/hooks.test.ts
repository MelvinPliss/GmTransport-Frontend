import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { useWebSocket } from '../../hooks/useWebSocket';
import * as subscriptionService from '../../services/subscriptionService';

vi.mock('../../services/subscriptionService', () => ({
  subscriptionService: { getAll: vi.fn() },
}));

vi.mock('../../services/websocketService', () => ({
  wsService: {
    connect: vi.fn(),
    isConnected: false,
    onStatusChange: vi.fn(() => vi.fn()),
    onMessage: vi.fn(() => vi.fn()),
    disconnect: vi.fn(),
  },
}));

const mockGetAll = vi.mocked(subscriptionService.subscriptionService.getAll);

const mockSubs = [{
  id: 'sub-1', userId: '1', email: 'a@b.com',
  plan: 'monthly' as const, status: 'ACTIVE' as const,
  payment: { method: 'CREDIT_CARD' as const, maskedIdentifier: '**** 1111' },
  createdAt: '2026-06-01T00:00:00Z', expiresAt: '2026-07-01T00:00:00Z', updatedAt: '2026-06-01T00:00:00Z',
}];

describe('useSubscriptions', () => {
  beforeEach(() => vi.clearAllMocks());

  it('starts in loading state', () => {
    mockGetAll.mockResolvedValue({ success: true, data: [] });
    const { result } = renderHook(() => useSubscriptions());
    expect(result.current.loading).toBe(true);
  });

  it('loads subscriptions on mount', async () => {
    mockGetAll.mockResolvedValue({ success: true, data: mockSubs });
    const { result } = renderHook(() => useSubscriptions());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.subscriptions).toHaveLength(1);
    expect(result.current.error).toBeNull();
  });

  it('sets error on failure', async () => {
    mockGetAll.mockRejectedValue({ kind: 'network', message: 'Sin conexión' });
    const { result } = renderHook(() => useSubscriptions());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();
  });

  it('refetch re-loads data', async () => {
    mockGetAll
      .mockResolvedValueOnce({ success: true, data: [] })
      .mockResolvedValueOnce({ success: true, data: mockSubs });
    const { result } = renderHook(() => useSubscriptions());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.subscriptions).toHaveLength(0);
    await act(async () => { await result.current.refetch(); });
    expect(result.current.subscriptions).toHaveLength(1);
  });
});

describe('useWebSocket', () => {
  beforeEach(() => vi.clearAllMocks());

  it('calls wsService.connect on mount', async () => {
    const { wsService } = await import('../../services/websocketService');
    renderHook(() => useWebSocket());
    expect(wsService.connect).toHaveBeenCalled();
  });

  it('subscribes to status changes', async () => {
    const { wsService } = await import('../../services/websocketService');
    renderHook(() => useWebSocket());
    expect(wsService.onStatusChange).toHaveBeenCalled();
  });

  it('subscribes to messages when onMessage is provided', async () => {
    const { wsService } = await import('../../services/websocketService');
    const handler = vi.fn();
    renderHook(() => useWebSocket({ onMessage: handler }));
    expect(wsService.onMessage).toHaveBeenCalledWith(handler);
  });

  it('does not subscribe to messages when no handler provided', async () => {
    const { wsService } = await import('../../services/websocketService');
    renderHook(() => useWebSocket());
    expect(wsService.onMessage).not.toHaveBeenCalled();
  });

  it('starts with connected: false', () => {
    const { result } = renderHook(() => useWebSocket());
    expect(result.current.connected).toBe(false);
  });

  it('unsubscribes on unmount', async () => {
    const { wsService } = await import('../../services/websocketService');
    const unsubStatus = vi.fn();
    const unsubMsg = vi.fn();
    vi.mocked(wsService.onStatusChange).mockReturnValue(unsubStatus);
    vi.mocked(wsService.onMessage).mockReturnValue(unsubMsg);
    const handler = vi.fn();
    const { unmount } = renderHook(() => useWebSocket({ onMessage: handler }));
    unmount();
    expect(unsubStatus).toHaveBeenCalled();
    expect(unsubMsg).toHaveBeenCalled();
  });
});
