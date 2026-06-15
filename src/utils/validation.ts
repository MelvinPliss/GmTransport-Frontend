import { z } from 'zod';

function luhnCheck(cardNumber: string): boolean {
  const digits = cardNumber.replace(/\s/g, '').split('').reverse().map(Number);
  const sum = digits.reduce((acc, digit, i) => {
    if (i % 2 === 1) {
      const doubled = digit * 2;
      return acc + (doubled > 9 ? doubled - 9 : doubled);
    }
    return acc + digit;
  }, 0);
  return sum % 10 === 0;
}

export const subscriptionSchema = z.object({
  userId: z
    .string()
    .min(1, 'El ID de usuario es requerido')
    .regex(/^\d+$/, 'El ID de usuario debe ser numérico'),
  email: z
    .string()
    .min(1, 'El correo es requerido')
    .email('Correo electrónico inválido'),
  plan: z.enum(['monthly', 'annual'], {
    errorMap: () => ({ message: 'Selecciona un plan válido' }),
  }),
  paymentMethod: z.enum(['CREDIT_CARD', 'DEBIT_CARD', 'PAYPAL'], {
    errorMap: () => ({ message: 'Selecciona un método de pago' }),
  }),
  cardNumber: z
    .string()
    .min(1, 'El número de tarjeta es requerido')
    .transform((v) => v.replace(/\s/g, ''))
    .refine((v) => /^\d{16}$/.test(v), 'Debe contener exactamente 16 dígitos')
    // .refine((v) => luhnCheck(v), 'Número de tarjeta inválido'),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

export function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();
}

export function maskCardNumber(cardNumber: string): string {
  const clean = cardNumber.replace(/\s/g, '');
  return `**** **** **** ${clean.slice(-4)}`;
}

export function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'kind' in error) {
    const apiError = error as { kind: string; message?: string };
    switch (apiError.kind) {
      case 'timeout':
        return 'La solicitud tardó demasiado. Verifica tu conexión e intenta de nuevo.';
      case 'network':
        return 'Sin conexión al servidor. Verifica tu red.';
      case 'server':
        return apiError.message ?? 'Error del servidor.';
      default:
        return apiError.message ?? 'Error desconocido.';
    }
  }
  return 'Ocurrió un error inesperado.';
}
