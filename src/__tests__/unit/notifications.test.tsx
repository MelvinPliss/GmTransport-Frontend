import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { ToastContainer } from '../../components/notifications/ToastContainer';
import { NotificationPanel } from '../../components/notifications/NotificationPanel';
import { Notification } from '../../types';

const makeNotif = (overrides?: Partial<Notification>): Notification => ({
  id: 'n-1',
  type: 'success',
  title: 'Pago confirmado',
  message: 'Suscripción activada exitosamente',
  timestamp: new Date('2026-06-14T10:00:00Z'),
  read: false,
  ...overrides,
});

describe('ToastContainer', () => {
  it('renders nothing when there are no unread notifications', () => {
    render(<ToastContainer notifications={[]} onDismiss={vi.fn()} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders a toast for an unread notification', () => {
    const notif = makeNotif();
    render(<ToastContainer notifications={[notif]} onDismiss={vi.fn()} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Pago confirmado')).toBeInTheDocument();
    expect(screen.getByText('Suscripción activada exitosamente')).toBeInTheDocument();
  });

  it('does not render read notifications', () => {
    const notif = makeNotif({ read: true });
    render(<ToastContainer notifications={[notif]} onDismiss={vi.fn()} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('renders at most 3 toasts', () => {
    const notifs = [1, 2, 3, 4].map((i) =>
      makeNotif({ id: `n-${i}`, title: `Notif ${i}` })
    );
    render(<ToastContainer notifications={notifs} onDismiss={vi.fn()} />);
    expect(screen.getAllByRole('alert')).toHaveLength(3);
  });

  it('calls onDismiss when close button is clicked', () => {
    const onDismiss = vi.fn();
    const notif = makeNotif();
    render(<ToastContainer notifications={[notif]} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: /Cerrar/i }));
    // onDismiss is called after transition (300ms), so we check eventually
    setTimeout(() => expect(onDismiss).toHaveBeenCalledWith('n-1'), 400);
  });

  it('renders error type toast', () => {
    const notif = makeNotif({ type: 'error', title: 'Error de pago' });
    render(<ToastContainer notifications={[notif]} onDismiss={vi.fn()} />);
    expect(screen.getByText('Error de pago')).toBeInTheDocument();
  });

  it('renders warning type toast', () => {
    const notif = makeNotif({ type: 'warning', title: 'Suscripción expirando' });
    render(<ToastContainer notifications={[notif]} onDismiss={vi.fn()} />);
    expect(screen.getByText('Suscripción expirando')).toBeInTheDocument();
  });

  it('renders info type toast', () => {
    const notif = makeNotif({ type: 'info', title: 'Información' });
    render(<ToastContainer notifications={[notif]} onDismiss={vi.fn()} />);
    expect(screen.getByText('Información')).toBeInTheDocument();
  });
});

describe('NotificationPanel', () => {
  const defaultProps = {
    notifications: [],
    unreadCount: 0,
    onDismiss: vi.fn(),
    onMarkAllRead: vi.fn(),
    wsConnected: true,
  };

  it('renders bell button', () => {
    render(<NotificationPanel {...defaultProps} />);
    expect(screen.getByRole('button', { name: /Notificaciones/i })).toBeInTheDocument();
  });

  it('opens panel on bell click', () => {
    render(<NotificationPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Notificaciones/i }));
    expect(screen.getByText('Sin notificaciones aún')).toBeInTheDocument();
  });

  it('shows unread badge count', () => {
    render(<NotificationPanel {...defaultProps} unreadCount={3} />);
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('shows 9+ for more than 9 unread', () => {
    render(<NotificationPanel {...defaultProps} unreadCount={12} />);
    expect(screen.getByText('9+')).toBeInTheDocument();
  });

  it('renders notification items in panel', () => {
    const notifs = [
      makeNotif({ title: 'Primera notificación' }),
      makeNotif({ id: 'n-2', title: 'Segunda notificación' }),
    ];
    render(<NotificationPanel {...defaultProps} notifications={notifs} unreadCount={2} />);
    fireEvent.click(screen.getByRole('button', { name: /Notificaciones/i }));
    expect(screen.getByText('Primera notificación')).toBeInTheDocument();
    expect(screen.getByText('Segunda notificación')).toBeInTheDocument();
  });

  it('calls onMarkAllRead when button is clicked', () => {
    const onMarkAllRead = vi.fn();
    render(
      <NotificationPanel {...defaultProps} unreadCount={2} onMarkAllRead={onMarkAllRead} />
    );
    fireEvent.click(screen.getByRole('button', { name: /Notificaciones/i }));
    fireEvent.click(screen.getByText(/Marcar todo leído/i));
    expect(onMarkAllRead).toHaveBeenCalled();
  });

  it('calls onDismiss when X is clicked on a notification', () => {
    const onDismiss = vi.fn();
    const notifs = [makeNotif()];
    render(
      <NotificationPanel {...defaultProps} notifications={notifs} unreadCount={1} onDismiss={onDismiss} />
    );
    fireEvent.click(screen.getByRole('button', { name: /Notificaciones/i }));
    fireEvent.click(screen.getByRole('button', { name: /Descartar/i }));
    expect(onDismiss).toHaveBeenCalledWith('n-1');
  });

  it('closes panel on Escape key', async () => {
    render(<NotificationPanel {...defaultProps} />);
    fireEvent.click(screen.getByRole('button', { name: /Notificaciones/i }));
    expect(screen.getByText('Sin notificaciones aún')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => {
      expect(screen.queryByText('Sin notificaciones aún')).not.toBeInTheDocument();
    });
  });

  it('shows WS connected indicator', () => {
    render(<NotificationPanel {...defaultProps} wsConnected={true} />);
    fireEvent.click(screen.getByRole('button', { name: /Notificaciones/i }));
    const dot = document.querySelector('[title="WebSocket conectado"]');
    expect(dot).toBeInTheDocument();
  });

  it('shows WS disconnected indicator', () => {
    render(<NotificationPanel {...defaultProps} wsConnected={false} />);
    fireEvent.click(screen.getByRole('button', { name: /Notificaciones/i }));
    const dot = document.querySelector('[title="WebSocket desconectado"]');
    expect(dot).toBeInTheDocument();
  });
});
