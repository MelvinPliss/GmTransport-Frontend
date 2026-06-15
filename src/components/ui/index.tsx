import React from 'react';
import { Loader2, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-react';

/* ─── Button ─── */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

const btnBase: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  fontWeight: 500,
  fontFamily: 'var(--font-sans)',
  borderRadius: 'var(--radius-md)',
  cursor: 'pointer',
  transition: 'background var(--transition-fast), opacity var(--transition-fast), box-shadow var(--transition-fast)',
  border: 'none',
  outline: 'none',
  userSelect: 'none',
  whiteSpace: 'nowrap',
};

const btnVariants: Record<string, React.CSSProperties> = {
  primary: {
    background: 'var(--color-indigo-600)',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(99,102,241,0.35)',
  },
  secondary: {
    background: 'var(--color-surface-2)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-border)',
    boxShadow: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    boxShadow: 'none',
  },
  danger: {
    background: 'var(--color-red-500)',
    color: '#fff',
    boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
  },
};

const btnSizes: Record<string, React.CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 13 },
  md: { padding: '9px 16px', fontSize: 14 },
  lg: { padding: '12px 24px', fontSize: 15 },
};

export const Button = React.memo(
  ({ variant = 'primary', size = 'md', loading, disabled, children, style, ...rest }: ButtonProps) => {
    const [hovered, setHovered] = React.useState(false);

    const hoverOverlay: React.CSSProperties = hovered && !disabled && !loading
      ? { filter: 'brightness(1.12)' }
      : {};

    return (
      <button
        style={{
          ...btnBase,
          ...btnVariants[variant],
          ...btnSizes[size],
          opacity: disabled || loading ? 0.5 : 1,
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          ...hoverOverlay,
          ...style,
        }}
        disabled={disabled || loading}
        aria-busy={loading}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        {...rest}
      >
        {loading && (
          <Loader2
            size={16}
            style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

/* ─── Badge ─── */
type BadgeVariant = 'active' | 'expired' | 'CANCELLED' | 'info';

const badgeStyles: Record<BadgeVariant, React.CSSProperties> = {
  active:   { background: 'rgba(16,185,129,0.15)',  color: 'var(--color-emerald-400)', border: '1px solid rgba(52,211,153,0.3)' },
  expired:  { background: 'rgba(251,191,36,0.12)',  color: 'var(--color-amber-400)',   border: '1px solid rgba(251,191,36,0.3)' },
  CANCELLED: { background: 'rgba(239,68,68,0.12)',   color: 'var(--color-red-400)',     border: '1px solid rgba(248,113,113,0.3)' },
  info:     { background: 'rgba(99,102,241,0.15)',  color: 'var(--color-indigo-400)',  border: '1px solid rgba(129,140,248,0.3)' },
};

export function Badge({ variant, children }: { variant: BadgeVariant; children: React.ReactNode }) {
  return (
    <span
      style={{
        ...badgeStyles[variant],
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 999,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'currentColor',
          display: 'inline-block',
          flexShrink: 0,
        }}
      />
      {children}
    </span>
  );
}

/* ─── Card ─── */
export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-card)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Spinner ─── */
export function Spinner({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 0.8s linear infinite', flexShrink: 0 }}
      aria-label="Cargando"
    >
      <circle cx="12" cy="12" r="10" stroke="var(--color-border)" strokeWidth="2" />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="var(--color-indigo-500)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ─── Input ─── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, ...rest }, ref) => {
    const inputId = id ?? `input-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const [focused, setFocused] = React.useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label
          htmlFor={inputId}
          style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)' }}
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          style={{
            background: 'var(--color-surface-2)',
            border: `1px solid ${error ? 'var(--color-red-500)' : focused ? 'var(--color-indigo-500)' : 'var(--color-border)'}`,
            boxShadow: focused && !error ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            color: 'var(--color-text-primary)',
            fontSize: 14,
            outline: 'none',
            width: '100%',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            fontFamily: 'var(--font-sans)',
          }}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          {...rest}
        />
        {error && (
          <span id={`${inputId}-error`} role="alert" style={{ fontSize: 12, color: 'var(--color-red-400)', display: 'flex', alignItems: 'center', gap: 4 }}>
            ⚠ {error}
          </span>
        )}
        {hint && !error && (
          <span id={`${inputId}-hint`} style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{hint}</span>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

/* ─── Select ─── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, id, ...rest }, ref) => {
    const selectId = id ?? `select-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const [focused, setFocused] = React.useState(false);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor={selectId} style={{ fontSize: 13, fontWeight: 500, color: 'var(--color-text-secondary)' }}>
          {label}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={!!error}
          style={{
            background: 'var(--color-surface-2)',
            border: `1px solid ${error ? 'var(--color-red-500)' : focused ? 'var(--color-indigo-500)' : 'var(--color-border)'}`,
            boxShadow: focused ? '0 0 0 3px rgba(99,102,241,0.15)' : 'none',
            borderRadius: 'var(--radius-md)',
            padding: '10px 14px',
            color: 'var(--color-text-primary)',
            fontSize: 14,
            outline: 'none',
            width: '100%',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
          }}
          onFocus={(e) => { setFocused(true); rest.onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); rest.onBlur?.(e); }}
          {...rest}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} style={{ background: 'var(--color-surface)', color: 'var(--color-text-primary)' }}>
              {o.label}
            </option>
          ))}
        </select>
        {error && (
          <span role="alert" style={{ fontSize: 12, color: 'var(--color-red-400)' }}>⚠ {error}</span>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

/* ─── Empty State ─── */
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div style={{
      textAlign: 'center',
      padding: '56px 24px',
      color: 'var(--color-text-secondary)',
    }}>
      <div style={{ fontSize: 48, marginBottom: 16, lineHeight: 1 }}>📋</div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: 'var(--color-text-primary)' }}>{title}</h3>
      {description && (
        <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: 24 }}>{description}</p>
      )}
      {action}
    </div>
  );
}

/* ─── Error Alert ─── */
export function ErrorAlert({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      style={{
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(248,113,113,0.35)',
        borderLeft: '3px solid var(--color-red-500)',
        borderRadius: 'var(--radius-md)',
        padding: '14px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <AlertCircle size={16} color="var(--color-red-400)" style={{ flexShrink: 0 }} />
        <span style={{ color: 'var(--color-red-400)', fontSize: 14 }}>{message}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            background: 'none',
            border: '1px solid var(--color-red-400)',
            borderRadius: 6,
            color: 'var(--color-red-400)',
            fontSize: 12,
            padding: '5px 12px',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Reintentar
        </button>
      )}
    </div>
  );
}
