import { useEffect, useRef, useCallback, useState } from 'react';
import { getWebSocketClient } from '../utils/websocket';
export function useWebSocket(options = {}) {
    const { onConnect, onDisconnect, onError, autoConnect = true, subscribe = [], } = options;
    const [isConnected, setIsConnected] = useState(false);
    const unsubscribesRef = useRef([]);
    const clientRef = useRef(getWebSocketClient());
    const handleConnect = useCallback(() => {
        setIsConnected(true);
        onConnect?.();
        // Subscribe to topics
        subscribe.forEach((topic) => {
            clientRef.current.subscribe(topic);
        });
    }, [onConnect, subscribe]);
    const handleDisconnect = useCallback(() => {
        setIsConnected(false);
        onDisconnect?.();
    }, [onDisconnect]);
    const handleError = useCallback((error) => {
        onError?.(error);
    }, [onError]);
    useEffect(() => {
        const client = clientRef.current;
        if (autoConnect && !client.isConnected_()) {
            client.connect().catch((error) => {
                console.error('[useWebSocket] Failed to connect:', error);
                handleError(error);
            });
        }
        // Listen for connection events
        const unsubConnect = client.on('connected', handleConnect);
        const unsubDisconnect = client.on('disconnected', handleDisconnect);
        const unsubError = client.on('error', handleError);
        return () => {
            unsubConnect();
            unsubDisconnect();
            unsubError();
        };
    }, [autoConnect, handleConnect, handleDisconnect, handleError]);
    const on = useCallback((event, callback) => {
        const unsub = clientRef.current.on(event, callback);
        unsubscribesRef.current.push(unsub);
        return unsub;
    }, []);
    const subscribe_ = useCallback((topic) => {
        clientRef.current.subscribe(topic);
    }, []);
    const unsubscribe = useCallback((topic) => {
        clientRef.current.unsubscribe(topic);
    }, []);
    const disconnect = useCallback(() => {
        clientRef.current.disconnect();
    }, []);
    useEffect(() => {
        return () => {
            // Cleanup all listeners on unmount
            unsubscribesRef.current.forEach((unsub) => unsub());
        };
    }, []);
    return {
        isConnected,
        on,
        subscribe: subscribe_,
        unsubscribe,
        disconnect,
        client: clientRef.current,
    };
}
//# sourceMappingURL=useWebSocket.js.map