import React, { useEffect, useRef } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Notification } from '../../types';

interface NotificationPanelProps {
  notifications: Notification[];
  unreadCount: number;
  onDismiss: (id: string) => void;
  onMarkAllRead: () => void;
  wsConnected: boolean;
}

const typeIcon: Record<Notification['type'], string> = {
  success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️',
};

export function NotificationPanel({ notifications, unreadCount, onDismiss, onMarkAllRead, wsConnected }: NotificationPanelProps) {
  const [open, setOpen] = React.useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notificaciones${unreadCount > 0 ? `, ${unreadCount} sin leer` : ''}`}
        aria-expanded={open}
        style={{
          position: 'relative',
          background: open ? 'var(--color-surface-2)' : 'transparent',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: '8px 10px',
          cursor: 'pointer',
          color: 'var(--color-text-secondary)',
          display: 'flex',
          alignItems: 'center',
          transition: 'background 150ms ease',
          lineHeight: 0,
        }}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 4, right: 4,
            width: 17, height: 17,
            background: 'var(--color-indigo-500)',
            borderRadius: '50%',
            fontSize: 10, fontWeight: 700, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '2px solid var(--color-bg)',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: 'calc(100% + 8px)',
          width: 360,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-elevated)',
          zIndex: 100,
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease',
        }}>
          {/* Panel header */}
          <div style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--color-border-subtle)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-text-primary)' }}>Notificaciones</span>
              <span style={{
                width: 8, height: 8, borderRadius: '50%',
                background: wsConnected ? 'var(--color-emerald-400)' : 'var(--color-red-400)',
                display: 'inline-block',
                boxShadow: wsConnected ? '0 0 6px var(--color-emerald-400)' : 'none',
              }}
              title={wsConnected ? 'WebSocket conectado' : 'WebSocket desconectado'}
              />
            </div>
            {unreadCount > 0 && (
              <button onClick={onMarkAllRead} style={{
                background: 'none', border: 'none',
                color: 'var(--color-indigo-400)', fontSize: 12,
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                fontFamily: 'var(--font-sans)',
              }}>
                <CheckCheck size={13} />
                Marcar todo leído
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ maxHeight: 380, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '36px 24px', textAlign: 'center', color: 'var(--color-text-muted)', fontSize: 14 }}>
                Sin notificaciones aún
              </div>
            ) : (
              notifications.map((n) => (
                <div key={n.id} style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid var(--color-border-subtle)',
                  background: n.read ? 'transparent' : 'rgba(99,102,241,0.04)',
                  display: 'flex', gap: 10, alignItems: 'flex-start',
                }}>
                  <span style={{ fontSize: 15, flexShrink: 0, marginTop: 1 }}>{typeIcon[n.type]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 2, color: 'var(--color-text-primary)' }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 4, lineHeight: 1.5 }}>{n.message}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>
                      {format(n.timestamp, "HH:mm · d MMM", { locale: es })}
                    </div>
                  </div>
                  <button onClick={() => onDismiss(n.id)} aria-label="Descartar notificación" style={{
                    background: 'none', border: 'none',
                    color: 'var(--color-text-muted)', cursor: 'pointer', padding: 2, flexShrink: 0, lineHeight: 0,
                  }}>
                    <X size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
