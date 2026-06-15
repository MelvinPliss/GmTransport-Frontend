import { io, Socket } from 'socket.io-client';
import { WebSocketMessage } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:4000';

type MessageHandler = (msg: WebSocketMessage) => void;
type StatusHandler = (connected: boolean) => void;

export class SocketService {
  private socket: Socket | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private statusHandlers: Set<StatusHandler> = new Set();

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(WS_URL, {
      // path: '/notifications',
      // transports: ['websocket', 'polling'],
      transports: ["websocket"], // fuerza WebSocket
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
    });

    this.socket.on('connect', () => {
      this.notifyStatus(true);
    });

    this.socket.on('disconnect', () => {
      this.notifyStatus(false);
    });

    this.socket.on('connect_error', () => {
      this.notifyStatus(false);
    });

    // Escucha el evento genérico del servidor
    this.socket.onAny((event: string, data: unknown) => {
      // Soporte para mensajes tipados: { type, id } o el evento como type
      let msg: WebSocketMessage | null = null;

      if (data && typeof data === 'object' && 'type' in data) {
        msg = data as WebSocketMessage;
      } else if (event === 'PAYMENT_SUCCESS' || event === 'PAYMENT_FAILED' || event === 'SUBSCRIPTION_CANCELLED' 
        || event === 'SUBSCRIPTION_EXPIRED') {
        msg = { type: event as WebSocketMessage['type'], id: (data as { id?: string })?.id ?? '' };
      }

      if (msg) {
        this.messageHandlers.forEach((h) => h(msg!));
      }
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  onMessage(handler: MessageHandler): () => void {
    this.messageHandlers.add(handler);
    return () => this.messageHandlers.delete(handler);
  }

  onStatusChange(handler: StatusHandler): () => void {
    this.statusHandlers.add(handler);
    return () => this.statusHandlers.delete(handler);
  }

  get isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  private notifyStatus(connected: boolean): void {
    this.statusHandlers.forEach((h) => h(connected));
  }
}

export const wsService = new SocketService();
