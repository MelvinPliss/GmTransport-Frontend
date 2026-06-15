import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Dashboard } from '../../components/dashboard/Dashboard';
import * as useSubscriptionsHook from '../../hooks/useSubscriptions';
import { Subscription } from '../../types';

vi.mock('../../hooks/useSubscriptions');
const mockUseSubscriptions = vi.mocked(useSubscriptionsHook.useSubscriptions);

const mockSubscriptions: Subscription[] = [
  {
    id: 'sub-1',
    userId: '1',
    email: 'alice@example.com',
    plan: 'monthly',
    status: 'ACTIVE',
    payment: { method: 'CREDIT_CARD', maskedIdentifier: '**** **** **** 1111' },
    createdAt: '2026-06-01T00:00:00Z',
    expiresAt: '2026-07-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  },
  {
    id: 'sub-2',
    userId: '2',
    email: 'bob@example.com',
    plan: 'annual',
    status: 'EXPIRED',
    payment: { method: 'DEBIT_CARD', maskedIdentifier: '**** **** **** 2222' },
    createdAt: '2025-06-01T00:00:00Z',
    expiresAt: '2026-06-01T00:00:00Z',
    updatedAt: '2026-06-01T00:00:00Z',
  },
];

describe('Dashboard', () => {
  beforeEach(() => {
    mockUseSubscriptions.mockReturnValue({
      subscriptions: mockSubscriptions,
      loading: false,
      error: null,
      refetch: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('renders stats correctly', () => {
    render(<Dashboard />);
    // Total = 2, Active = 1
    const allNumbers = screen.getAllByText(/^\d+$/);
    const values = allNumbers.map((el) => el.textContent);
    expect(values).toContain('2');
    expect(values).toContain('1');
  });

  it('renders subscription cards', () => {
    render(<Dashboard />);
    expect(screen.getByText(/alice@example.com/)).toBeInTheDocument();
    expect(screen.getByText(/bob@example.com/)).toBeInTheDocument();
  });

  it('shows loading spinner while loading', () => {
    mockUseSubscriptions.mockReturnValue({
      subscriptions: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
    });
    render(<Dashboard />);
    expect(screen.getByLabelText(/Cargando/i)).toBeInTheDocument();
  });

  it('shows error state with retry button', () => {
    mockUseSubscriptions.mockReturnValue({
      subscriptions: [],
      loading: false,
      error: { kind: 'network', message: 'Sin conexión' },
      refetch: vi.fn(),
    });
    render(<Dashboard />);
    expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
  });

  it('filters subscriptions by status', async () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByRole('button', { name: /Activas/i }));
    await waitFor(() => {
      expect(screen.getByText(/alice@example.com/)).toBeInTheDocument();
      expect(screen.queryByText(/bob@example.com/)).not.toBeInTheDocument();
    });
  });

  it('shows empty state when no subscriptions match filter', async () => {
    render(<Dashboard />);
    fireEvent.click(screen.getByRole('button', { name: /Canceladas/i }));
    await waitFor(() => {
      expect(screen.getByText(/Sin suscripciones/i)).toBeInTheDocument();
    });
  });

  it('calls refetch when refresh button is clicked', async () => {
    const refetch = vi.fn().mockResolvedValue(undefined);
    mockUseSubscriptions.mockReturnValue({
      subscriptions: mockSubscriptions,
      loading: false,
      error: null,
      refetch,
    });
    render(<Dashboard />);
    // Find by aria-label set on the refresh button
    const refreshBtn = screen.getByRole('button', { name: /Recargar suscripciones/i });
    fireEvent.click(refreshBtn);
    await waitFor(() => {
      expect(refetch).toHaveBeenCalled();
    });
  });
});
