"""
System Health API
Monitor system resources and health metrics
"""

from flask import Blueprint, request, jsonify
import logging
import psutil
import os
import sqlite3
from datetime import datetime
import threading
from typing import Dict, Any

health_bp = Blueprint('health', __name__, url_prefix='/api/system')
logger = logging.getLogger(__name__)

DB_PATH = 'backend/database/nids.db'
_db_lock = threading.Lock()


def _get_db():
    """Get database connection"""
    return sqlite3.connect(DB_PATH)


@health_bp.route('/health', methods=['GET'])
def system_health():
    """Get overall system health status"""
    try:
        # CPU usage
        cpu_percent = psutil.cpu_percent(interval=1)
        cpu_count = psutil.cpu_count()
        
        # Memory usage
        memory = psutil.virtual_memory()
        
        # Disk usage
        disk = psutil.disk_usage('/')
        
        # Network stats
        net_io = psutil.net_io_counters()
        
        # Database size
        try:
            db_size = os.path.getsize(DB_PATH) if os.path.exists(DB_PATH) else 0
        except:
            db_size = 0
        
        # Process info
        process = psutil.Process()
        process_info = {
            'cpu_percent': process.cpu_percent(interval=0.1),
            'memory_mb': process.memory_info().rss / 1024 / 1024,
            'num_threads': process.num_threads(),
        }
        
        # System uptime
        boot_time = datetime.fromtimestamp(psutil.boot_time())
        uptime_seconds = int((datetime.now() - boot_time).total_seconds())
        uptime_hours = uptime_seconds / 3600
        uptime_days = uptime_hours / 24
        
        health_status = {
            'status': 'healthy' if cpu_percent < 80 and memory.percent < 80 else 'degraded',
            'timestamp': datetime.utcnow().isoformat(),
            'uptime': {
                'seconds': uptime_seconds,
                'hours': round(uptime_hours, 2),
                'days': round(uptime_days, 2),
                'boot_time': boot_time.isoformat(),
                'formatted': f"{int(uptime_days)}d {int(uptime_hours % 24)}h {int((uptime_seconds % 3600) / 60)}m",
            },
            
            'system': {
                'cpu': {
                    'percent': cpu_percent,
                    'cores': cpu_count,
                    'status': 'good' if cpu_percent < 70 else 'warning' if cpu_percent < 85 else 'critical',
                },
                'memory': {
                    'percent': memory.percent,
                    'total_gb': memory.total / 1024 / 1024 / 1024,
                    'available_gb': memory.available / 1024 / 1024 / 1024,
                    'used_gb': memory.used / 1024 / 1024 / 1024,
                    'status': 'good' if memory.percent < 70 else 'warning' if memory.percent < 85 else 'critical',
                },
                'disk': {
                    'percent': disk.percent,
                    'total_gb': disk.total / 1024 / 1024 / 1024,
                    'used_gb': disk.used / 1024 / 1024 / 1024,
                    'free_gb': disk.free / 1024 / 1024 / 1024,
                    'status': 'good' if disk.percent < 70 else 'warning' if disk.percent < 85 else 'critical',
                },
                'network': {
                    'bytes_sent': net_io.bytes_sent,
                    'bytes_recv': net_io.bytes_recv,
                    'packets_sent': net_io.packets_sent,
                    'packets_recv': net_io.packets_recv,
                }
            },
            
            'process': process_info,
            
            'database': {
                'size_mb': db_size / 1024 / 1024,
                'status': 'good' if db_size < 500 * 1024 * 1024 else 'warning',
            }
        }
        
        return jsonify(health_status), 200
        
    except Exception as e:
        logger.error(f"Error getting system health: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@health_bp.route('/database', methods=['GET'])
def database_health():
    """Check database health and integrity"""
    try:
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            
            # Get table information
            cursor.execute('''
                SELECT name FROM sqlite_master 
                WHERE type='table'
            ''')
            tables = [row[0] for row in cursor.fetchall()]
            
            table_info = {}
            for table in tables:
                cursor.execute('SELECT COUNT(*) FROM ' + table)
                count = cursor.fetchone()[0]
                table_info[table] = {'count': count}
            
            # Run PRAGMA integrity_check
            cursor.execute('PRAGMA integrity_check')
            integrity = cursor.fetchone()[0]
            
            # Database stats
            cursor.execute('PRAGMA page_count')
            page_count = cursor.fetchone()[0]
            
            cursor.execute('PRAGMA page_size')
            page_size = cursor.fetchone()[0]
            
            conn.close()
        
        db_health = {
            'status': 'healthy' if integrity == 'ok' else 'corrupted',
            'integrity': integrity,
            'tables': table_info,
            'size_mb': (page_count * page_size) / 1024 / 1024,
            'page_info': {
                'page_count': page_count,
                'page_size': page_size,
            }
        }
        
        return jsonify(db_health), 200
        
    except Exception as e:
        logger.error(f"Error checking database health: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@health_bp.route('/components', methods=['GET'])
def component_status():
    """Get status of all system components"""
    try:
        components = {
            'capture_engine': {
                'status': 'ready',
                'version': '1.0',
                'last_check': datetime.utcnow().isoformat(),
            },
            'rule_engine': {
                'status': 'ready',
                'rules_loaded': 0,  # TODO: Get actual count
                'last_check': datetime.utcnow().isoformat(),
            },
            'anomaly_detector': {
                'status': 'ready',
                'model_trained': False,  # TODO: Check actual status
                'last_check': datetime.utcnow().isoformat(),
            },
            'threat_intel': {
                'status': 'ready',
                'feeds_active': 0,  # TODO: Get actual count
                'last_update': None,
            },
            'websocket': {
                'status': 'ready',
                'connected_clients': 0,  # TODO: Get actual count
                'last_check': datetime.utcnow().isoformat(),
            },
        }
        
        return jsonify({
            'status': 'success',
            'components': components
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting component status: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@health_bp.route('/alerts', methods=['GET'])
def alert_health():
    """Get alert processing health metrics"""
    try:
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            
            # Total alerts
            cursor.execute('SELECT COUNT(*) FROM alerts')
            total = cursor.fetchone()[0]
            
            # Alerts by severity
            cursor.execute('''
                SELECT severity, COUNT(*) as count
                FROM alerts
                GROUP BY severity
            ''')
            by_severity = dict(cursor.fetchall())
            
            # Average processing time
            cursor.execute('''
                SELECT AVG(confidence) FROM alerts
            ''')
            avg_confidence = cursor.fetchone()[0] or 0
            
            # Recent alert rate (alerts per hour)
            cursor.execute('''
                SELECT COUNT(*) FROM alerts
                WHERE timestamp > datetime('now', ?)
            ''', ('-1 hour',))
            alerts_per_hour = cursor.fetchone()[0]
            
            conn.close()
        
        health = {
            'status': 'healthy',
            'total_alerts': total,
            'by_severity': by_severity,
            'average_confidence': round(avg_confidence, 2),
            'alerts_per_hour': alerts_per_hour,
            'processing_rate_healthy': alerts_per_hour < 1000,
        }
        
        return jsonify(health), 200
        
    except Exception as e:
        logger.error(f"Error getting alert health: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


logger.info("✅ System Health API blueprint initialized")
