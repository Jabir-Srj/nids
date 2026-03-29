"""
ML Model Management API
Track and manage machine learning models, training status, and retraining
"""

from flask import Blueprint, request, jsonify
from datetime import datetime
import logging
import sqlite3
import threading
import uuid
import json
from typing import Dict, List, Any, Optional

ml_models_bp = Blueprint('ml_models', __name__, url_prefix='/api/ml/models')
logger = logging.getLogger(__name__)

DB_PATH = 'backend/database/nids.db'
_db_lock = threading.Lock()


def _get_db():
    """Get database connection"""
    return sqlite3.connect(DB_PATH)


def _init_models_db():
    """Initialize ML models tables"""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            # Models table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS ml_models (
                    id TEXT PRIMARY KEY,
                    name TEXT UNIQUE NOT NULL,
                    model_type TEXT NOT NULL,
                    version TEXT,
                    status TEXT DEFAULT 'active',
                    accuracy REAL,
                    precision REAL,
                    recall REAL,
                    f1_score REAL,
                    created_at TEXT NOT NULL,
                    trained_at TEXT,
                    last_used TEXT,
                    file_path TEXT
                )
            ''')
            
            # Training jobs table
            conn.execute('''
                CREATE TABLE IF NOT EXISTS training_jobs (
                    id TEXT PRIMARY KEY,
                    model_id TEXT NOT NULL,
                    status TEXT DEFAULT 'pending',
                    progress_percent INTEGER DEFAULT 0,
                    training_samples INTEGER,
                    validation_samples INTEGER,
                    started_at TEXT,
                    completed_at TEXT,
                    error_message TEXT,
                    metrics JSON,
                    FOREIGN KEY(model_id) REFERENCES ml_models(id)
                )
            ''')
            
            conn.commit()
            logger.info("✅ ML models tables initialized")
    except Exception as e:
        logger.error(f"Error initializing ML models tables: {e}")


@ml_models_bp.route('', methods=['GET'])
def get_models():
    """Get all ML models"""
    try:
        _init_models_db()
        
        with _db_lock:
            conn = _get_db()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM ml_models ORDER BY created_at DESC')
            models = [dict(row) for row in cursor.fetchall()]
            conn.close()
        
        return jsonify({
            'status': 'success',
            'count': len(models),
            'models': models
        }), 200
        
    except Exception as e:
        logger.error(f"Error fetching models: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@ml_models_bp.route('', methods=['POST'])
def create_model():
    """Create a new ML model entry"""
    try:
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'JSON required'}), 400
        
        data = request.json
        required = ['name', 'model_type']
        
        if not all(k in data for k in required):
            return jsonify({'status': 'error', 'message': f'Missing fields: {required}'}), 400
        
        valid_types = ['anomaly_detection', 'classification', 'regression', 'clustering']
        if data['model_type'] not in valid_types:
            return jsonify({
                'status': 'error',
                'message': f'Invalid model_type. Must be one of: {valid_types}'
            }), 400
        
        _init_models_db()
        
        model_id = str(uuid.uuid4())
        now = datetime.utcnow().isoformat()
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO ml_models 
                (id, name, model_type, version, status, created_at)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (
                model_id,
                data['name'],
                data['model_type'],
                data.get('version', '1.0.0'),
                'inactive',
                now
            ))
            conn.commit()
            conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Model created',
            'model_id': model_id
        }), 201
        
    except sqlite3.IntegrityError:
        return jsonify({
            'status': 'error',
            'message': 'Model with this name already exists'
        }), 409
    except Exception as e:
        logger.error(f"Error creating model: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@ml_models_bp.route('/<model_id>', methods=['GET'])
def get_model(model_id: str):
    """Get detailed information about a model"""
    try:
        _init_models_db()
        
        with _db_lock:
            conn = _get_db()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            
            # Get model
            cursor.execute('SELECT * FROM ml_models WHERE id = ?', (model_id,))
            model = dict(cursor.fetchone() or {})
            
            # Get recent training jobs
            cursor.execute('''
                SELECT id, status, progress_percent, started_at, completed_at, error_message
                FROM training_jobs
                WHERE model_id = ?
                ORDER BY started_at DESC
                LIMIT 10
            ''', (model_id,))
            
            training_jobs = [dict(row) for row in cursor.fetchall()]
            conn.close()
        
        if not model:
            return jsonify({
                'status': 'error',
                'message': 'Model not found'
            }), 404
        
        model['training_jobs'] = training_jobs
        
        return jsonify({
            'status': 'success',
            'model': model
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting model: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@ml_models_bp.route('/<model_id>/metrics', methods=['PUT'])
def update_model_metrics(model_id: str):
    """Update model performance metrics"""
    try:
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'JSON required'}), 400
        
        data = request.json
        _init_models_db()
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            
            # Check model exists
            cursor.execute('SELECT id FROM ml_models WHERE id = ?', (model_id,))
            if not cursor.fetchone():
                conn.close()
                return jsonify({'status': 'error', 'message': 'Model not found'}), 404
            
            # Update metrics
            cursor.execute('''
                UPDATE ml_models
                SET accuracy = ?, precision = ?, recall = ?, f1_score = ?, trained_at = ?
                WHERE id = ?
            ''', (
                data.get('accuracy'),
                data.get('precision'),
                data.get('recall'),
                data.get('f1_score'),
                datetime.utcnow().isoformat(),
                model_id
            ))
            conn.commit()
            conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Model metrics updated'
        }), 200
        
    except Exception as e:
        logger.error(f"Error updating model metrics: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@ml_models_bp.route('/<model_id>/retrain', methods=['POST'])
def retrain_model(model_id: str):
    """
    Start a retraining job for a model
    Request body:
      - training_samples: Number of samples to use
      - validation_split: Validation data percentage
    """
    try:
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'JSON required'}), 400
        
        data = request.json
        _init_models_db()
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            
            # Check model exists
            cursor.execute('SELECT id, name FROM ml_models WHERE id = ?', (model_id,))
            model = cursor.fetchone()
            if not model:
                conn.close()
                return jsonify({'status': 'error', 'message': 'Model not found'}), 404
            
            # Create training job
            job_id = str(uuid.uuid4())
            training_samples = data.get('training_samples', 10000)
            validation_samples = int(training_samples * data.get('validation_split', 0.2))
            
            cursor.execute('''
                INSERT INTO training_jobs
                (id, model_id, status, progress_percent, training_samples, validation_samples, started_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                job_id,
                model_id,
                'queued',
                0,
                training_samples,
                validation_samples,
                datetime.utcnow().isoformat()
            ))
            
            conn.commit()
            conn.close()
        
        # TODO: Start actual training job in background thread
        
        return jsonify({
            'status': 'success',
            'message': 'Retraining job queued',
            'job_id': job_id
        }), 202
        
    except Exception as e:
        logger.error(f"Error starting retraining: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@ml_models_bp.route('/jobs/<job_id>/status', methods=['GET'])
def get_job_status(job_id: str):
    """Get training job status"""
    try:
        _init_models_db()
        
        with _db_lock:
            conn = _get_db()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('SELECT * FROM training_jobs WHERE id = ?', (job_id,))
            job = cursor.fetchone()
            conn.close()
        
        if not job:
            return jsonify({
                'status': 'error',
                'message': 'Job not found'
            }), 404
        
        job_dict = dict(job)
        try:
            job_dict['metrics'] = json.loads(job_dict['metrics']) if job_dict['metrics'] else {}
        except:
            job_dict['metrics'] = {}
        
        return jsonify({
            'status': 'success',
            'job': job_dict
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting job status: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@ml_models_bp.route('/<model_id>/deploy', methods=['POST'])
def deploy_model(model_id: str):
    """Deploy a model to production"""
    try:
        _init_models_db()
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            
            # Check model exists
            cursor.execute('SELECT id, status FROM ml_models WHERE id = ?', (model_id,))
            model = cursor.fetchone()
            if not model:
                conn.close()
                return jsonify({'status': 'error', 'message': 'Model not found'}), 404
            
            # Update status
            cursor.execute('''
                UPDATE ml_models SET status = 'active', last_used = ?
                WHERE id = ?
            ''', (datetime.utcnow().isoformat(), model_id))
            conn.commit()
            conn.close()
        
        return jsonify({
            'status': 'success',
            'message': 'Model deployed successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deploying model: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@ml_models_bp.route('/stats/summary', methods=['GET'])
def models_stats():
    """Get summary statistics about all models"""
    try:
        _init_models_db()
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            
            # Total models
            cursor.execute('SELECT COUNT(*) FROM ml_models')
            total_models = cursor.fetchone()[0]
            
            # Active models
            cursor.execute("SELECT COUNT(*) FROM ml_models WHERE status = 'active'")
            active_models = cursor.fetchone()[0]
            
            # Training jobs count
            cursor.execute("SELECT COUNT(*) FROM training_jobs WHERE status = 'in_progress'")
            training_jobs = cursor.fetchone()[0]
            
            # Average performance
            cursor.execute('''
                SELECT AVG(accuracy), AVG(f1_score), AVG(precision)
                FROM ml_models WHERE accuracy IS NOT NULL
            ''')
            row = cursor.fetchone()
            avg_accuracy = row[0] or 0
            avg_f1 = row[1] or 0
            avg_precision = row[2] or 0
            
            conn.close()
        
        return jsonify({
            'status': 'success',
            'summary': {
                'total_models': total_models,
                'active_models': active_models,
                'training_jobs': training_jobs,
                'average_accuracy': round(avg_accuracy, 3),
                'average_f1_score': round(avg_f1, 3),
                'average_precision': round(avg_precision, 3),
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting models stats: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


logger.info("✅ ML Models Management API blueprint initialized")
