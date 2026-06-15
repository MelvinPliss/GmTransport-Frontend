import { useState, useCallback } from 'react';
import { Notification } from '../types';

let idCounter = 0;
const genId = () => `notif-${++idCounter}-${Date.now()}`;

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback(
    (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const full: Notification = {
        ...notif,
        id: genId(),
        timestamp: new Date(),
        read: false,
      };
      setNotifications((prev) => [full, ...prev].slice(0, 50));
      return full.id;
    },
    []
  );

  const markRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return { notifications, addNotification, markRead, markAllRead, dismiss, unreadCount };
}
