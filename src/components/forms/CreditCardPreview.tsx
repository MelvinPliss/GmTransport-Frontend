import React from 'react';

interface CreditCardPreviewProps {
  cardNumber: string;
  email?: string;
}

export const CreditCardPreview = React.memo(({ cardNumber, email }: CreditCardPreviewProps) => {
  const formatted = cardNumber.replace(/\D/g, '').padEnd(16, '•');
  const display = formatted.match(/.{1,4}/g)?.join(' ') ?? '•••• •••• •••• ••••';

  return (
    <div
      style={{
        width: '100%',
        aspectRatio: '1.586',
        borderRadius: 16,
        background: 'linear-gradient(135deg, #312e81 0%, #4338ca 40%, #6366f1 100%)',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(99,102,241,0.4), 0 2px 8px rgba(0,0,0,0.4)',
        userSelect: 'none',
      }}
      role="img"
      aria-label={`Vista previa de tarjeta terminada en ${formatted.slice(-4)}`}
    >
      {/* Decorative circles */}
      <div
        style={{
          position: 'absolute',
          top: -40,
          right: -40,
          width: 180,
          height: 180,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.06)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: -60,
          left: -20,
          width: 220,
          height: 220,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)',
        }}
      />

      {/* Chip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div
          style={{
            width: 44,
            height: 34,
            borderRadius: 6,
            background: 'linear-gradient(135deg, #fbbf24, #d97706)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: 28,
              height: 20,
              borderRadius: 3,
              border: '1.5px solid rgba(0,0,0,0.2)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gridTemplateRows: '1fr 1fr',
              gap: 1,
              padding: 2,
            }}
          >
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ background: 'rgba(0,0,0,0.15)', borderRadius: 1 }} />
            ))}
          </div>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, fontWeight: 700, letterSpacing: 1 }}>
          VISA
        </span>
      </div>

      {/* Card number */}
      <div style={{ letterSpacing: '0.15em', fontSize: 20, fontFamily: 'var(--font-mono)', color: '#fff', fontWeight: 500 }}>
        {display}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
            Titular
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>
            {email ? email.split('@')[0].toUpperCase().slice(0, 20) : 'NOMBRE TITULAR'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>
            Vence
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', fontFamily: 'var(--font-mono)' }}>
            12/28
          </div>
        </div>
      </div>
    </div>
  );
});
CreditCardPreview.displayName = 'CreditCardPreview';
