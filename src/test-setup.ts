import '@testing-library/jest-dom';

// Mock socket.io-client
vi.mock('socket.io-client', () => {
  const mockSocket = {
    connected: false,
    on: vi.fn(),
    onAny: vi.fn(),
    off: vi.fn(),
    offAny: vi.fn(),
    disconnect: vi.fn(),
    emit: vi.fn(),
  };
  return {
    io: vi.fn(() => mockSocket),
  };
});

// Mock import.meta.env
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: 'http://localhost:4000',
    VITE_WS_URL: 'http://localhost:4000',
  },
  writable: true,
});
