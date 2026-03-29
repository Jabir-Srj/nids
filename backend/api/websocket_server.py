"""
WebSocket Real-Time Alert Streaming
"""

import json
import asyncio
from typing import Set, Callable
from datetime import datetime
from flask import Blueprint, request
from flask_socketio import SocketIO, emit, join_room, leave_room

ws_bp = Blueprint('websocket', __name__)

class WebSocketManager:
    """Manage WebSocket connections for real-time updates"""
    
    def __init__(self, socketio):
        self.socketio = socketio
        self.connections: Set[str] = set()
        self.rooms = {
            'alerts': set(),
            'packets': set(),
            'metrics': set(),
            'all': set(),
        }
    
    def broadcast_alert(self, alert_data):
        """Broadcast new alert to connected clients"""
        self.socketio.emit('new_alert', {
            'alert': alert_data,
            'timestamp': datetime.utcnow().isoformat(),
            'type': 'alert',
        }, room='alerts')
        
        self.socketio.emit('new_alert', {
            'alert': alert_data,
            'timestamp': datetime.utcnow().isoformat(),
            'type': 'alert',
        }, room='all')
    
    def broadcast_metrics(self, metrics_data):
        """Broadcast system metrics"""
        self.socketio.emit('metrics_update', {
            'metrics': metrics_data,
            'timestamp': datetime.utcnow().isoformat(),
        }, room='metrics')
        
        self.socketio.emit('metrics_update', {
            'metrics': metrics_data,
            'timestamp': datetime.utcnow().isoformat(),
        }, room='all')
    
    def broadcast_packet(self, packet_data):
        """Broadcast packet capture data"""
        self.socketio.emit('packet_captured', {
            'packet': packet_data,
            'timestamp': datetime.utcnow().isoformat(),
        }, room='packets')
    
    def broadcast_status(self, status_data):
        """Broadcast system status"""
        self.socketio.emit('status_update', {
            'status': status_data,
            'timestamp': datetime.utcnow().isoformat(),
        }, room='all')

# Initialize WebSocket manager
socketio = SocketIO(cors_allowed_origins="*")
ws_manager = WebSocketManager(socketio)

@socketio.on('connect')
def handle_connect():
    """Handle client connection"""
    print(f"Client connected: {request.sid}")
    emit('connection_response', {'data': 'Connected to NIDS WebSocket'})

@socketio.on('disconnect')
def handle_disconnect():
    """Handle client disconnection"""
    print(f"Client disconnected: {request.sid}")

@socketio.on('join_room')
def on_join(data):
    """Join WebSocket room (alerts, packets, metrics)"""
    room = data.get('room', 'all')
    join_room(room)
    if room in ws_manager.rooms:
        ws_manager.rooms[room].add(request.sid)
    emit('room_joined', {'room': room, 'status': 'success'})

@socketio.on('leave_room')
def on_leave(data):
    """Leave WebSocket room"""
    room = data.get('room', 'all')
    leave_room(room)
    if room in ws_manager.rooms:
        ws_manager.rooms[room].discard(request.sid)
    emit('room_left', {'room': room, 'status': 'success'})

@socketio.on('request_metrics')
def handle_metrics_request():
    """Client requests current metrics"""
    from detection.rule_engine import RuleEngine
    from capture.packet_capture import PacketCaptureEngine
    
    rule_engine = RuleEngine()
    capture_engine = PacketCaptureEngine()
    
    emit('metrics_response', {
        'rules_loaded': len(rule_engine.get_rules()),
        'packets_captured': capture_engine.get_stats().packets_captured,
        'capture_rate': capture_engine.get_stats().packets_per_second,
    })
