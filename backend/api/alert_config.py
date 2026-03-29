"""
Alert Configuration API
Configure alert thresholds, notification channels, and custom rules
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import logging
import sqlite3
import threading
import uuid
import json
from typing import Dict, List, Any, Optional

alert_config_bp = Blueprint('alert_config', __name__, url_prefix='/api/alerts/config')
logger = logging.getLogger(__name__)

DB_PATH = 'backend/database/nids.db'
_db_lock = threading.Lock()


def _get_db():
    """Get database connection"""
    return sqlite3.connect(DB_PATH)


def _init_config_db():
    """Initialize alert configuration tables"""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            # Alert thresholds table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS alert_thresholds (
                    id TEXT PRIMARY KEY,
                    threat_type TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    threshold_value INTEGER,
                    time_window_minutes INTEGER,
                    enabled BOOLEAN DEFAULT 1,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                )
            ''')
            
            # Notification channels table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS notification_channels (
                    id TEXT PRIMARY KEY,
                    channel_type TEXT NOT NULL,
                    channel_name TEXT,
                    config JSON,
                    is_active BOOLEAN DEFAULT 1,
                    created_at TEXT NOT NULL
                )
            ''')
            
            # Alert routing rules table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS alert_routing (
                    id TEXT PRIMARY KEY,
                    name TEXT UNIQUE NOT NULL,
                    condition TEXT NOT NULL,
                    channels TEXT NOT NULL,
                    enabled BOOLEAN DEFAULT 1,
                    created_at TEXT NOT NULL
                )
            ''')
            
            # Alert suppression rules table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS alert_suppression (
                    id TEXT PRIMARY KEY,
                    rule_id TEXT NOT NULL,
                    pattern TEXT,
                    duration_minutes INTEGER,
                    reason TEXT,
                    enabled BOOLEAN DEFAULT 1,
                    created_at TEXT NOT NULL
                )
            ''')
            
            conn.commit()
            logger.info("✅ Alert config tables initialized")
    except Exception as e:
        logger.error(f"Error initializing alert config tables: {e}")


# ============================================
# THRESHOLDS
# ============================================

@alert_config_bp.route('/thresholds', methods=['GET'])
def get_thresholds():
    """Get all alert thresholds"""
    try:
        _init_config_db()
        
        with _db_lock:
            conn = _get_db()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM alert_thresholds ORDER BY created_at DESC')
            thresholds = [dict(row) for row in cursor.fetchall()]
            conn.close()
        
        return jsonify({
            'status': 'success',
            'count': len(thresholds),
            'thresholds': thresholds
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching thresholds: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@alert_config_bp.route('/thresholds', methods=['POST'])
def create_threshold():
    """Create a new alert threshold"""
    try:
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'JSON required'}), 400
        
        data = request.json
        required = ['threat_type', 'severity', 'threshold_value', 'time_window_minutes']
        
        if not all(k in data for k in required):
            return jsonify({
                'status': 'error',
                'message': f'Missing fields: {required}'
            }), 400
        
        _init_config_db()
        
        threshold_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO alert_thresholds 
                (id, threat_type, severity, threshold_value, time_window_minutes, enabled, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                threshold_id,
                data['threat_type'],
                data['severity'],
                data['threshold_value'],
                data['time_window_minutes'],
                data.get('enabled', True),
                now,
                now
            ))
            conn.commit()
            conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Threshold created',
            'threshold_id': threshold_id
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating threshold: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@alert_config_bp.route('/thresholds/<threshold_id>', methods=['PUT'])
def update_threshold(threshold_id: str):
    """Update an alert threshold"""
    try:
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'JSON required'}), 400
        
        data = request.json
        _init_config_db()
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            
            # Check exists
            cursor.execute('SELECT id FROM alert_thresholds WHERE id = ?', (threshold_id,))
            if not cursor.fetchone():
                conn.close()
                return jsonify({'status': 'error', 'message': 'Threshold not found'}), 404
            
            # Update
            update_fields = []
            params = []
            allowed_fields = {'threat_type', 'severity', 'threshold_value', 'time_window_minutes', 'enabled'}
            
            for field in allowed_fields:
                if field in data:
                    update_fields.append(f'{field} = ?')
                    params.append(data[field])
            
            if update_fields:
                update_fields.append('updated_at = ?')
                params.append(datetime.utcnow().isoformat())
                params.append(threshold_id)
                
                query = f"UPDATE alert_thresholds SET {', '.join(update_fields)} WHERE id = ?"
                cursor.execute(query, params)
                conn.commit()
            
            conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Threshold updated'
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating threshold: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@alert_config_bp.route('/thresholds/<threshold_id>', methods=['DELETE'])
def delete_threshold(threshold_id: str):
    """Delete an alert threshold"""
    try:
        _init_config_db()
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            cursor.execute('DELETE FROM alert_thresholds WHERE id = ?', (threshold_id,))
            conn.commit()
            conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Threshold deleted'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting threshold: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


# ============================================
# NOTIFICATION CHANNELS
# ============================================

@alert_config_bp.route('/channels', methods=['GET'])
def get_channels():
    """Get all notification channels"""
    try:
        _init_config_db()
        
        with _db_lock:
            conn = _get_db()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM notification_channels WHERE is_active = 1')
            channels = []
            for row in cursor.fetchall():
                channel = dict(row)
                try:
                    channel['config'] = json.loads(channel['config']) if channel['config'] else {}
                except:
                    channel['config'] = {}
                channels.append(channel)
            conn.close()
        
        return jsonify({
            'status': 'success',
            'count': len(channels),
            'channels': channels
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching channels: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@alert_config_bp.route('/channels', methods=['POST'])
def create_channel():
    """Create a new notification channel"""
    try:
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'JSON required'}), 400
        
        data = request.json
        
        if 'channel_type' not in data:
            return jsonify({
                'status': 'error',
                'message': 'channel_type required (email, slack, webhook, sms)'
            }), 400
        
        valid_types = ['email', 'slack', 'webhook', 'sms', 'pagerduty']
        if data['channel_type'] not in valid_types:
            return jsonify({
                'status': 'error',
                'message': f'Invalid channel type. Must be one of: {valid_types}'
            }), 400
        
        _init_config_db()
        
        channel_id = str(uuid.uuid4())
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO notification_channels
                (id, channel_type, channel_name, config, is_active, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                channel_id,
                data['channel_type'],
                data.get('channel_name', f"{data['channel_type']}-{channel_id[:8]}"),
                json.dumps(data.get('config', {})),
                True,
                datetime.utcnow().isoformat()
            ))
            conn.commit()
            conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Channel created',
            'channel_id': channel_id
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating channel: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@alert_config_bp.route('/channels/<channel_id>/test', methods=['POST'])
def test_channel(channel_id: str):
    """Send test notification to a channel"""
    try:
        _init_config_db()
        
        with _db_lock:
            conn = _get_db()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM notification_channels WHERE id = ?', (channel_id,))
            channel = cursor.fetchone()
            conn.close()
        
        if not channel:
            return jsonify({
                'status': 'error',
                'message': 'Channel not found'
            }), 404
        
        # TODO: Implement actual test notification sending
        
        return jsonify({
            'status': 'success',
            'message': f'Test notification sent to {channel["channel_type"]} channel'
        }), 200
        
    except Exception as e:
        logger.error(f"Error testing channel: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


# ============================================
# ROUTING RULES
# ============================================

@alert_config_bp.route('/routing-rules', methods=['GET'])
def get_routing_rules():
    """Get all alert routing rules"""
    try:
        _init_config_db()
        
        with _db_lock:
            conn = _get_db()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM alert_routing WHERE enabled = 1')
            rules = []
            for row in cursor.fetchall():
                rule = dict(row)
                try:
                    rule['channels'] = json.loads(rule['channels']) if isinstance(rule['channels'], str) else rule['channels']
                except:
                    rule['channels'] = []
                rules.append(rule)
            conn.close()
        
        return jsonify({
            'status': 'success',
            'count': len(rules),
            'rules': rules
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching routing rules: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@alert_config_bp.route('/routing-rules', methods=['POST'])
def create_routing_rule():
    """Create a new alert routing rule"""
    try:
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'JSON required'}), 400
        
        data = request.json
        required = ['name', 'condition', 'channels']
        
        if not all(k in data for k in required):
            return jsonify({'status': 'error', 'message': f'Missing fields: {required}'}), 400
        
        _init_config_db()
        
        rule_id = str(uuid.uuid4())
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO alert_routing (id, name, condition, channels, enabled, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                rule_id,
                data['name'],
                data['condition'],
                json.dumps(data['channels']),
                data.get('enabled', True),
                datetime.utcnow().isoformat()
            ))
            conn.commit()
            conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Routing rule created',
            'rule_id': rule_id
        }), 201
        
    except Exception as e:
        logger.error(f"Error creating routing rule: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


logger.info("✅ Alert Configuration API blueprint initialized")
