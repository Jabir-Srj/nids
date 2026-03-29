"""
NIDS REST API
Flask-based API for managing packet capture and threat detection
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import logging
from typing import Dict, List, Any

api_bp = Blueprint('api', __name__)
logger = logging.getLogger(__name__)

# Global state (in production, use proper state management)
_capture_engine = None
_rule_engine = None
_anomaly_detector = None
_alerts_db = []
_packets_db = []

# ============================================
# ALERT ENDPOINTS
# ============================================

@api_bp.route('/alerts', methods=['GET'])
def get_alerts():
    """Get alerts with optional filtering"""
    try:
        limit = request.args.get('limit', 50, type=int)
        severity = request.args.get('severity', None)
        threat_type = request.args.get('threat_type', None)
        
        alerts = _alerts_db.copy()
        
        if severity:
            alerts = [a for a in alerts if a.get('severity') == severity]
        if threat_type:
            alerts = [a for a in alerts if a.get('threat_type') == threat_type]
        
        # Sort by timestamp descending
        alerts.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify({
            'status': 'success',
            'count': len(alerts),
            'alerts': alerts[:limit]
        }), 200
    
    except Exception as e:
        logger.error(f"Error fetching alerts: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@api_bp.route('/alerts/<alert_id>', methods=['GET'])
def get_alert(alert_id):
    """Get specific alert details"""
    try:
        alert = next((a for a in _alerts_db if a['alert_id'] == alert_id), None)
        if not alert:
            return jsonify({'status': 'error', 'message': 'Alert not found'}), 404
        
        return jsonify({'status': 'success', 'alert': alert}), 200
    
    except Exception as e:
        logger.error(f"Error fetching alert: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@api_bp.route('/alerts', methods=['POST'])
def filter_alerts():
    """Filter alerts with complex criteria"""
    try:
        data = request.get_json()
        src_ip = data.get('src_ip')
        dst_ip = data.get('dst_ip')
        severity = data.get('severity')
        date_from = data.get('date_from')
        date_to = data.get('date_to')
        limit = data.get('limit', 100)
        
        alerts = _alerts_db.copy()
        
        if src_ip:
            alerts = [a for a in alerts if a['src_ip'] == src_ip]
        if dst_ip:
            alerts = [a for a in alerts if a['dst_ip'] == dst_ip]
        if severity:
            alerts = [a for a in alerts if a['severity'] == severity]
        
        # Date filtering
        if date_from:
            alerts = [a for a in alerts if a['timestamp'] >= date_from]
        if date_to:
            alerts = [a for a in alerts if a['timestamp'] <= date_to]
        
        alerts.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify({
            'status': 'success',
            'count': len(alerts),
            'alerts': alerts[:limit]
        }), 200
    
    except Exception as e:
        logger.error(f"Error filtering alerts: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@api_bp.route('/alerts/<alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    """Delete specific alert"""
    try:
        global _alerts_db
        initial_count = len(_alerts_db)
        _alerts_db = [a for a in _alerts_db if a['alert_id'] != alert_id]
        
        if len(_alerts_db) == initial_count:
            return jsonify({'status': 'error', 'message': 'Alert not found'}), 404
        
        return jsonify({'status': 'success', 'message': 'Alert deleted'}), 200
    
    except Exception as e:
        logger.error(f"Error deleting alert: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ============================================
# STATISTICS ENDPOINTS
# ============================================

@api_bp.route('/stats/overview', methods=['GET'])
def stats_overview():
    """Get dashboard overview statistics"""
    try:
        severity_counts = {}
        for severity in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']:
            severity_counts[severity] = len([a for a in _alerts_db if a.get('severity') == severity])
        
        threat_types = {}
        for alert in _alerts_db:
            threat = alert.get('threat_type', 'Unknown')
            threat_types[threat] = threat_types.get(threat, 0) + 1
        
        return jsonify({
            'status': 'success',
            'total_alerts': len(_alerts_db),
            'total_packets': len(_packets_db),
            'severity_distribution': severity_counts,
            'threat_types': threat_types,
            'capture_status': 'running' if _capture_engine and _capture_engine.is_capturing else 'stopped',
        }), 200
    
    except Exception as e:
        logger.error(f"Error getting overview: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@api_bp.route('/stats/threats', methods=['GET'])
def stats_threats():
    """Get threat breakdown"""
    try:
        threats = {}
        for alert in _alerts_db:
            threat = alert.get('threat_type', 'Unknown')
            if threat not in threats:
                threats[threat] = {'count': 0, 'severity': []}
            threats[threat]['count'] += 1
            threats[threat]['severity'].append(alert.get('severity', 'UNKNOWN'))
        
        return jsonify({
            'status': 'success',
            'threats': threats
        }), 200
    
    except Exception as e:
        logger.error(f"Error getting threats: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@api_bp.route('/stats/ips', methods=['GET'])
def stats_ips():
    """Get top attacking IPs"""
    try:
        ip_counts = {}
        for alert in _alerts_db:
            src_ip = alert.get('src_ip')
            ip_counts[src_ip] = ip_counts.get(src_ip, 0) + 1
        
        top_ips = sorted(ip_counts.items(), key=lambda x: x[1], reverse=True)[:20]
        
        return jsonify({
            'status': 'success',
            'top_ips': [{'ip': ip, 'count': count} for ip, count in top_ips]
        }), 200
    
    except Exception as e:
        logger.error(f"Error getting IPs: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@api_bp.route('/stats/protocols', methods=['GET'])
def stats_protocols():
    """Get protocol statistics"""
    try:
        protocols = {}
        for packet in _packets_db:
            proto = packet.get('protocol', 'Unknown')
            protocols[proto] = protocols.get(proto, 0) + 1
        
        return jsonify({
            'status': 'success',
            'protocols': protocols
        }), 200
    
    except Exception as e:
        logger.error(f"Error getting protocols: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ============================================
# CAPTURE ENDPOINTS
# ============================================

@api_bp.route('/capture/start', methods=['POST'])
def start_capture():
    """Start packet capture"""
    try:
        if not _capture_engine:
            return jsonify({'status': 'error', 'message': 'Capture engine not initialized'}), 500
        
        data = request.get_json() or {}
        interface = data.get('interface', 'eth0')
        bpf_filter = data.get('filter', '')
        
        _capture_engine.start_live_capture(interface, bpf_filter)
        
        return jsonify({
            'status': 'success',
            'message': f'Capture started on {interface}',
            'interface': interface,
            'filter': bpf_filter
        }), 200
    
    except Exception as e:
        logger.error(f"Error starting capture: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@api_bp.route('/capture/stop', methods=['POST'])
def stop_capture():
    """Stop packet capture"""
    try:
        if not _capture_engine:
            return jsonify({'status': 'error', 'message': 'Capture engine not initialized'}), 500
        
        stats = _capture_engine.get_stats()
        _capture_engine.stop_capture()
        
        return jsonify({
            'status': 'success',
            'message': 'Capture stopped',
            'stats': stats
        }), 200
    
    except Exception as e:
        logger.error(f"Error stopping capture: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@api_bp.route('/capture/status', methods=['GET'])
def capture_status():
    """Get capture status"""
    try:
        if not _capture_engine:
            return jsonify({'status': 'error', 'message': 'Capture engine not initialized'}), 500
        
        stats = _capture_engine.get_stats()
        
        return jsonify({
            'status': 'success',
            'capture_status': stats
        }), 200
    
    except Exception as e:
        logger.error(f"Error getting capture status: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@api_bp.route('/capture/upload-pcap', methods=['POST'])
def upload_pcap():
    """Upload and analyze PCAP file"""
    try:
        if 'file' not in request.files:
            return jsonify({'status': 'error', 'message': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'status': 'error', 'message': 'No file selected'}), 400
        
        if not file.filename.endswith('.pcap'):
            return jsonify({'status': 'error', 'message': 'File must be .pcap format'}), 400
        
        # Save and process
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.pcap', delete=False) as tmp:
            file.save(tmp.name)
            
            if not _capture_engine:
                return jsonify({'status': 'error', 'message': 'Capture engine not initialized'}), 500
            
            packets = _capture_engine.load_pcap_file(tmp.name)
            
            return jsonify({
                'status': 'success',
                'message': f'Loaded {len(packets)} packets',
                'packet_count': len(packets)
            }), 200
    
    except Exception as e:
        logger.error(f"Error uploading PCAP: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ============================================
# EXPORT ENDPOINTS
# ============================================

@api_bp.route('/export/alerts', methods=['GET'])
def export_alerts():
    """Export alerts in various formats"""
    try:
        format_type = request.args.get('format', 'json')  # json, csv, pdf
        
        if format_type == 'json':
            return jsonify({
                'status': 'success',
                'format': 'json',
                'alerts': _alerts_db
            }), 200
        
        elif format_type == 'csv':
            import csv
            import io
            output = io.StringIO()
            if _alerts_db:
                writer = csv.DictWriter(output, fieldnames=_alerts_db[0].keys())
                writer.writeheader()
                writer.writerows(_alerts_db)
            return output.getvalue(), 200, {'Content-Disposition': 'attachment; filename=alerts.csv'}
        
        else:
            return jsonify({'status': 'error', 'message': f'Format {format_type} not supported'}), 400
    
    except Exception as e:
        logger.error(f"Error exporting alerts: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


@api_bp.route('/export/report', methods=['GET'])
def export_report():
    """Generate comprehensive security report"""
    try:
        report = {
            'generated_at': datetime.now().isoformat(),
            'summary': {
                'total_alerts': len(_alerts_db),
                'total_packets': len(_packets_db),
                'analysis_duration': '24 hours',
            },
            'alerts': _alerts_db,
            'statistics': {
                'by_severity': {},
                'by_threat_type': {},
            }
        }
        
        # Add severity breakdown
        for severity in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
            report['statistics']['by_severity'][severity] = len([
                a for a in _alerts_db if a.get('severity') == severity
            ])
        
        # Add threat type breakdown
        for alert in _alerts_db:
            threat = alert.get('threat_type', 'Unknown')
            report['statistics']['by_threat_type'][threat] = report['statistics']['by_threat_type'].get(threat, 0) + 1
        
        return jsonify(report), 200
    
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ============================================
# HEALTH CHECK
# ============================================

@api_bp.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'version': '1.0.0',
        'timestamp': datetime.now().isoformat(),
    }), 200


def init_api(capture_engine, rule_engine, anomaly_detector):
    """Initialize API with engine instances"""
    global _capture_engine, _rule_engine, _anomaly_detector
    _capture_engine = capture_engine
    _rule_engine = rule_engine
    _anomaly_detector = anomaly_detector
    logger.info("✅ API initialized with engines")
