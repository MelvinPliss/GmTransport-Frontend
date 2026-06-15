import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SubscriptionForm } from '../../components/forms/SubscriptionForm';
import * as subscriptionService from '../../services/subscriptionService';

vi.mock('../../services/subscriptionService', () => ({
  subscriptionService: {
    create: vi.fn(),
  },
}));

const mockCreate = vi.mocked(subscriptionService.subscriptionService.create);

describe('SubscriptionForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', () => {
    render(<SubscriptionForm />);
    expect(screen.getByLabelText(/ID de Usuario/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Plan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Método de Pago/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Número de Tarjeta/i)).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<SubscriptionForm />);
    expect(screen.getByRole('button', { name: /Activar Suscripción/i })).toBeInTheDocument();
  });

  it('shows validation error for empty email on blur', async () => {
    render(<SubscriptionForm />);
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    await userEvent.click(emailInput);
    await userEvent.tab();
    await waitFor(() => {
      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  it('shows error for invalid email format', async () => {
    render(<SubscriptionForm />);
    const emailInput = screen.getByLabelText(/Correo Electrónico/i);
    await userEvent.type(emailInput, 'notanemail');
    await userEvent.tab();
    await waitFor(() => {
      expect(screen.getByText(/inválido/i)).toBeInTheDocument();
    });
  });

  it('formats card number with spaces as user types', async () => {
    render(<SubscriptionForm />);
    const cardInput = screen.getByLabelText(/Número de Tarjeta/i);
    await userEvent.type(cardInput, '4111111111111111');
    await waitFor(() => {
      expect((cardInput as HTMLInputElement).value).toBe('4111 1111 1111 1111');
    });
  });

  it('calls onSuccess when submission succeeds', async () => {
    const onSuccess = vi.fn();
    mockCreate.mockResolvedValueOnce({
      success: true,
      data: { id: 'abc-123', status: 'ACTIVE', plan: 'monthly', expiresAt: '2026-07-14T00:00:00Z' },
    });

    render(<SubscriptionForm onSuccess={onSuccess} />);

    await userEvent.type(screen.getByLabelText(/Correo Electrónico/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Número de Tarjeta/i), '4111111111111111');

    fireEvent.submit(screen.getByRole('button', { name: /Activar/i }).closest('form')!);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('abc-123');
    });
  });

  it('shows success state after successful submission', async () => {
    mockCreate.mockResolvedValueOnce({
      success: true,
      data: { id: 'abc-123', status: 'ACTIVE', plan: 'monthly', expiresAt: '2026-07-14T00:00:00Z' },
    });

    render(<SubscriptionForm />);

    await userEvent.type(screen.getByLabelText(/Correo Electrónico/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Número de Tarjeta/i), '4111111111111111');

    fireEvent.submit(screen.getByRole('button', { name: /Activar/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getByText(/Suscripción activada/i)).toBeInTheDocument();
    });
  });

  it('shows error message when API call fails', async () => {
    mockCreate.mockRejectedValueOnce({ kind: 'network', message: 'Sin conexión' });

    render(<SubscriptionForm />);

    await userEvent.type(screen.getByLabelText(/Correo Electrónico/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Número de Tarjeta/i), '4111111111111111');

    fireEvent.submit(screen.getByRole('button', { name: /Activar/i }).closest('form')!);

    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  it('resets form when "Nueva suscripción" is clicked after success', async () => {
    mockCreate.mockResolvedValueOnce({
      success: true,
      data: { id: 'abc-123', status: 'ACTIVE', plan: 'monthly', expiresAt: '2026-07-14T00:00:00Z' },
    });

    render(<SubscriptionForm />);

    await userEvent.type(screen.getByLabelText(/Correo Electrónico/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Número de Tarjeta/i), '4111111111111111');

    fireEvent.submit(screen.getByRole('button', { name: /Activar/i }).closest('form')!);

    await waitFor(() => screen.getByText(/Suscripción activada/i));

    await userEvent.click(screen.getByRole('button', { name: /Nueva suscripción/i }));

    await waitFor(() => {
      expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
    });
  });
});
