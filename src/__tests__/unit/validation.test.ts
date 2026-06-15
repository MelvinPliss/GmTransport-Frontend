import { describe, it, expect } from 'vitest';
import { subscriptionSchema, formatCardNumber, maskCardNumber, getErrorMessage } from '../../utils/validation';

describe('subscriptionSchema', () => {
  const validData = {
    userId: '1',
    email: 'test@example.com',
    plan: 'monthly' as const,
    paymentMethod: 'CREDIT_CARD' as const,
    cardNumber: '4111111111111111',
  };

  it('validates correct data', () => {
    const result = subscriptionSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('rejects empty userId', () => {
    const result = subscriptionSchema.safeParse({ ...validData, userId: '' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('requerido');
    }
  });

  it('rejects non-numeric userId', () => {
    const result = subscriptionSchema.safeParse({ ...validData, userId: 'abc' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = subscriptionSchema.safeParse({ ...validData, email: 'not-an-email' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('inválido');
    }
  });

  it('rejects card number shorter than 16 digits', () => {
    const result = subscriptionSchema.safeParse({ ...validData, cardNumber: '411111111111' });
    expect(result.success).toBe(false);
  });

  it('rejects card number that fails Luhn check', () => {
    const result = subscriptionSchema.safeParse({ ...validData, cardNumber: '4111111111111112' });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('inválido');
    }
  });

  it('accepts card number with spaces (formatted)', () => {
    const result = subscriptionSchema.safeParse({ ...validData, cardNumber: '4111 1111 1111 1111' });
    expect(result.success).toBe(true);
  });

  it('rejects invalid plan', () => {
    const result = subscriptionSchema.safeParse({ ...validData, plan: 'weekly' as 'monthly' });
    expect(result.success).toBe(false);
  });
});

describe('formatCardNumber', () => {
  it('formats 16 digits into groups of 4', () => {
    expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
  });

  it('strips non-digit characters', () => {
    expect(formatCardNumber('4111-1111-1111-1111')).toBe('4111 1111 1111 1111');
  });

  it('limits to 16 digits', () => {
    expect(formatCardNumber('41111111111111119999')).toBe('4111 1111 1111 1111');
  });

  it('handles empty string', () => {
    expect(formatCardNumber('')).toBe('');
  });

  it('handles partial input', () => {
    expect(formatCardNumber('4111')).toBe('4111');
    expect(formatCardNumber('41111')).toBe('4111 1');
  });
});

describe('maskCardNumber', () => {
  it('masks all but last 4 digits', () => {
    expect(maskCardNumber('4111111111111111')).toBe('**** **** **** 1111');
  });

  it('handles formatted input with spaces', () => {
    expect(maskCardNumber('4111 1111 1111 4243')).toBe('**** **** **** 4243');
  });
});

describe('getErrorMessage', () => {
  it('returns timeout message for timeout errors', () => {
    const msg = getErrorMessage({ kind: 'timeout', message: 'timeout' });
    expect(msg).toContain('tardó demasiado');
  });

  it('returns network message for network errors', () => {
    const msg = getErrorMessage({ kind: 'network', message: 'network' });
    expect(msg).toContain('Sin conexión');
  });

  it('returns server message for server errors', () => {
    const msg = getErrorMessage({ kind: 'server', message: 'Internal Server Error', status: 500 });
    expect(msg).toBe('Internal Server Error');
  });

  it('returns fallback for unknown errors', () => {
    const msg = getErrorMessage(new Error('something'));
    expect(msg).toContain('inesperado');
  });
});
