import React, { useState, useCallback, lazy, Suspense } from 'react';
import { useNotifications } from './hooks/useNotifications';
import { useWebSocket } from './hooks/useWebSocket';
import { useSubscriptions } from './hooks/useSubscriptions';
import { WebSocketMessage } from './types';
import { NotificationPanel } from './components/notifications/NotificationPanel';
import { ToastContainer } from './components/notifications/ToastContainer';
import { Spinner } from './components/ui';
import { useSubscriptionsContext } from './contexts/suscriptionsContext';

const SubscriptionForm = lazy(() =>
  import('./components/forms/SubscriptionForm').then((m) => ({ default: m.SubscriptionForm }))
);
const Dashboard = lazy(() =>
  import('./components/dashboard/Dashboard').then((m) => ({ default: m.Dashboard }))
);

type Tab = 'form' | 'dashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [highlightedId, setHighlightedId] = useState<string | undefined>();
  const { notifications, addNotification, markAllRead, dismiss, unreadCount } = useNotifications();
  const { refetch } = useSubscriptionsContext();

  const handleWsMessage = useCallback(
    (msg: WebSocketMessage) => {
      if (msg.type === 'PAYMENT_SUCCESS') {
        addNotification({ type: 'success', title: '¡Pago confirmado!', message: `Suscripción ${msg.id.slice(0, 8)}… activada.` });
        refetch();
      } else if (msg.type === 'PAYMENT_FAILED') {
        addNotification({ type: 'error', title: 'Pago fallido', message: `No se pudo procesar el pago ${msg.id.slice(0, 8)}….` });
      } else if (msg.type === 'SUBSCRIPTION_CANCELLED') {
        addNotification({ type: 'info', title: 'Suscripción cancelada', message: `La suscripción ${msg.id.slice(0, 8)}… se cancelo.` });
        refetch();
      } else if (msg.type === 'SUBSCRIPTION_EXPIRED') {
        addNotification({ type: 'warning', title: 'Suscripción expirada', message: `La suscripción ${msg.id.slice(0, 8)}… expiró.` });
        refetch();
      }
    },
    [addNotification, refetch]
  );

  const { connected: wsConnected } = useWebSocket({ onMessage: handleWsMessage });

  const handleFormSuccess = useCallback(
    (subscriptionId: string) => {
      addNotification({ type: 'success', title: 'Suscripción creada', message: `ID: ${subscriptionId.slice(0, 8)}…` });
      setHighlightedId(subscriptionId);
      setActiveTab('dashboard');
      refetch();
      // setTimeout(() => setHighlightedId(undefined), 4000);
    },
    [addNotification, refetch]
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--color-bg)' }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--color-border)',
        background: 'rgba(17,24,39,0.92)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '0 24px',
          height: 60,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <div style={{
              width: 34,
              height: 34,
              borderRadius: 9,
              background: 'linear-gradient(135deg, var(--color-indigo-600), var(--color-indigo-400))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 17,
              boxShadow: '0 2px 10px rgba(99,102,241,0.4)',
            }}>⚡</div>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em', color: 'var(--color-text-primary)' }}>
              SubsManager
            </span>
          </div>

          {/* Nav */}
          <nav style={{
            display: 'flex',
            gap: 4,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: 4,
          }}>
            {(['dashboard', 'form'] as Tab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 7,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 150ms ease',
                  background: activeTab === tab ? 'var(--color-indigo-600)' : 'transparent',
                  color: activeTab === tab ? '#fff' : 'var(--color-text-secondary)',
                  boxShadow: activeTab === tab ? '0 2px 8px rgba(99,102,241,0.3)' : 'none',
                }}
              >
                {tab === 'dashboard' ? '📊 Dashboard' : '➕ Nueva Suscripción'}
              </button>
            ))}
          </nav>

          {/* Right side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-text-muted)' }}>
              <span style={{
                width: 7, height: 7, borderRadius: '50%',
                background: wsConnected ? 'var(--color-emerald-400)' : 'var(--color-red-400)',
                display: 'inline-block',
                boxShadow: wsConnected ? '0 0 8px var(--color-emerald-400)' : 'none',
                transition: 'all 300ms ease',
              }} />
              {wsConnected ? 'En vivo' : 'Desconectado'}
            </div>
            <NotificationPanel
              notifications={notifications}
              unreadCount={unreadCount}
              onDismiss={dismiss}
              onMarkAllRead={markAllRead}
              wsConnected={wsConnected}
            />
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, maxWidth: 1200, width: '100%', margin: '0 auto', padding: '36px 24px' }}>
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
            <Spinner size={36} />
          </div>
        }>
          {activeTab === 'form' ? (
            <div style={{ maxWidth: 560, margin: '0 auto' }}>
              <SubscriptionForm onSuccess={handleFormSuccess} />
            </div>
          ) : (
            <Dashboard highlightedId={highlightedId} />
          )}
        </Suspense>
      </main>

      <ToastContainer notifications={notifications} onDismiss={dismiss} />
    </div>
  );
}
