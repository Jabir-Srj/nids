"""
Rules Management API
CRUD operations for threat detection rules with test functionality
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import logging
import sqlite3
import threading
import re
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
import uuid

rules_bp = Blueprint('rules', __name__, url_prefix='/api/rules')
logger = logging.getLogger(__name__)

# Database setup
DB_PATH = 'backend/database/nids.db'
_db_lock = threading.Lock()


@dataclass
class Rule:
    """Rule data structure"""
    id: str
    name: str
    pattern: str
    severity: str  # critical, high, medium, low
    threat_type: str  # malware, anomaly, intrusion, policy_violation
    description: str = ""
    enabled: bool = True
    created_at: str = None
    updated_at: str = None
    matches_count: int = 0
    
    def to_dict(self):
        return asdict(self)


def _init_db():
    """Initialize rules table if not exists"""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS rules (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL UNIQUE,
                    pattern TEXT NOT NULL,
                    severity TEXT NOT NULL,
                    threat_type TEXT NOT NULL,
                    description TEXT,
                    enabled BOOLEAN DEFAULT 1,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    matches_count INTEGER DEFAULT 0
                )
            ''')
            conn.commit()
            logger.info("✅ Rules table initialized")
    except Exception as e:
        logger.error(f"Error initializing rules table: {e}")


def _get_db():
    """Get database connection"""
    return sqlite3.connect(DB_PATH)


def _row_to_dict(row, cursor):
    """Convert database row to dictionary"""
    if row is None:
        return None
    cols = [description[0] for description in cursor.description]
    return dict(zip(cols, row))


@rules_bp.route('', methods=['GET'])
def list_rules():
    """
    Get all rules with optional filtering
    Query params:
      - enabled: Filter by enabled status (true/false)
      - severity: Filter by severity (critical, high, medium, low)
      - threat_type: Filter by threat type
      - search: Search in name/description
    """
    try:
        _init_db()
        
        enabled = request.args.get('enabled', None)
        severity = request.args.get('severity', None)
        threat_type = request.args.get('threat_type', None)
        search = request.args.get('search', None)
        
        query = 'SELECT * FROM rules WHERE 1=1'
        params = []
        
        if enabled is not None:
            query += ' AND enabled = ?'
            params.append(enabled.lower() == 'true')
        
        if severity:
            query += ' AND severity = ?'
            params.append(severity)
        
        if threat_type:
            query += ' AND threat_type = ?'
            params.append(threat_type)
        
        if search:
            query += ' AND (name LIKE ? OR description LIKE ?)'
            search_term = f'%{search}%'
            params.extend([search_term, search_term])
        
        query += ' ORDER BY created_at DESC'
        
        with _db_lock:
            conn = _get_db()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
            conn.close()
        
        rules = [dict(row) for row in rows]
        
        return jsonify({
            'status': 'success',
            'count': len(rules),
            'rules': rules
        }), 200
        
    except Exception as e:
        logger.error(f"Error listing rules: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@rules_bp.route('', methods=['POST'])
def create_rule():
    """
    Create a new rule
    Request body:
      - name: Unique rule name
      - pattern: Regex or pattern to match
      - severity: critical, high, medium, low
      - threat_type: malware, anomaly, intrusion, policy_violation
      - description: Optional description
    """
    try:
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'JSON required'}), 400
        
        data = request.json
        required = ['name', 'pattern', 'severity', 'threat_type']
        
        if not all(k in data for k in required):
            return jsonify({
                'status': 'error',
                'message': f'Missing required fields: {required}'
            }), 400
        
        # Validate severity and threat_type
        valid_severities = ['critical', 'high', 'medium', 'low']
        valid_threats = ['malware', 'anomaly', 'intrusion', 'policy_violation']
        
        if data['severity'] not in valid_severities:
            return jsonify({
                'status': 'error',
                'message': f'Invalid severity. Must be one of: {valid_severities}'
            }), 400
        
        if data['threat_type'] not in valid_threats:
            return jsonify({
                'status': 'error',
                'message': f'Invalid threat_type. Must be one of: {valid_threats}'
            }), 400
        
        # Validate regex pattern
        try:
            re.compile(data['pattern'])
        except re.error as e:
            return jsonify({
                'status': 'error',
                'message': f'Invalid regex pattern: {str(e)}'
            }), 400
        
        _init_db()
        
        rule_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        try:
            with _db_lock:
                conn = _get_db()
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO rules (id, name, pattern, severity, threat_type, 
                                     description, enabled, created_at, updated_at, matches_count)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (
                    rule_id,
                    data['name'],
                    data['pattern'],
                    data['severity'],
                    data['threat_type'],
                    data.get('description', ''),
                    True,
                    now,
                    now,
                    0
                ))
                conn.commit()
                conn.close()
            
            return jsonify({
                'status': 'success',
                'message': 'Rule created',
                'rule_id': rule_id
            }), 201
            
        except sqlite3.IntegrityError:
            return jsonify({
                'status': 'error',
                'message': f'Rule with name "{data["name"]}" already exists'
            }), 409
        
    except Exception as e:
        logger.error(f"Error creating rule: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@rules_bp.route('/<rule_id>', methods=['GET'])
def get_rule(rule_id):
    """Get a specific rule by ID"""
    try:
        _init_db()
        
        with _db_lock:
            conn = _get_db()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM rules WHERE id = ?', (rule_id,))
            row = cursor.fetchone()
            conn.close()
        
        if not row:
            return jsonify({
                'status': 'error',
                'message': 'Rule not found'
            }), 404
        
        return jsonify({
            'status': 'success',
            'rule': dict(row)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting rule: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@rules_bp.route('/<rule_id>', methods=['PUT'])
def update_rule(rule_id):
    """
    Update a rule
    Request body: fields to update (name, pattern, severity, threat_type, description, enabled)
    """
    try:
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'JSON required'}), 400
        
        data = request.json
        _init_db()
        
        # Check rule exists
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            cursor.execute('SELECT id FROM rules WHERE id = ?', (rule_id,))
            if not cursor.fetchone():
                conn.close()
                return jsonify({
                    'status': 'error',
                    'message': 'Rule not found'
                }), 404
            
            # Validate pattern if provided
            if 'pattern' in data:
                try:
                    re.compile(data['pattern'])
                except re.error as e:
                    conn.close()
                    return jsonify({
                        'status': 'error',
                        'message': f'Invalid regex pattern: {str(e)}'
                    }), 400
            
            # Build update query
            update_fields = []
            params = []
            allowed_fields = {'name', 'pattern', 'severity', 'threat_type', 'description', 'enabled'}
            
            for field in allowed_fields:
                if field in data:
                    update_fields.append(f'{field} = ?')
                    params.append(data[field])
            
            if update_fields:
                update_fields.append('updated_at = ?')
                params.append(datetime.utcnow().isoformat())
                params.append(rule_id)
                
                query = f"UPDATE rules SET {', '.join(update_fields)} WHERE id = ?"
                cursor.execute(query, params)
            conn.commit()
            conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Rule updated'
        }), 200
        
    except sqlite3.IntegrityError as e:
        return jsonify({
            'status': 'error',
            'message': 'Duplicate name or constraint violation'
        }), 409
    except Exception as e:
        logger.error(f"Error updating rule: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@rules_bp.route('/<rule_id>', methods=['DELETE'])
def delete_rule(rule_id):
    """Delete a rule"""
    try:
        _init_db()
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            
            cursor.execute('SELECT id FROM rules WHERE id = ?', (rule_id,))
            if not cursor.fetchone():
                conn.close()
                return jsonify({
                    'status': 'error',
                    'message': 'Rule not found'
                }), 404
            
            cursor.execute('DELETE FROM rules WHERE id = ?', (rule_id,))
            conn.commit()
            conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Rule deleted'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting rule: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@rules_bp.route('/<rule_id>/test', methods=['POST'])
def test_rule(rule_id):
    """
    Test a rule against sample data
    Request body:
      - test_data: String or list of strings to test against
    """
    try:
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'JSON required'}), 400
        
        data = request.json
        if 'test_data' not in data:
            return jsonify({
                'status': 'error',
                'message': 'test_data required'
            }), 400
        
        _init_db()
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            cursor.execute('SELECT pattern FROM rules WHERE id = ?', (rule_id,))
            row = cursor.fetchone()
            conn.close()
        
        if not row:
            return jsonify({
                'status': 'error',
                'message': 'Rule not found'
            }), 404
        
        pattern = row[0]
        test_strings = data['test_data']
        if not isinstance(test_strings, list):
            test_strings = [test_strings]
        
        try:
            regex = re.compile(pattern)
            matches = []
            
            for test_str in test_strings:
                if regex.search(str(test_str)):
                    matches.append(test_str)
            
            return jsonify({
                'status': 'success',
                'pattern': pattern,
                'test_count': len(test_strings),
                'match_count': len(matches),
                'matches': matches,
                'success': len(matches) > 0
            }), 200
            
        except re.error as e:
            return jsonify({
                'status': 'error',
                'message': f'Pattern error: {str(e)}'
            }), 400
        
    except Exception as e:
        logger.error(f"Error testing rule: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@rules_bp.route('/stats/summary', methods=['GET'])
def rules_summary():
    """Get summary statistics of all rules"""
    try:
        _init_db()
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            
            cursor.execute('SELECT COUNT(*) FROM rules')
            total_rules = cursor.fetchone()[0]
            
            cursor.execute('SELECT COUNT(*) FROM rules WHERE enabled = 1')
            enabled_rules = cursor.fetchone()[0]
            
            cursor.execute('''
                SELECT severity, COUNT(*) as count 
                FROM rules 
                GROUP BY severity
            ''')
            severity_dist = dict(cursor.fetchall())
            
            cursor.execute('''
                SELECT threat_type, COUNT(*) as count 
                FROM rules 
                GROUP BY threat_type
            ''')
            threat_dist = dict(cursor.fetchall())
            
            cursor.execute('SELECT SUM(matches_count) FROM rules')
            total_matches = cursor.fetchone()[0] or 0
            
            conn.close()
        
        return jsonify({
            'status': 'success',
            'total_rules': total_rules,
            'enabled_rules': enabled_rules,
            'disabled_rules': total_rules - enabled_rules,
            'severity_distribution': severity_dist,
            'threat_distribution': threat_dist,
            'total_matches': total_matches
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting rules summary: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


logger.info("✅ Rules API blueprint initialized")
