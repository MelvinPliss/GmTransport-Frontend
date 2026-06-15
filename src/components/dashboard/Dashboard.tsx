import React, { useState, useMemo, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { useSubscriptions } from '../../hooks/useSubscriptions';
import { SubscriptionStatus } from '../../types';
import { Button, Spinner, EmptyState, ErrorAlert } from '../ui';
import { SubscriptionCard } from './SubscriptionCard';
import { useSubscriptionsContext } from '../../contexts/suscriptionsContext';

const STATUS_FILTERS: Array<{ value: SubscriptionStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Todas' },
  { value: 'ACTIVE', label: 'Activas' },
  { value: 'EXPIRED', label: 'Expiradas' },
  { value: 'CANCELLED', label: 'Canceladas' },
];

interface DashboardProps { highlightedId?: string; }

export function Dashboard({ highlightedId }: DashboardProps) {
  // const { subscriptions, loading, error, refetch } = useSubscriptions();
  const { subscriptions, loading, error, refetch } = useSubscriptionsContext();

  const [filter, setFilter] = useState<SubscriptionStatus | 'ALL'>('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const filtered = useMemo(
    () => filter === 'ALL' ? subscriptions : subscriptions.filter((s) => s.status === filter),
    [subscriptions, filter]
  );

  const stats = useMemo(() => ({
    total: subscriptions.length,
    active: subscriptions.filter((s) => s.status === 'ACTIVE').length,
    expired: subscriptions.filter((s) => s.status === 'EXPIRED').length,
    CANCELLED: subscriptions.filter((s) => s.status === 'CANCELLED').length,
  }), [subscriptions]);

  return (
    <div>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        <StatCard label="Total" value={stats.total} color="var(--color-indigo-400)" />
        <StatCard label="Activas" value={stats.active} color="var(--color-emerald-400)" />
        <StatCard label="Expiradas" value={stats.expired} color="var(--color-amber-400)" />
        <StatCard label="Canceladas" value={stats.CANCELLED} color="var(--color-red-400)" />
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text-primary)', margin: 0 }}>
          Suscripciones
          {!loading && (
            <span style={{ fontSize: 13, fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 8 }}>
              ({filtered.length})
            </span>
          )}
        </h2>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Filter pills */}
          <div style={{
            display: 'flex', gap: 3,
            background: 'var(--color-surface)',
            padding: 4, borderRadius: 'var(--radius-md)',
            border: '1px solid var(--color-border)',
          }}>
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                style={{
                  padding: '5px 14px',
                  borderRadius: 7,
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: 'var(--font-sans)',
                  transition: 'all 150ms ease',
                  background: filter === f.value ? 'var(--color-indigo-600)' : 'transparent',
                  color: filter === f.value ? '#fff' : 'var(--color-text-secondary)',
                  boxShadow: filter === f.value ? '0 2px 6px rgba(99,102,241,0.3)' : 'none',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            loading={refreshing}
            aria-label="Recargar suscripciones"
          >
            <RefreshCw size={14} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
          <Spinner size={36} />
        </div>
      ) : error ? (
        <ErrorAlert
          message={
            error.kind === 'network' ? 'Sin conexión al servidor. Verifica que el backend esté corriendo.' :
            error.kind === 'timeout' ? 'El servidor tardó demasiado. Intenta de nuevo.' :
            'Error al cargar las suscripciones.'
          }
          onRetry={handleRefresh}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={filter === 'ALL' ? 'Sin suscripciones' : `Sin suscripciones ${filter.toLowerCase()}`}
          description={filter === 'ALL' ? 'Crea tu primera suscripción usando el formulario.' : 'Prueba con otro filtro.'}
          action={filter !== 'ALL' ? (
            <Button variant="ghost" size="sm" onClick={() => setFilter('ALL')}>Ver todas</Button>
          ) : undefined}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {filtered.map((sub) => (
            <SubscriptionCard key={sub.id} subscription={sub} highlighted={sub.id === highlightedId} />
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{
      background: 'var(--color-surface)',
      border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px 22px',
      display: 'flex', flexDirection: 'column', gap: 6,
    }}>
      <span style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500 }}>
        {label}
      </span>
      <span style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{value}</span>
    </div>
  );
}
