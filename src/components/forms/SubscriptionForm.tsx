import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle, AlertCircle, X } from 'lucide-react';
import { subscriptionSchema, SubscriptionFormData, formatCardNumber, getErrorMessage } from '../../utils/validation';
import { subscriptionService } from '../../services/subscriptionService';
import { Button, Input, Select, Card } from '../ui';
import { CreditCardPreview } from './CreditCardPreview';
import { ApiError } from '../../types';

interface SubscriptionFormProps {
  onSuccess?: (subscriptionId: string) => void;
}

type FormState = 'idle' | 'submitting' | 'success' | 'error';

export function SubscriptionForm({ onSuccess }: SubscriptionFormProps) {
  const [formState, setFormState] = useState<FormState>('idle');
  const [serverError, setServerError] = useState<string>('');
  const [createdId, setCreatedId] = useState<string>('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: { plan: 'monthly', paymentMethod: 'CREDIT_CARD', userId: '1' },
    mode: 'onBlur',
  });

  const cardNumber = watch('cardNumber') ?? '';
  const email = watch('email') ?? '';

  const handleCardInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue('cardNumber', formatCardNumber(e.target.value), { shouldValidate: true });
    },
    [setValue]
  );

  const onSubmit = async (data: SubscriptionFormData) => {
    if (formState === 'submitting') return;
    setFormState('submitting');
    setServerError('');
    try {
      const res = await subscriptionService.create({
        userId: data.userId,
        email: data.email,
        plan: data.plan,
        paymentMethod: data.paymentMethod,
        cardNumber: data.cardNumber.replace(/\s/g, ''),
      });
      setCreatedId(res.data.subscriptionId);
      setFormState('success');
      onSuccess?.(res.data.subscriptionId);
    } catch (err) {
      setServerError(getErrorMessage(err as ApiError));
      setFormState('error');
    }
  };

  const handleReset = () => {
    reset();
    setFormState('idle');
    setServerError('');
    setCreatedId('');
  };

  if (formState === 'success') {
    return (
      <Card>
        <div style={{ padding: 48, textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'rgba(16,185,129,0.15)',
            border: '1px solid rgba(52,211,153,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 24px',
          }}>
            <CheckCircle size={40} color="var(--color-emerald-400)" />
          </div>
          <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10, color: 'var(--color-text-primary)' }}>
            ¡Suscripción activada!
          </h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 12 }}>
            Tu suscripción fue procesada correctamente.
          </p>
          <p style={{
            fontFamily: 'var(--font-mono)', fontSize: 12,
            color: 'var(--color-text-muted)',
            background: 'var(--color-surface-2)',
            padding: '6px 14px', borderRadius: 6,
            display: 'inline-block', marginBottom: 32,
            border: '1px solid var(--color-border)',
          }}>
            ID: {createdId}
          </p>
          <div>
            <Button onClick={handleReset} variant="secondary">Nueva suscripción</Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div style={{ padding: '28px 32px' }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: 'var(--color-text-primary)' }}>
          Nueva Suscripción
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 14, marginBottom: 28 }}>
          Completa los datos para activar tu plan
        </p>

        <div style={{ marginBottom: 28 }}>
          <CreditCardPreview cardNumber={cardNumber} email={email} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Input label="ID de Usuario" type="text" error={errors.userId?.message} {...register('userId')} />
              <Input label="Correo Electrónico" type="email" placeholder="usuario@ejemplo.com" error={errors.email?.message} {...register('email')} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <Select label="Plan" error={errors.plan?.message}
                options={[{ value: 'monthly', label: 'Mensual' }, { value: 'annual', label: 'Anual' }]}
                {...register('plan')} />
              <Select label="Método de Pago" error={errors.paymentMethod?.message}
                options={[
                  { value: 'CREDIT_CARD', label: 'Tarjeta de Crédito' },
                  { value: 'DEBIT_CARD', label: 'Tarjeta de Débito' },
                  { value: 'PAYPAL', label: 'PayPal' },
                ]}
                {...register('paymentMethod')} />
            </div>

            <Input
              label="Número de Tarjeta"
              type="text"
              inputMode="numeric"
              placeholder="0000 0000 0000 0000"
              maxLength={19}
              error={errors.cardNumber?.message}
              hint="16 dígitos"
              value={cardNumber}
              onChange={handleCardInput}
            />

            {serverError && (
              <div role="alert" style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(248,113,113,0.35)',
                borderLeft: '3px solid var(--color-red-500)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 16px',
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <AlertCircle size={16} color="var(--color-red-400)" style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 14, color: 'var(--color-red-400)', flex: 1 }}>{serverError}</span>
                <button type="button" onClick={() => setServerError('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-red-400)', padding: 0, lineHeight: 0 }}>
                  <X size={14} />
                </button>
              </div>
            )}

            <Button type="submit" size="lg" loading={isSubmitting || formState === 'submitting'} style={{ marginTop: 4, width: '100%' }}>
              {formState === 'submitting' ? 'Procesando pago…' : 'Activar Suscripción'}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
