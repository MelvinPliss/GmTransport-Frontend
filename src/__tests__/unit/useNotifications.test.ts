import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNotifications } from '../../hooks/useNotifications';

describe('useNotifications', () => {
  it('starts with empty notifications', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.notifications).toHaveLength(0);
    expect(result.current.unreadCount).toBe(0);
  });

  it('adds a notification', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({
        type: 'success',
        title: 'Test',
        message: 'Test message',
      });
    });

    expect(result.current.notifications).toHaveLength(1);
    expect(result.current.notifications[0].title).toBe('Test');
    expect(result.current.notifications[0].read).toBe(false);
    expect(result.current.unreadCount).toBe(1);
  });

  it('marks a notification as read', () => {
    const { result } = renderHook(() => useNotifications());
    let id: string;

    act(() => {
      id = result.current.addNotification({ type: 'info', title: 'T', message: 'M' });
    });

    act(() => {
      result.current.markRead(id!);
    });

    expect(result.current.notifications[0].read).toBe(true);
    expect(result.current.unreadCount).toBe(0);
  });

  it('marks all as read', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({ type: 'success', title: 'A', message: 'M' });
      result.current.addNotification({ type: 'error', title: 'B', message: 'M' });
    });

    expect(result.current.unreadCount).toBe(2);

    act(() => {
      result.current.markAllRead();
    });

    expect(result.current.unreadCount).toBe(0);
  });

  it('dismisses a notification', () => {
    const { result } = renderHook(() => useNotifications());
    let id: string;

    act(() => {
      id = result.current.addNotification({ type: 'warning', title: 'W', message: 'M' });
    });

    expect(result.current.notifications).toHaveLength(1);

    act(() => {
      result.current.dismiss(id!);
    });

    expect(result.current.notifications).toHaveLength(0);
  });

  it('caps notifications at 50', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      for (let i = 0; i < 60; i++) {
        result.current.addNotification({ type: 'info', title: `N${i}`, message: 'M' });
      }
    });

    expect(result.current.notifications).toHaveLength(50);
  });

  it('prepends new notifications (most recent first)', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.addNotification({ type: 'info', title: 'First', message: 'M' });
      result.current.addNotification({ type: 'info', title: 'Second', message: 'M' });
    });

    expect(result.current.notifications[0].title).toBe('Second');
    expect(result.current.notifications[1].title).toBe('First');
  });
});
