import { io, Socket } from 'socket.io-client';

export class WebSocketClient {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(private url: string = window.location.origin) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = io(this.url, {
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          reconnectionAttempts: this.maxReconnectAttempts,
          path: '/socket.io/',
        });

        this.socket.on('connect', () => {
          console.log('[WebSocket] Connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          this.emit('connected', {});
          resolve();
        });

        this.socket.on('disconnect', (reason) => {
          console.log('[WebSocket] Disconnected:', reason);
          this.isConnected = false;
          this.emit('disconnected', { reason });
        });

        this.socket.on('connect_error', (error) => {
          console.error('[WebSocket] Connection error:', error);
          reject(error);
        });

        this.socket.on('error', (error) => {
          console.error('[WebSocket] Error:', error);
          this.emit('error', { error });
        });

        // Forward all events
        this.socket.onAny((event, ...args) => {
          this.emit(event, args[0]);
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.isConnected = false;
    }
  }

  subscribe(topic: string): void {
    if (!this.socket) {
      console.error('[WebSocket] Not connected');
      return;
    }
    console.log(`[WebSocket] Subscribing to ${topic}`);
    this.socket.emit('subscribe', { topic });
  }

  unsubscribe(topic: string): void {
    if (!this.socket) {
      console.error('[WebSocket] Not connected');
      return;
    }
    console.log(`[WebSocket] Unsubscribing from ${topic}`);
    this.socket.emit('unsubscribe', { topic });
  }

  on(event: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  once(event: string, callback: (data: any) => void): void {
    const wrapper = (data: any) => {
      callback(data);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  off(event: string, callback: Function): void {
    if (this.listeners.has(event)) {
      const listeners = this.listeners.get(event)!;
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[WebSocket] Error in listener for ${event}:`, error);
      }
    });
  }

  isConnected_(): boolean {
    return this.isConnected;
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

// Global instance
let wsClient: WebSocketClient | null = null;

export function getWebSocketClient(): WebSocketClient {
  if (!wsClient) {
    wsClient = new WebSocketClient();
  }
  return wsClient;
}

export function initWebSocket(): Promise<void> {
  const client = getWebSocketClient();
  return client.connect();
}

export function disconnectWebSocket(): void {
  if (wsClient) {
    wsClient.disconnect();
  }
}
