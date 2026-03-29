"""
Threat Intelligence Display API
REST endpoints for displaying threat intelligence data and metrics
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import logging
import sqlite3
import threading
from typing import Dict, List, Any, Tuple

threat_intel_bp = Blueprint('threat_intel', __name__, url_prefix='/api/threat-intel')
logger = logging.getLogger(__name__)

DB_PATH = 'backend/database/nids.db'
_db_lock = threading.Lock()


def _get_db():
    """Get database connection"""
    return sqlite3.connect(DB_PATH)


def _init_threat_tables():
    """Initialize threat intelligence tables"""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            # IP reputation table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS ip_reputation (
                    ip_address TEXT PRIMARY KEY,
                    threat_level TEXT,
                    last_seen TEXT,
                    incident_count INTEGER DEFAULT 0,
                    threat_types TEXT,
                    country TEXT,
                    organization TEXT
                )
            ''')
            
            # Malware indicators table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS malware_indicators (
                    indicator_id TEXT PRIMARY KEY,
                    indicator_type TEXT,
                    indicator_value TEXT,
                    malware_family TEXT,
                    severity TEXT,
                    first_seen TEXT,
                    last_seen TEXT,
                    detection_count INTEGER DEFAULT 0
                )
            ''')
            
            # Threat feeds table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS threat_feeds (
                    feed_id TEXT PRIMARY KEY,
                    feed_name TEXT,
                    threat_type TEXT,
                    entry_count INTEGER,
                    last_updated TEXT,
                    is_active BOOLEAN DEFAULT 1
                )
            ''')
            
            # Attack patterns table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS attack_patterns (
                    pattern_id TEXT PRIMARY KEY,
                    pattern_name TEXT,
                    attack_type TEXT,
                    severity TEXT,
                    indicators_count INTEGER,
                    last_detected TEXT
                )
            ''')
            
            conn.commit()
            logger.info("✅ Threat intelligence tables initialized")
    except Exception as e:
        logger.error(f"Error initializing threat tables: {e}")


@threat_intel_bp.route('/summary', methods=['GET'])
def threat_summary():
    """
    Get threat intelligence summary
    Returns: threat counts, severity distribution, top threats
    """
    try:
        _init_threat_tables()
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            
            # Get threat counts from alerts (if using alerts table)
            cursor.execute('''
                SELECT COUNT(*) as total_threats,
                       COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical,
                       COUNT(CASE WHEN severity = 'high' THEN 1 END) as high,
                       COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium,
                       COUNT(CASE WHEN severity = 'low' THEN 1 END) as low
                FROM alerts
                WHERE timestamp > datetime('now', '-24 hours')
            ''')
            threat_counts = cursor.fetchone()
            
            # Get unique threat types
            cursor.execute('''
                SELECT threat_type, COUNT(*) as count
                FROM alerts
                WHERE timestamp > datetime('now', '-24 hours')
                GROUP BY threat_type
                ORDER BY count DESC
                LIMIT 10
            ''')
            threat_types = [{'type': row[0], 'count': row[1]} for row in cursor.fetchall()]
            
            # Get malicious IPs count
            cursor.execute('SELECT COUNT(*) FROM ip_reputation WHERE threat_level IN ("high", "critical")')
            malicious_ips = cursor.fetchone()[0]
            
            # Get detected malware families
            cursor.execute('''
                SELECT COUNT(DISTINCT malware_family) FROM malware_indicators
                WHERE detection_count > 0
            ''')
            malware_families = cursor.fetchone()[0]
            
            conn.close()
        
        summary = {
            'total_threats_24h': threat_counts[0] if threat_counts else 0,
            'critical_threats': threat_counts[1] if threat_counts else 0,
            'high_threats': threat_counts[2] if threat_counts else 0,
            'medium_threats': threat_counts[3] if threat_counts else 0,
            'low_threats': threat_counts[4] if threat_counts else 0,
            'threat_types': threat_types,
            'malicious_ips': malicious_ips,
            'malware_families': malware_families
        }
        
        return jsonify({
            'status': 'success',
            'summary': summary
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting threat summary: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@threat_intel_bp.route('/top-ips', methods=['GET'])
def top_malicious_ips():
    """
    Get top malicious IP addresses
    Query params:
      - limit: Number of IPs to return (default: 20)
      - time_range: 24h, 7d, 30d (default: 24h)
      - min_incidents: Minimum incident count (default: 1)
    """
    try:
        limit = int(request.args.get('limit', 20))
        time_range = request.args.get('time_range', '24h')
        min_incidents = int(request.args.get('min_incidents', 1))
        
        # Parse time range
        hours_map = {'24h': 24, '7d': 168, '30d': 720}
        hours = hours_map.get(time_range, 24)
        
        _init_threat_tables()
        
        with _db_lock:
            conn = _get_db()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Get top IPs from alerts
            cursor.execute(f'''
                SELECT src_ip, 
                       COUNT(*) as incident_count,
                       MAX(severity) as max_severity,
                       COUNT(DISTINCT threat_type) as unique_threats,
                       MAX(timestamp) as last_seen
                FROM alerts
                WHERE timestamp > datetime('now', '-{hours} hours')
                GROUP BY src_ip
                HAVING COUNT(*) >= ?
                ORDER BY incident_count DESC
                LIMIT ?
            ''', (min_incidents, limit))
            
            ips = [dict(row) for row in cursor.fetchall()]
            
            # Enrich with reputation data
            for ip_data in ips:
                cursor.execute('''
                    SELECT threat_level, country, organization
                    FROM ip_reputation
                    WHERE ip_address = ?
                ''', (ip_data['src_ip'],))
                rep_row = cursor.fetchone()
                if rep_row:
                    ip_data['reputation_level'] = rep_row[0]
                    ip_data['country'] = rep_row[1]
                    ip_data['organization'] = rep_row[2]
                else:
                    ip_data['reputation_level'] = 'unknown'
                    ip_data['country'] = 'unknown'
                    ip_data['organization'] = 'unknown'
            
            conn.close()
        
        return jsonify({
            'status': 'success',
            'time_range': time_range,
            'limit': limit,
            'ips': ips,
            'count': len(ips)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting top IPs: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@threat_intel_bp.route('/top-threats', methods=['GET'])
def top_threats():
    """
    Get top threat patterns and attacks
    Query params:
      - limit: Number of threats to return (default: 20)
      - time_range: 24h, 7d, 30d (default: 24h)
    """
    try:
        limit = int(request.args.get('limit', 20))
        time_range = request.args.get('time_range', '24h')
        
        # Parse time range
        hours_map = {'24h': 24, '7d': 168, '30d': 720}
        hours = hours_map.get(time_range, 24)
        
        _init_threat_tables()
        
        with _db_lock:
            conn = _get_db()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Get top threat types
            cursor.execute(f'''
                SELECT threat_type as threat_name,
                       COUNT(*) as detection_count,
                       MAX(severity) as max_severity,
                       AVG(CAST(severity = 'critical' as REAL)) * 100 as critical_percentage
                FROM alerts
                WHERE timestamp > datetime('now', '-{hours} hours')
                GROUP BY threat_type
                ORDER BY detection_count DESC
                LIMIT ?
            ''', (limit,))
            
            threats = [dict(row) for row in cursor.fetchall()]
            
            conn.close()
        
        return jsonify({
            'status': 'success',
            'time_range': time_range,
            'limit': limit,
            'threats': threats,
            'count': len(threats)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting top threats: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@threat_intel_bp.route('/ip-reputation/<ip_address>', methods=['GET'])
def get_ip_reputation(ip_address):
    """Get detailed reputation data for an IP address"""
    try:
        _init_threat_tables()
        
        with _db_lock:
            conn = _get_db()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Get IP reputation
            cursor.execute('''
                SELECT * FROM ip_reputation WHERE ip_address = ?
            ''', (ip_address,))
            rep_row = cursor.fetchone()
            
            # Get recent incidents from this IP
            cursor.execute(f'''
                SELECT timestamp, alert_type, severity, threat_type
                FROM alerts
                WHERE src_ip = ?
                ORDER BY timestamp DESC
                LIMIT 50
            ''', (ip_address,))
            incidents = [dict(row) for row in cursor.fetchall()]
            
            conn.close()
        
        reputation = dict(rep_row) if rep_row else {
            'ip_address': ip_address,
            'threat_level': 'unknown',
            'incident_count': 0,
            'last_seen': None
        }
        
        return jsonify({
            'status': 'success',
            'reputation': reputation,
            'recent_incidents': incidents,
            'incident_count': len(incidents)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting IP reputation: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@threat_intel_bp.route('/malware-indicators', methods=['GET'])
def malware_indicators():
    """
    Get detected malware indicators
    Query params:
      - limit: Number of indicators (default: 50)
      - malware_family: Filter by malware family
      - severity: critical, high, medium, low
    """
    try:
        limit = int(request.args.get('limit', 50))
        malware_family = request.args.get('malware_family', None)
        severity = request.args.get('severity', None)
        
        _init_threat_tables()
        
        with _db_lock:
            conn = _get_db()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            query = 'SELECT * FROM malware_indicators WHERE 1=1'
            params = []
            
            if malware_family:
                query += ' AND malware_family = ?'
                params.append(malware_family)
            
            if severity:
                query += ' AND severity = ?'
                params.append(severity)
            
            query += ' ORDER BY detection_count DESC LIMIT ?'
            params.append(limit)
            
            cursor.execute(query, params)
            indicators = [dict(row) for row in cursor.fetchall()]
            
            conn.close()
        
        return jsonify({
            'status': 'success',
            'indicators': indicators,
            'count': len(indicators)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting malware indicators: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@threat_intel_bp.route('/feeds', methods=['GET'])
def threat_feeds():
    """Get active threat feeds"""
    try:
        _init_threat_tables()
        
        with _db_lock:
            conn = _get_db()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT feed_id, feed_name, threat_type, entry_count, last_updated, is_active
                FROM threat_feeds
                WHERE is_active = 1
                ORDER BY last_updated DESC
            ''')
            
            feeds = [dict(row) for row in cursor.fetchall()]
            conn.close()
        
        return jsonify({
            'status': 'success',
            'feeds': feeds,
            'count': len(feeds)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting threat feeds: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@threat_intel_bp.route('/timeline', methods=['GET'])
def threat_timeline():
    """
    Get threat timeline (attacks over time)
    Query params:
      - hours: Number of hours to look back (default: 24)
      - granularity: 1h, 4h, 12h (default: 1h)
    """
    try:
        hours = int(request.args.get('hours', 24))
        granularity = request.args.get('granularity', '1h')
        
        # Parse granularity
        granularity_map = {'1h': 1, '4h': 4, '12h': 12}
        interval_hours = granularity_map.get(granularity, 1)
        
        _init_threat_tables()
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            
            # Get threat counts by time interval
            cursor.execute(f'''
                SELECT datetime(datetime(timestamp, 'start of hour', '+{interval_hours} hours')) as time_bucket,
                       COUNT(*) as threat_count,
                       MAX(severity) as peak_severity
                FROM alerts
                WHERE timestamp > datetime('now', '-{hours} hours')
                GROUP BY time_bucket
                ORDER BY time_bucket ASC
            ''')
            
            timeline = [
                {
                    'time': row[0],
                    'count': row[1],
                    'peak_severity': row[2]
                }
                for row in cursor.fetchall()
            ]
            
            conn.close()
        
        return jsonify({
            'status': 'success',
            'hours': hours,
            'granularity': granularity,
            'timeline': timeline,
            'total_points': len(timeline)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting threat timeline: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


logger.info("✅ Threat Intelligence API blueprint initialized")
