"""
Live Packet Capture API
REST endpoints for starting, stopping, and monitoring live packet capture
"""

from flask import Blueprint, request, jsonify, Response
from datetime import datetime, timedelta
import logging
import threading
import json
from typing import Dict, List, Any, Optional
from queue import Queue

# Import the packet capture engine
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from capture.packet_capture import PacketCaptureEngine, Packet

capture_bp = Blueprint('capture', __name__, url_prefix='/api/capture')
logger = logging.getLogger(__name__)

# Global capture engine instance
_capture_engine: Optional[PacketCaptureEngine] = None
_capture_lock = threading.Lock()
_captured_packets: List[Dict[str, Any]] = []
_threats_detected: Dict[str, int] = {}
_packet_limit = 10000  # Keep last N packets in memory


def get_capture_engine() -> PacketCaptureEngine:
    """Get or initialize the global capture engine"""
    global _capture_engine
    if _capture_engine is None:
        _capture_engine = PacketCaptureEngine(buffer_size=5000)
    return _capture_engine


@capture_bp.route('/start', methods=['POST'])
def start_capture():
    """
    Start live packet capture
    Query params:
      - interface: Network interface to capture on (default: auto)
      - filter: BPF filter (optional)
    """
    try:
        interface = request.json.get('interface', None) if request.is_json else None
        bpf_filter = request.json.get('filter', None) if request.is_json else None
        
        engine = get_capture_engine()
        
        if engine.is_capturing:
            return jsonify({
                'status': 'already_capturing',
                'message': 'Capture already in progress'
            }), 400
        
        # Start capture in background thread
        def capture_worker():
            try:
                engine.start_capture(
                    interface=interface,
                    bpf_filter=bpf_filter,
                    callback=_on_packet_captured
                )
            except Exception as e:
                logger.error(f"Capture error: {e}")
                engine.is_capturing = False
        
        thread = threading.Thread(target=capture_worker, daemon=True)
        thread.start()
        
        return jsonify({
            'status': 'success',
            'message': 'Packet capture started',
            'interface': interface or 'auto-detect',
            'filter': bpf_filter or 'none'
        }), 200
        
    except Exception as e:
        logger.error(f"Error starting capture: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@capture_bp.route('/stop', methods=['POST'])
def stop_capture():
    """Stop live packet capture"""
    try:
        engine = get_capture_engine()
        
        if not engine.is_capturing:
            return jsonify({
                'status': 'not_capturing',
                'message': 'No capture in progress'
            }), 400
        
        engine.stop_capture()
        
        return jsonify({
            'status': 'success',
            'message': 'Packet capture stopped',
            'packets_captured': engine.packet_count,
            'threats_detected': sum(_threats_detected.values())
        }), 200
        
    except Exception as e:
        logger.error(f"Error stopping capture: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@capture_bp.route('/status', methods=['GET'])
def capture_status():
    """Get current capture status and statistics"""
    try:
        engine = get_capture_engine()
        
        # Calculate packet rate (packets per second)
        packet_rate = engine.packet_count
        if hasattr(engine, 'capture_start_time') and engine.capture_start_time:
            elapsed = (datetime.now() - engine.capture_start_time).total_seconds()
            if elapsed > 0:
                packet_rate = engine.packet_count / elapsed
        
        return jsonify({
            'status': 'success',
            'is_capturing': engine.is_capturing,
            'packet_count': engine.packet_count,
            'packet_rate': round(packet_rate, 2),
            'captured_packets_stored': len(_captured_packets),
            'threats_detected': sum(_threats_detected.values()),
            'threat_breakdown': _threats_detected,
            'buffer_size': engine.buffer_size,
            'buffer_capacity': engine.buffer_size
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting capture status: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@capture_bp.route('/packets', methods=['GET'])
def get_packets():
    """
    Get captured packets with optional filtering
    Query params:
      - limit: Number of packets to return (default: 100, max: 1000)
      - offset: Pagination offset (default: 0)
      - src_ip: Filter by source IP
      - dst_ip: Filter by destination IP
      - protocol: Filter by protocol (TCP, UDP, ICMP)
      - threat_only: Return only packets with threats (true/false)
    """
    try:
        limit = min(int(request.args.get('limit', 100)), 1000)
        offset = int(request.args.get('offset', 0))
        src_ip = request.args.get('src_ip', None)
        dst_ip = request.args.get('dst_ip', None)
        protocol = request.args.get('protocol', None)
        threat_only = request.args.get('threat_only', 'false').lower() == 'true'
        
        packets = _captured_packets.copy()
        
        # Apply filters
        if src_ip:
            packets = [p for p in packets if p.get('src_ip') == src_ip]
        if dst_ip:
            packets = [p for p in packets if p.get('dst_ip') == dst_ip]
        if protocol:
            packets = [p for p in packets if p.get('protocol') == protocol]
        if threat_only:
            packets = [p for p in packets if p.get('is_threat', False)]
        
        # Sort by timestamp descending (newest first)
        packets.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        # Pagination
        total = len(packets)
        packets = packets[offset:offset + limit]
        
        return jsonify({
            'status': 'success',
            'total': total,
            'limit': limit,
            'offset': offset,
            'count': len(packets),
            'packets': packets
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching packets: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@capture_bp.route('/packets/stream', methods=['GET'])
def stream_packets():
    """
    Stream captured packets as Server-Sent Events (SSE)
    Returns latest packets as they are captured
    """
    try:
        limit = int(request.args.get('limit', 100))
        
        def generate():
            """Generate SSE events for packets"""
            last_count = 0
            while True:
                current_count = len(_captured_packets)
                
                # Send new packets since last check
                if current_count > last_count:
                    new_packets = _captured_packets[last_count:last_count + limit]
                    for packet in new_packets:
                        yield f"data: {json.dumps(packet)}\n\n"
                    last_count = current_count
                
                # Keep connection alive with heartbeat
                yield ": heartbeat\n\n"
        
        return Response(generate(), mimetype='text/event-stream',
                       headers={
                           'Cache-Control': 'no-cache',
                           'X-Accel-Buffering': 'no'
                       })
        
    except Exception as e:
        logger.error(f"Error streaming packets: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@capture_bp.route('/packets/clear', methods=['POST'])
def clear_packets():
    """Clear captured packets from memory"""
    try:
        global _captured_packets, _threats_detected
        count = len(_captured_packets)
        _captured_packets.clear()
        _threats_detected.clear()
        
        return jsonify({
            'status': 'success',
            'message': f'Cleared {count} captured packets',
            'cleared_count': count
        }), 200
        
    except Exception as e:
        logger.error(f"Error clearing packets: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


def _on_packet_captured(packet: Packet, threat_detected: bool = False, threat_type: str = None):
    """
    Callback when a packet is captured
    Called by the packet capture engine
    """
    global _captured_packets, _threats_detected
    
    try:
        packet_dict = packet.to_dict()
        packet_dict['is_threat'] = threat_detected
        packet_dict['threat_type'] = threat_type
        
        # Add to buffer (keep last N packets)
        _captured_packets.append(packet_dict)
        if len(_captured_packets) > _packet_limit:
            _captured_packets.pop(0)
        
        # Track threat type
        if threat_detected and threat_type:
            _threats_detected[threat_type] = _threats_detected.get(threat_type, 0) + 1
            
    except Exception as e:
        logger.error(f"Error processing captured packet: {e}")


logger.info("✅ Capture API blueprint initialized")
