import { WebSocketMessage, Alert, DashboardStats } from '../types';
type MessageHandler = (message: WebSocketMessage) => void;
type ConnectionStatusHandler = (status: 'connecting' | 'connected' | 'disconnected' | 'error') => void;
declare class WebSocketService {
    private ws;
    private url;
    private messageHandlers;
    private statusHandlers;
    private reconnectAttempts;
    private maxReconnectAttempts;
    private reconnectDelay;
    private reconnectTimeout;
    private heartbeatInterval;
    constructor(url?: string);
    private initializeEventHandlers;
    connect(): Promise<void>;
    private attemptReconnect;
    private startHeartbeat;
    private stopHeartbeat;
    private handleMessage;
    private notifyStatusHandlers;
    on(type: string, handler: MessageHandler): () => void;
    onStatusChange(handler: ConnectionStatusHandler): () => void;
    send(message: any): void;
    subscribeToAlerts(callback: (alert: Alert) => void): () => void;
    subscribeToStats(callback: (stats: DashboardStats) => void): () => void;
    disconnect(): void;
    isConnected(): boolean;
}
declare const _default: WebSocketService;
export default _default;
//# sourceMappingURL=websocket.d.ts.map