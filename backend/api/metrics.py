"""
Performance Metrics & System Health
"""

import os
import psutil
import time
from typing import Dict, Any
from datetime import datetime, timedelta
from flask import Blueprint, jsonify

metrics_bp = Blueprint('metrics', __name__)

class MetricsCollector:
    """Collect system performance metrics"""
    
    def __init__(self):
        self.start_time = time.time()
        self.request_count = 0
        self.error_count = 0
        self.alert_count = 0
        self.last_reset = datetime.utcnow()
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """Get system-level metrics"""
        cpu_percent = psutil.cpu_percent(interval=0.1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        uptime = time.time() - self.start_time
        
        return {
            'timestamp': datetime.utcnow().isoformat(),
            'uptime_seconds': uptime,
            'uptime_human': self._format_uptime(uptime),
            'cpu': {
                'percent': cpu_percent,
                'count': psutil.cpu_count(),
            },
            'memory': {
                'percent': memory.percent,
                'used_mb': memory.used / (1024 * 1024),
                'total_mb': memory.total / (1024 * 1024),
                'available_mb': memory.available / (1024 * 1024),
            },
            'disk': {
                'percent': disk.percent,
                'used_gb': disk.used / (1024**3),
                'total_gb': disk.total / (1024**3),
                'free_gb': disk.free / (1024**3),
            },
            'process_count': len(psutil.pids()),
        }
    
    def get_application_metrics(self, 
                               capture_engine=None, 
                               rule_engine=None) -> Dict[str, Any]:
        """Get application-level metrics"""
        metrics = {
            'timestamp': datetime.utcnow().isoformat(),
            'requests': {
                'total': self.request_count,
                'errors': self.error_count,
                'error_rate': self.request_count > 0 and (self.error_count / self.request_count) or 0,
            },
            'alerts': {
                'total': self.alert_count,
            },
        }
        
        if capture_engine:
            stats = capture_engine.get_stats()
            metrics['capture'] = {
                'packets_captured': stats.packets_captured,
                'packets_per_second': stats.packets_per_second,
                'bytes_per_second': stats.bytes_per_second,
                'dropped': stats.packets_dropped,
            }
        
        if rule_engine:
            rule_stats = rule_engine.get_stats()
            metrics['detection'] = {
                'rules_loaded': rule_stats.get('rules_loaded', 0),
                'packets_evaluated': rule_stats.get('packets_evaluated', 0),
                'avg_eval_time_ms': rule_stats.get('avg_evaluation_time_ms', 0),
                'detections': rule_stats.get('detections', 0),
            }
        
        return metrics
    
    def get_database_metrics(self, db_session=None) -> Dict[str, Any]:
        """Get database performance metrics"""
        if not db_session:
            return {'status': 'unavailable'}
        
        try:
            # Execute simple query to measure response time
            start = time.time()
            db_session.execute('SELECT 1')
            response_time = (time.time() - start) * 1000
            
            return {
                'status': 'healthy',
                'response_time_ms': response_time,
                'connection_pool': {
                    'size': db_session.engine.pool.size(),
                    'checked_in': db_session.engine.pool.checkedin(),
                    'checked_out': db_session.engine.pool.checkedout(),
                },
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e),
            }
    
    def get_cache_metrics(self, cache=None) -> Dict[str, Any]:
        """Get cache performance metrics"""
        if not cache:
            return {'status': 'unavailable'}
        
        try:
            cache_info = cache.get_info()
            return {
                'status': 'healthy',
                'hits': cache_info.get('hits', 0),
                'misses': cache_info.get('misses', 0),
                'hit_rate': cache_info.get('hits', 0) / max(
                    cache_info.get('hits', 0) + cache_info.get('misses', 0), 1
                ),
                'items': cache_info.get('items', 0),
                'size_mb': cache_info.get('size_bytes', 0) / (1024 * 1024),
            }
        except Exception as e:
            return {
                'status': 'error',
                'message': str(e),
            }
    
    def _format_uptime(self, seconds: float) -> str:
        """Format uptime in human-readable format"""
        days = int(seconds // 86400)
        hours = int((seconds % 86400) // 3600)
        minutes = int((seconds % 3600) // 60)
        return f"{days}d {hours}h {minutes}m"

# Global metrics collector
metrics_collector = MetricsCollector()

@metrics_bp.route('/metrics/system', methods=['GET'])
def system_metrics():
    """Get system-level metrics"""
    return jsonify(metrics_collector.get_system_metrics())

@metrics_bp.route('/metrics/application', methods=['GET'])
def application_metrics():
    """Get application-level metrics"""
    # TODO: Pass capture_engine and rule_engine instances
    return jsonify(metrics_collector.get_application_metrics())

@metrics_bp.route('/metrics/database', methods=['GET'])
def database_metrics():
    """Get database metrics"""
    # TODO: Pass db_session
    return jsonify(metrics_collector.get_database_metrics())

@metrics_bp.route('/metrics/cache', methods=['GET'])
def cache_metrics():
    """Get cache metrics"""
    # TODO: Pass cache instance
    return jsonify(metrics_collector.get_cache_metrics())

@metrics_bp.route('/metrics/full', methods=['GET'])
def full_metrics():
    """Get comprehensive metrics"""
    return jsonify({
        'system': metrics_collector.get_system_metrics(),
        'application': metrics_collector.get_application_metrics(),
        'database': metrics_collector.get_database_metrics(),
        'cache': metrics_collector.get_cache_metrics(),
    })

@metrics_bp.route('/health', methods=['GET'])
def health_check():
    """System health check endpoint"""
    system = metrics_collector.get_system_metrics()
    
    # Determine health status
    health_status = 'healthy'
    if system['cpu']['percent'] > 90:
        health_status = 'warning'
    if system['memory']['percent'] > 90 or system['disk']['percent'] > 90:
        health_status = 'warning'
    if system['cpu']['percent'] > 95 or system['memory']['percent'] > 95:
        health_status = 'critical'
    
    return jsonify({
        'status': health_status,
        'timestamp': datetime.utcnow().isoformat(),
        'uptime': system['uptime_human'],
        'cpu_percent': system['cpu']['percent'],
        'memory_percent': system['memory']['percent'],
        'disk_percent': system['disk']['percent'],
    })

@metrics_bp.route('/metrics/prometheus', methods=['GET'])
def prometheus_metrics():
    """Prometheus-format metrics"""
    system = metrics_collector.get_system_metrics()
    
    prometheus_output = f"""
# HELP nids_cpu_usage CPU usage percentage
# TYPE nids_cpu_usage gauge
nids_cpu_usage {system['cpu']['percent']}

# HELP nids_memory_usage Memory usage percentage
# TYPE nids_memory_usage gauge
nids_memory_usage {system['memory']['percent']}

# HELP nids_memory_used Memory used in MB
# TYPE nids_memory_used gauge
nids_memory_used {system['memory']['used_mb']}

# HELP nids_disk_usage Disk usage percentage
# TYPE nids_disk_usage gauge
nids_disk_usage {system['disk']['percent']}

# HELP nids_uptime_seconds Application uptime in seconds
# TYPE nids_uptime_seconds counter
nids_uptime_seconds {system['uptime_seconds']}

# HELP nids_requests_total Total requests
# TYPE nids_requests_total counter
nids_requests_total {metrics_collector.request_count}

# HELP nids_errors_total Total errors
# TYPE nids_errors_total counter
nids_errors_total {metrics_collector.error_count}
"""
    
    return prometheus_output, 200, {'Content-Type': 'text/plain; charset=utf-8'}
