import { useEffect, useState } from 'react';
import { wsService } from '../services/websocketService';
import { WebSocketMessage } from '../types';

interface UseWebSocketOptions {
  onMessage?: (msg: WebSocketMessage) => void;
}

export function useWebSocket({ onMessage }: UseWebSocketOptions = {}) {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    wsService.connect();

    const unsubStatus = wsService.onStatusChange(setConnected);
    const unsubMsg = onMessage ? wsService.onMessage(onMessage) : () => {};

    // Sync initial state
    setConnected(wsService.isConnected);

    return () => {
      unsubStatus();
      unsubMsg();
    };
  }, [onMessage]);

  return { connected };
}
