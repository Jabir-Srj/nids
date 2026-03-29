import { io } from 'socket.io-client';
export class WebSocketClient {
    constructor(url = window.location.origin) {
        Object.defineProperty(this, "url", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: url
        });
        Object.defineProperty(this, "socket", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "isConnected", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "reconnectAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "maxReconnectAttempts", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5
        });
    }
    connect() {
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
            }
            catch (error) {
                reject(error);
            }
        });
    }
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.isConnected = false;
        }
    }
    subscribe(topic) {
        if (!this.socket) {
            console.error('[WebSocket] Not connected');
            return;
        }
        console.log(`[WebSocket] Subscribing to ${topic}`);
        this.socket.emit('subscribe', { topic });
    }
    unsubscribe(topic) {
        if (!this.socket) {
            console.error('[WebSocket] Not connected');
            return;
        }
        console.log(`[WebSocket] Unsubscribing from ${topic}`);
        this.socket.emit('unsubscribe', { topic });
    }
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
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
    once(event, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }
    off(event, callback) {
        if (this.listeners.has(event)) {
            const listeners = this.listeners.get(event);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    emit(event, data) {
        const listeners = this.listeners.get(event) || [];
        listeners.forEach((callback) => {
            try {
                callback(data);
            }
            catch (error) {
                console.error(`[WebSocket] Error in listener for ${event}:`, error);
            }
        });
    }
    isConnected_() {
        return this.isConnected;
    }
    getSocket() {
        return this.socket;
    }
}
// Global instance
let wsClient = null;
export function getWebSocketClient() {
    if (!wsClient) {
        wsClient = new WebSocketClient();
    }
    return wsClient;
}
export function initWebSocket() {
    const client = getWebSocketClient();
    return client.connect();
}
export function disconnectWebSocket() {
    if (wsClient) {
        wsClient.disconnect();
    }
}
//# sourceMappingURL=websocket.js.map