class WebSocketService {
    constructor(url = 'ws://localhost:5000/ws') {
        Object.defineProperty(this, "ws", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "url", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "messageHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "statusHandlers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
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
        Object.defineProperty(this, "reconnectDelay", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 3000
        });
        Object.defineProperty(this, "reconnectTimeout", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "heartbeatInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        this.url = url;
        this.initializeEventHandlers();
    }
    initializeEventHandlers() {
        // Initialize message type handlers
        const types = ['alert', 'stats', 'status', 'error'];
        types.forEach((type) => {
            this.messageHandlers.set(type, new Set());
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            try {
                this.notifyStatusHandlers('connecting');
                this.ws = new WebSocket(this.url);
                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    this.reconnectAttempts = 0;
                    this.notifyStatusHandlers('connected');
                    this.startHeartbeat();
                    resolve();
                };
                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleMessage(message);
                    }
                    catch (error) {
                        console.error('Error parsing WebSocket message:', error);
                    }
                };
                this.ws.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this.notifyStatusHandlers('error');
                    reject(error);
                };
                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    this.notifyStatusHandlers('disconnected');
                    this.stopHeartbeat();
                    this.attemptReconnect();
                };
            }
            catch (error) {
                this.notifyStatusHandlers('error');
                reject(error);
            }
        });
    }
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            this.reconnectTimeout = setTimeout(() => {
                this.connect().catch((error) => {
                    console.error('Reconnect failed:', error);
                });
            }, this.reconnectDelay * this.reconnectAttempts);
        }
        else {
            console.error('Max reconnection attempts reached');
            this.notifyStatusHandlers('error');
        }
    }
    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'ping' }));
            }
        }, 30000); // Heartbeat every 30 seconds
    }
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    handleMessage(message) {
        const handlers = this.messageHandlers.get(message.type);
        if (handlers) {
            handlers.forEach((handler) => {
                try {
                    handler(message);
                }
                catch (error) {
                    console.error('Error in message handler:', error);
                }
            });
        }
    }
    notifyStatusHandlers(status) {
        this.statusHandlers.forEach((handler) => {
            try {
                handler(status);
            }
            catch (error) {
                console.error('Error in status handler:', error);
            }
        });
    }
    // Subscribe to message types
    on(type, handler) {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, new Set());
        }
        this.messageHandlers.get(type).add(handler);
        // Return unsubscribe function
        return () => {
            this.messageHandlers.get(type)?.delete(handler);
        };
    }
    // Subscribe to connection status changes
    onStatusChange(handler) {
        this.statusHandlers.add(handler);
        return () => {
            this.statusHandlers.delete(handler);
        };
    }
    // Send message to server
    send(message) {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
        else {
            console.warn('WebSocket is not connected');
        }
    }
    // Subscribe to specific alert
    subscribeToAlerts(callback) {
        return this.on('alert', (message) => {
            callback(message.data);
        });
    }
    // Subscribe to stats updates
    subscribeToStats(callback) {
        return this.on('stats', (message) => {
            callback(message.data);
        });
    }
    // Disconnect
    disconnect() {
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }
    isConnected() {
        return this.ws ? this.ws.readyState === WebSocket.OPEN : false;
    }
}
export default new WebSocketService();
//# sourceMappingURL=websocket.js.map