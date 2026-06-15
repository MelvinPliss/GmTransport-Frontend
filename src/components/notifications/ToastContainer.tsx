import React, { useEffect, useState } from 'react';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { Notification } from '../../types';

interface ToastProps {
  notification: Notification;
  onDismiss: (id: string) => void;
}

const ICONS = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const COLORS = {
  success: {
    bg: 'var(--color-emerald-glow)',
    border: 'rgba(52,211,153,0.35)',
    icon: 'var(--color-emerald-400)',
  },
  error: {
    bg: 'var(--color-red-glow)',
    border: 'rgba(248,113,113,0.35)',
    icon: 'var(--color-red-400)',
  },
  warning: {
    bg: 'rgba(251,191,36,0.12)',
    border: 'rgba(251,191,36,0.35)',
    icon: 'var(--color-amber-400)',
  },
  info: {
    bg: 'var(--color-indigo-glow)',
    border: 'rgba(129,140,248,0.35)',
    icon: 'var(--color-indigo-400)',
  },
};

const AUTO_DISMISS_MS = 5000;

function Toast({ notification, onDismiss }: ToastProps) {
  const [visible, setVisible] = useState(true);
  const Icon = ICONS[notification.type];
  const colors = COLORS[notification.type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDismiss(notification.id), 300);
    }, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [notification.id, onDismiss]);

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        padding: '14px 16px',
        background: 'var(--color-surface)',
        border: `1px solid ${colors.border}`,
        borderLeft: `3px solid ${colors.icon}`,
        borderRadius: 'var(--radius-md)',
        boxShadow: 'var(--shadow-elevated)',
        backdropFilter: 'blur(8px)',
        minWidth: 300,
        maxWidth: 400,
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(110%)',
        transition: 'opacity 0.3s ease, transform 0.3s cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <Icon size={18} color={colors.icon} style={{ flexShrink: 0, marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, color: 'var(--color-text-primary)' }}>
          {notification.title}
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
          {notification.message}
        </div>
      </div>
      <button
        onClick={() => {
          setVisible(false);
          setTimeout(() => onDismiss(notification.id), 300);
        }}
        aria-label="Cerrar notificación"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          padding: 2,
          flexShrink: 0,
          lineHeight: 0,
        }}
      >
        <X size={13} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ notifications, onDismiss }: ToastContainerProps) {
  // Show only unread toasts (last 3 max)
  const toasts = notifications.filter((n) => !n.read).slice(0, 3);

  return (
    <div
      aria-label="Notificaciones"
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        pointerEvents: toasts.length ? 'auto' : 'none',
      }}
    >
      {toasts.map((n) => (
        <Toast key={n.id} notification={n} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
