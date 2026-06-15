import React from 'react';
import { Calendar, CreditCard, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Subscription, SubscriptionStatus } from '../../types';
import { Badge } from '../ui';

function statusToBadge(status: SubscriptionStatus): 'active' | 'expired' | 'CANCELLED' {
  if (status === 'ACTIVE') return 'active';
  if (status === 'EXPIRED') return 'expired';
  return 'CANCELLED';
}

function statusLabel(status: SubscriptionStatus) {
  if (status === 'ACTIVE') return 'Activa';
  if (status === 'EXPIRED') return 'Expirada';
  return 'Cancelada';
}

interface SubscriptionCardProps {
  subscription: Subscription;
  highlighted?: boolean;
}

export const SubscriptionCard = React.memo(({ subscription, highlighted }: SubscriptionCardProps) => {
  const { id, userId, email, plan, status, payment, createdAt, expiresAt } = subscription;
  const expiresDate = new Date(expiresAt);
  const isExpiringSoon = status === 'ACTIVE' && (expiresDate.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000;

  return (
    <div style={{
      background: 'var(--color-surface)',
      border: `1px solid ${highlighted ? 'var(--color-emerald-400)' : 'var(--color-border)'}`,
      borderRadius: 'var(--radius-lg)',
      boxShadow: highlighted
        ? '0 0 0 1px var(--color-emerald-400), 0 4px 20px rgba(52,211,153,0.15)'
        : 'var(--shadow-card)',
      padding: '20px 22px',
      transition: 'border-color 300ms ease, box-shadow 300ms ease',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Badge variant={statusToBadge(status)}>{statusLabel(status)}</Badge>
          {isExpiringSoon && (
            <span style={{ fontSize: 11, color: 'var(--color-amber-400)', fontWeight: 500 }}>
              ⚠ Vence pronto
            </span>
          )}
        </div>
        <span style={{
          fontSize: 11,
          fontFamily: 'var(--font-mono)',
          color: 'var(--color-text-muted)',
          background: 'var(--color-surface-2)',
          padding: '3px 8px',
          borderRadius: 5,
          border: '1px solid var(--color-border-subtle)',
          flexShrink: 0,
        }}>
          {id.slice(0, 8)}…
        </span>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--color-border-subtle)', marginBottom: 16 }} />

      {/* Info grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
        <InfoRow icon={<User size={12} />} label="Usuario" value={`#${userId}`} />
        <InfoRow icon={<CreditCard size={12} />} label="Plan" value={plan === 'monthly' ? 'Mensual' : 'Anual'} />
        <InfoRow icon={null} label="Correo" value={email} />
        <InfoRow icon={null} label="Pago" value={payment.maskedIdentifier} mono />
        <InfoRow icon={<Calendar size={12} />} label="Creado"
          value={format(new Date(createdAt), "d MMM yyyy", { locale: es })} />
        <InfoRow icon={<Calendar size={12} />} label="Vence"
          value={format(expiresDate, "d MMM yyyy", { locale: es })} accent={isExpiringSoon} />
      </div>
    </div>
  );
});
SubscriptionCard.displayName = 'SubscriptionCard';

function InfoRow({ icon, label, value, mono = false, accent = false }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  mono?: boolean;
  accent?: boolean;
}) {
  return (
    <div>
      <div style={{
        fontSize: 10,
        color: 'var(--color-text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        marginBottom: 3,
      }}>
        {icon}
        {label}
      </div>
      <div style={{
        fontSize: 13,
        fontFamily: mono ? 'var(--font-mono)' : undefined,
        color: accent ? 'var(--color-amber-400)' : 'var(--color-text-primary)',
        fontWeight: 500,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      }}>
        {value}
      </div>
    </div>
  );
}
