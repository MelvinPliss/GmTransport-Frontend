import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SocketService } from '../../services/websocketService';

// Mock socket.io-client
const mockSocket = {
  connected: false,
  on: vi.fn(),
  onAny: vi.fn(),
  off: vi.fn(),
  disconnect: vi.fn(),
};

vi.mock('socket.io-client', () => ({
  io: vi.fn(() => mockSocket),
}));

describe('SocketService', () => {
  let service: SocketService;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSocket.connected = false;
    service = new SocketService();
  });

  it('starts disconnected', () => {
    expect(service.isConnected).toBe(false);
  });

  it('calls io() on connect()', async () => {
    const { io } = await import('socket.io-client');
    service.connect();
    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ reconnection: true })
    );
  });

  it('registers connect/disconnect/connect_error listeners on connect()', async () => {
    service.connect();
    const events = mockSocket.on.mock.calls.map((c) => c[0]);
    expect(events).toContain('connect');
    expect(events).toContain('disconnect');
    expect(events).toContain('connect_error');
  });

  it('notifies status handlers on connect event', () => {
    const handler = vi.fn();
    service.onStatusChange(handler);
    service.connect();

    // Simulate the 'connect' event
    const connectCall = mockSocket.on.mock.calls.find((c) => c[0] === 'connect');
    connectCall?.[1]();
    expect(handler).toHaveBeenCalledWith(true);
  });

  it('notifies status handlers on disconnect event', () => {
    const handler = vi.fn();
    service.onStatusChange(handler);
    service.connect();

    const disconnectCall = mockSocket.on.mock.calls.find((c) => c[0] === 'disconnect');
    disconnectCall?.[1]();
    expect(handler).toHaveBeenCalledWith(false);
  });

  it('routes onAny message with type field to message handlers', () => {
    const msgHandler = vi.fn();
    service.onMessage(msgHandler);
    service.connect();

    const onAnyCall = mockSocket.onAny.mock.calls[0];
    const onAnyFn = onAnyCall?.[0];
    onAnyFn?.('someEvent', { type: 'PAYMENT_SUCCESS', id: 'abc-123' });

    expect(msgHandler).toHaveBeenCalledWith({ type: 'PAYMENT_SUCCESS', id: 'abc-123' });
  });

  it('routes named event (PAYMENT_SUCCESS) without type field', () => {
    const msgHandler = vi.fn();
    service.onMessage(msgHandler);
    service.connect();

    const onAnyFn = mockSocket.onAny.mock.calls[0]?.[0];
    onAnyFn?.('PAYMENT_SUCCESS', { id: 'abc-123' });

    expect(msgHandler).toHaveBeenCalledWith({ type: 'PAYMENT_SUCCESS', id: 'abc-123' });
  });

  it('unsubscribes message handler', () => {
    const handler = vi.fn();
    const unsub = service.onMessage(handler);
    unsub();

    service.connect();
    const onAnyFn = mockSocket.onAny.mock.calls[0]?.[0];
    onAnyFn?.('PAYMENT_SUCCESS', { id: 'x' });

    expect(handler).not.toHaveBeenCalled();
  });

  it('calls socket.disconnect() on service.disconnect()', () => {
    service.connect();
    service.disconnect();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });

  it('does not reconnect if already connected', async () => {
    mockSocket.connected = true;
    const { io } = await import('socket.io-client');
    vi.mocked(io).mockClear();

    // Simulate socket already attached and connected
    service.connect();
    service.connect(); // second call should be no-op
    expect(io).toHaveBeenCalledTimes(1);
  });
});
