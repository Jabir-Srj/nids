export interface UseWebSocketOptions {
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: any) => void;
    autoConnect?: boolean;
    subscribe?: string[];
}
export declare function useWebSocket(options?: UseWebSocketOptions): {
    isConnected: boolean;
    on: (event: string, callback: (data: any) => void) => () => void;
    subscribe: (topic: string) => void;
    unsubscribe: (topic: string) => void;
    disconnect: () => void;
    client: import("../utils/websocket").WebSocketClient;
};
//# sourceMappingURL=useWebSocket.d.ts.map