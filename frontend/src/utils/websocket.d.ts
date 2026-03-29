import { Socket } from 'socket.io-client';
export declare class WebSocketClient {
    private url;
    private socket;
    private listeners;
    private isConnected;
    private reconnectAttempts;
    private maxReconnectAttempts;
    constructor(url?: string);
    connect(): Promise<void>;
    disconnect(): void;
    subscribe(topic: string): void;
    unsubscribe(topic: string): void;
    on(event: string, callback: (data: any) => void): () => void;
    once(event: string, callback: (data: any) => void): void;
    off(event: string, callback: Function): void;
    private emit;
    isConnected_(): boolean;
    getSocket(): Socket | null;
}
export declare function getWebSocketClient(): WebSocketClient;
export declare function initWebSocket(): Promise<void>;
export declare function disconnectWebSocket(): void;
//# sourceMappingURL=websocket.d.ts.map