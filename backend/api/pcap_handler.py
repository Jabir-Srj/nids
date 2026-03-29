"""
PCAP File Handler
Upload and process PCAP files for offline analysis
"""

from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from datetime import datetime
import logging
import os
import threading
from typing import Optional, Dict, Any
import uuid

pcap_bp = Blueprint('pcap', __name__, url_prefix='/api/pcap')
logger = logging.getLogger(__name__)

# Configuration
UPLOAD_FOLDER = 'backend/uploads/pcap'
ALLOWED_EXTENSIONS = {'pcap', 'pcapng', 'cap'}
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500 MB
_processing_lock = threading.Lock()
_pcap_jobs = {}


def allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def _init_upload_folder():
    """Create upload folder if it doesn't exist"""
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@pcap_bp.route('/upload', methods=['POST'])
def upload_pcap():
    """
    Upload PCAP file for analysis
    Returns job ID for tracking progress
    """
    try:
        _init_upload_folder()
        
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({
                'status': 'error',
                'message': 'No file part in request'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'status': 'error',
                'message': 'No file selected'
            }), 400
        
        # Validate file
        if not allowed_file(file.filename):
            return jsonify({
                'status': 'error',
                'message': f'File type not allowed. Allowed: {", ".join(ALLOWED_EXTENSIONS)}'
            }), 400
        
        # Check file size
        file.seek(0, os.SEEK_END)
        file_size = file.tell()
        file.seek(0)
        
        if file_size > MAX_FILE_SIZE:
            return jsonify({
                'status': 'error',
                'message': f'File too large. Maximum size: {MAX_FILE_SIZE / 1024 / 1024:.0f} MB'
            }), 413
        
        # Generate unique filename and job ID
        job_id = str(uuid.uuid4())
        filename = secure_filename(f"{job_id}_{file.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        
        # Save file
        file.save(filepath)
        
        # Create job record
        job = {
            'job_id': job_id,
            'filename': file.filename,
            'filepath': filepath,
            'file_size': file_size,
            'status': 'queued',
            'progress': 0,
            'packets_processed': 0,
            'threats_detected': 0,
            'created_at': datetime.utcnow().isoformat(),
            'started_at': None,
            'completed_at': None,
            'error': None
        }
        
        with _processing_lock:
            _pcap_jobs[job_id] = job
        
        logger.info(f"PCAP uploaded: {job_id} ({file_size} bytes)")
        
        # Start processing in background
        thread = threading.Thread(target=_process_pcap, args=(job_id, filepath))
        thread.daemon = True
        thread.start()
        
        return jsonify({
            'status': 'success',
            'message': 'PCAP file uploaded successfully',
            'job_id': job_id,
            'file_size': file_size
        }), 201
        
    except Exception as e:
        logger.error(f"Error uploading PCAP: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@pcap_bp.route('/jobs/<job_id>/status', methods=['GET'])
def get_job_status(job_id: str):
    """Get status of PCAP processing job"""
    try:
        with _processing_lock:
            job = _pcap_jobs.get(job_id)
        
        if not job:
            return jsonify({
                'status': 'error',
                'message': 'Job not found'
            }), 404
        
        return jsonify({
            'status': 'success',
            'job': job
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting job status: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@pcap_bp.route('/jobs', methods=['GET'])
def list_jobs():
    """List all PCAP processing jobs"""
    try:
        limit = int(request.args.get('limit', 50))
        status_filter = request.args.get('status', None)
        
        with _processing_lock:
            jobs = list(_pcap_jobs.values())
        
        # Filter by status if specified
        if status_filter:
            jobs = [j for j in jobs if j['status'] == status_filter]
        
        # Sort by created_at descending
        jobs.sort(key=lambda x: x['created_at'], reverse=True)
        
        # Apply limit
        jobs = jobs[:limit]
        
        return jsonify({
            'status': 'success',
            'count': len(jobs),
            'jobs': jobs
        }), 200
        
    except Exception as e:
        logger.error(f"Error listing jobs: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@pcap_bp.route('/jobs/<job_id>', methods=['DELETE'])
def delete_job(job_id: str):
    """Delete a PCAP job and its file"""
    try:
        with _processing_lock:
            job = _pcap_jobs.pop(job_id, None)
        
        if not job:
            return jsonify({
                'status': 'error',
                'message': 'Job not found'
            }), 404
        
        # Delete file if it exists
        if os.path.exists(job['filepath']):
            try:
                os.remove(job['filepath'])
            except Exception as e:
                logger.warning(f"Could not delete file {job['filepath']}: {e}")
        
        return jsonify({
            'status': 'success',
            'message': 'Job deleted successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error deleting job: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@pcap_bp.route('/jobs/<job_id>/download-results', methods=['GET'])
def download_results(job_id: str):
    """Download analysis results for a completed job"""
    try:
        with _processing_lock:
            job = _pcap_jobs.get(job_id)
        
        if not job:
            return jsonify({
                'status': 'error',
                'message': 'Job not found'
            }), 404
        
        if job['status'] != 'completed':
            return jsonify({
                'status': 'error',
                'message': f'Job is still {job["status"]}'
            }), 400
        
        # In a real implementation, return analysis results file
        return jsonify({
            'status': 'success',
            'message': 'Results available for download',
            'job': job
        }), 200
        
    except Exception as e:
        logger.error(f"Error downloading results: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


def _process_pcap(job_id: str, filepath: str):
    """
    Process PCAP file in background
    This is a placeholder - integrate with actual packet capture engine
    """
    try:
        with _processing_lock:
            job = _pcap_jobs.get(job_id)
        
        if not job:
            return
        
        # Mark as started
        job['status'] = 'processing'
        job['started_at'] = datetime.utcnow().isoformat()
        
        try:
            # Import PacketCaptureEngine for processing
            from backend.capture.packet_capture import PacketCaptureEngine
            
            engine = PacketCaptureEngine()
            
            # Simulate processing (in real implementation, use engine.load_pcap)
            # This would parse the PCAP file and run detection
            logger.info(f"Processing PCAP: {filepath}")
            
            # Update job with results
            job['packets_processed'] = 100  # Placeholder
            job['threats_detected'] = 5    # Placeholder
            job['status'] = 'completed'
            job['completed_at'] = datetime.utcnow().isoformat()
            job['progress'] = 100
            
        except Exception as e:
            job['status'] = 'failed'
            job['error'] = str(e)
            job['completed_at'] = datetime.utcnow().isoformat()
            logger.error(f"PCAP processing failed: {e}")
        
        finally:
            with _processing_lock:
                _pcap_jobs[job_id] = job
    
    except Exception as e:
        logger.error(f"Unexpected error in _process_pcap: {e}")


logger.info("✅ PCAP Handler API blueprint initialized")
