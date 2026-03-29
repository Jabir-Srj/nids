"""
WebSocket Server for Real-Time Updates
Broadcast alerts, packets, and metrics to connected clients using Socket.IO
"""

from flask import Flask
from flask_socketio import SocketIO, emit, join_room, leave_room
import logging
import json
from typing import Dict, List, Any, Callable, Optional
from datetime import datetime
import threading
import queue

logger = logging.getLogger(__name__)

class WebSocketServer:
    """WebSocket server for real-time data streaming"""
    
    def __init__(self, app: Flask = None):
        """Initialize WebSocket server"""
        self.socketio = None
        self.app = app
        self.connected_clients = {}
        self.subscriptions: Dict[str, List[str]] = {
            'alerts': [],
            'packets': [],
            'metrics': [],
            'all': []
        }
        self.event_queue = queue.Queue(maxsize=1000)
        
        if app:
            self.init_app(app)
        
        logger.info("✅ WebSocket server initialized")
    
    def init_app(self, app: Flask):
        """Initialize with Flask app"""
        self.app = app
        self.socketio = SocketIO(
            app,
            cors_allowed_origins="*",
            async_mode='threading',
            ping_timeout=60,
            ping_interval=25,
            logger=True,
            engineio_logger=True
        )
        
        # Register event handlers
        self.socketio.on_event('connect', self._handle_connect)
        self.socketio.on_event('disconnect', self._handle_disconnect)
        self.socketio.on_event('subscribe', self._handle_subscribe)
        self.socketio.on_event('unsubscribe', self._handle_unsubscribe)
        
        logger.info("✅ WebSocket app initialized")
        return self.socketio
    
    def _handle_connect(self):
        """Handle client connection"""
        from flask_socketio import request
        client_id = request.sid
        self.connected_clients[client_id] = {
            'id': client_id,
            'connected_at': datetime.now().isoformat(),
            'subscriptions': []
        }
        
        logger.info(f"Client connected: {client_id}")
        emit('connection', {
            'status': 'connected',
            'client_id': client_id,
            'timestamp': datetime.now().isoformat()
        })
    
    def _handle_disconnect(self):
        """Handle client disconnection"""
        from flask_socketio import request
        client_id = request.sid
        
        if client_id in self.connected_clients:
            del self.connected_clients[client_id]
        
        # Remove from all subscriptions
        for topic in self.subscriptions.values():
            if client_id in topic:
                topic.remove(client_id)
        
        logger.info(f"Client disconnected: {client_id}")
    
    def _handle_subscribe(self, data: Dict[str, Any]):
        """Handle client subscription to topics"""
        from flask_socketio import request
        client_id = request.sid
        topic = data.get('topic', 'all')
        
        if topic not in self.subscriptions:
            self.subscriptions[topic] = []
        
        if client_id not in self.subscriptions[topic]:
            self.subscriptions[topic].append(client_id)
        
        if client_id in self.connected_clients:
            self.connected_clients[client_id]['subscriptions'].append(topic)
        
        emit('subscribe_ack', {
            'status': 'subscribed',
            'topic': topic,
            'timestamp': datetime.now().isoformat()
        })
        
        logger.info(f"Client {client_id} subscribed to {topic}")
    
    def _handle_unsubscribe(self, data: Dict[str, Any]):
        """Handle client unsubscription"""
        from flask_socketio import request
        client_id = request.sid
        topic = data.get('topic', 'all')
        
        if topic in self.subscriptions and client_id in self.subscriptions[topic]:
            self.subscriptions[topic].remove(client_id)
        
        if client_id in self.connected_clients:
            if topic in self.connected_clients[client_id]['subscriptions']:
                self.connected_clients[client_id]['subscriptions'].remove(topic)
        
        emit('unsubscribe_ack', {
            'status': 'unsubscribed',
            'topic': topic,
            'timestamp': datetime.now().isoformat()
        })
        
        logger.info(f"Client {client_id} unsubscribed from {topic}")
    
    def broadcast_alert(self, alert: Dict[str, Any], room: Optional[str] = None):
        """Broadcast alert to subscribed clients"""
        if not self.socketio:
            return
        
        data = {
            'type': 'alert',
            'data': alert,
            'timestamp': datetime.now().isoformat()
        }
        
        # Send to /alerts namespace
        self.socketio.emit(
            'alert',
            data,
            room=self.subscriptions['alerts'],
            namespace='/alerts'
        )
        
        # Also send to /all namespace
        self.socketio.emit(
            'event',
            data,
            room=self.subscriptions['all'],
            namespace='/all'
        )
        
        logger.debug(f"Alert broadcast: {len(self.subscriptions['alerts'])} recipients")
    
    def broadcast_packet(self, packet: Dict[str, Any], room: Optional[str] = None):
        """Broadcast packet to subscribed clients"""
        if not self.socketio:
            return
        
        data = {
            'type': 'packet',
            'data': packet,
            'timestamp': datetime.now().isoformat()
        }
        
        # Send to /packets namespace
        self.socketio.emit(
            'packet',
            data,
            room=self.subscriptions['packets'],
            namespace='/packets'
        )
        
        # Also send to /all namespace
        self.socketio.emit(
            'event',
            data,
            room=self.subscriptions['all'],
            namespace='/all'
        )
        
        logger.debug(f"Packet broadcast: {len(self.subscriptions['packets'])} recipients")
    
    def broadcast_metrics(self, metrics: Dict[str, Any], room: Optional[str] = None):
        """Broadcast metrics to subscribed clients"""
        if not self.socketio:
            return
        
        data = {
            'type': 'metrics',
            'data': metrics,
            'timestamp': datetime.now().isoformat()
        }
        
        # Send to /metrics namespace
        self.socketio.emit(
            'metrics',
            data,
            room=self.subscriptions['metrics'],
            namespace='/metrics'
        )
        
        # Also send to /all namespace
        self.socketio.emit(
            'event',
            data,
            room=self.subscriptions['all'],
            namespace='/all'
        )
        
        logger.debug(f"Metrics broadcast: {len(self.subscriptions['metrics'])} recipients")
    
    def broadcast_custom_event(self, event_name: str, data: Dict[str, Any], 
                              topic: str = 'all', room: Optional[str] = None):
        """Broadcast custom event to subscribed clients"""
        if not self.socketio:
            return
        
        event_data = {
            'type': event_name,
            'data': data,
            'timestamp': datetime.now().isoformat()
        }
        
        self.socketio.emit(
            event_name,
            event_data,
            room=self.subscriptions.get(topic, []),
            namespace=f'/{topic}'
        )
        
        logger.debug(f"Event '{event_name}' broadcast to {topic}")
    
    def get_connected_clients(self) -> List[Dict[str, Any]]:
        """Get list of connected clients"""
        return list(self.connected_clients.values())
    
    def get_client_count(self) -> int:
        """Get number of connected clients"""
        return len(self.connected_clients)
    
    def get_subscription_stats(self) -> Dict[str, int]:
        """Get subscription statistics"""
        return {topic: len(clients) for topic, clients in self.subscriptions.items()}


# Global instance
_ws_server: Optional[WebSocketServer] = None


def get_websocket_server() -> WebSocketServer:
    """Get or create global WebSocket server instance"""
    global _ws_server
    if _ws_server is None:
        _ws_server = WebSocketServer()
    return _ws_server


def init_websocket(app: Flask) -> WebSocketServer:
    """Initialize WebSocket server with Flask app"""
    global _ws_server
    _ws_server = WebSocketServer(app)
    return _ws_server


logger.info("✅ WebSocket module loaded")
