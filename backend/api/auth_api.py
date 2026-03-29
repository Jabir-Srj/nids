"""
User Authentication API
JWT-based authentication with RBAC (Role-Based Access Control)
"""

from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import logging
import sqlite3
import hashlib
import secrets
import jwt
import threading
from typing import Dict, Optional, Tuple
from functools import wraps

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')
logger = logging.getLogger(__name__)

DB_PATH = 'backend/database/nids.db'
SECRET_KEY = secrets.token_urlsafe(32)  # In production, use environment variable
_db_lock = threading.Lock()

# Token expiration times
ACCESS_TOKEN_EXPIRE_HOURS = 24
REFRESH_TOKEN_EXPIRE_DAYS = 7


def _get_db():
    """Get database connection"""
    return sqlite3.connect(DB_PATH)


def _init_auth_db():
    """Initialize authentication tables"""
    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    username TEXT UNIQUE NOT NULL,
                    email TEXT UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    role TEXT DEFAULT 'viewer',
                    created_at TEXT NOT NULL,
                    last_login TEXT,
                    is_active BOOLEAN DEFAULT 1
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS tokens (
                    token_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL,
                    token_type TEXT,
                    expires_at TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    is_revoked BOOLEAN DEFAULT 0,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                )
            ''')
            
            conn.execute('''
                CREATE TABLE IF NOT EXISTS roles (
                    role_name TEXT PRIMARY KEY,
                    description TEXT,
                    permissions TEXT
                )
            ''')
            
            # Insert default roles
            conn.execute('INSERT OR IGNORE INTO roles VALUES (?, ?, ?)',
                        ('admin', 'Full system access', 'read,write,delete,configure'))
            conn.execute('INSERT OR IGNORE INTO roles VALUES (?, ?, ?)',
                        ('analyst', 'Alert analysis access', 'read,write'))
            conn.execute('INSERT OR IGNORE INTO roles VALUES (?, ?, ?)',
                        ('viewer', 'Read-only access', 'read'))
            
            conn.commit()
            logger.info("✅ Auth tables initialized")
    except Exception as e:
        logger.error(f"Error initializing auth tables: {e}")


def hash_password(password: str) -> str:
    """Hash password with salt"""
    salt = secrets.token_hex(32)
    pwd_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
    return f"{salt}${pwd_hash.hex()}"


def verify_password(password: str, hash_: str) -> bool:
    """Verify password against hash"""
    try:
        salt, pwd_hash = hash_.split('$')
        new_hash = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 100000)
        return new_hash.hex() == pwd_hash
    except:
        return False


def create_access_token(user_id: str, username: str, role: str) -> str:
    """Create JWT access token"""
    payload = {
        'user_id': user_id,
        'username': username,
        'role': role,
        'exp': datetime.utcnow() + timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
        'iat': datetime.utcnow(),
        'type': 'access'
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def create_refresh_token(user_id: str) -> str:
    """Create JWT refresh token"""
    payload = {
        'user_id': user_id,
        'exp': datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        'iat': datetime.utcnow(),
        'type': 'refresh'
    }
    return jwt.encode(payload, SECRET_KEY, algorithm='HS256')


def verify_token(token: str) -> Optional[Dict]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        logger.warning("Token expired")
        return None
    except jwt.InvalidTokenError:
        logger.warning("Invalid token")
        return None


def token_required(f):
    """Decorator to require valid token"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        
        # Check for token in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'status': 'error', 'message': 'Invalid token format'}), 401
        
        if not token:
            return jsonify({'status': 'error', 'message': 'Token missing'}), 401
        
        # Verify token
        payload = verify_token(token)
        if not payload:
            return jsonify({'status': 'error', 'message': 'Invalid or expired token'}), 401
        
        # Pass user info to the route
        request.user = payload
        return f(*args, **kwargs)
    
    return decorated


def role_required(required_role: str):
    """Decorator to require specific role"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not hasattr(request, 'user'):
                return jsonify({'status': 'error', 'message': 'Authentication required'}), 401
            
            user_role = request.user.get('role', 'viewer')
            
            # Role hierarchy: admin > analyst > viewer
            role_hierarchy = {'admin': 3, 'analyst': 2, 'viewer': 1}
            required_level = role_hierarchy.get(required_role, 0)
            user_level = role_hierarchy.get(user_role, 0)
            
            if user_level < required_level:
                return jsonify({
                    'status': 'error',
                    'message': f'Insufficient permissions. Required: {required_role}'
                }), 403
            
            return f(*args, **kwargs)
        
        return decorated
    return decorator


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    try:
        _init_auth_db()
        
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'JSON required'}), 400
        
        data = request.json
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        
        if not all([username, email, password]):
            return jsonify({
                'status': 'error',
                'message': 'Missing required fields: username, email, password'
            }), 400
        
        if len(password) < 8:
            return jsonify({
                'status': 'error',
                'message': 'Password must be at least 8 characters'
            }), 400
        
        user_id = secrets.token_urlsafe(16)
        password_hash = hash_password(password)
        now = datetime.utcnow().isoformat()
        
        try:
            with _db_lock:
                conn = _get_db()
                cursor = conn.cursor()
                cursor.execute('''
                    INSERT INTO users (id, username, email, password_hash, role, created_at, is_active)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (user_id, username, email, password_hash, 'viewer', now, True))
                conn.commit()
                conn.close()
            
            return jsonify({
                'status': 'success',
                'message': 'User registered successfully',
                'user_id': user_id
            }), 201
            
        except sqlite3.IntegrityError:
            return jsonify({
                'status': 'error',
                'message': 'Username or email already exists'
            }), 409
        
    except Exception as e:
        logger.error(f"Error registering user: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user and return tokens"""
    try:
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'JSON required'}), 400
        
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not all([username, password]):
            return jsonify({
                'status': 'error',
                'message': 'Username and password required'
            }), 400
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, password_hash, role, is_active FROM users
                WHERE username = ?
            ''', (username,))
            user = cursor.fetchone()
            conn.close()
        
        if not user or not verify_password(password, user[1]):
            return jsonify({
                'status': 'error',
                'message': 'Invalid credentials'
            }), 401
        
        user_id, _, role, is_active = user
        
        if not is_active:
            return jsonify({
                'status': 'error',
                'message': 'User account is inactive'
            }), 403
        
        # Update last login
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            cursor.execute('''
                UPDATE users SET last_login = ? WHERE id = ?
            ''', (datetime.utcnow().isoformat(), user_id))
            conn.commit()
            conn.close()
        
        # Create tokens
        access_token = create_access_token(user_id, username, role)
        refresh_token = create_refresh_token(user_id)
        
        return jsonify({
            'status': 'success',
            'message': 'Login successful',
            'access_token': access_token,
            'refresh_token': refresh_token,
            'user': {
                'id': user_id,
                'username': username,
                'role': role
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Error logging in: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@auth_bp.route('/refresh', methods=['POST'])
def refresh_access_token():
    """Refresh access token using refresh token"""
    try:
        if not request.is_json:
            return jsonify({'status': 'error', 'message': 'JSON required'}), 400
        
        refresh_token = request.json.get('refresh_token')
        
        if not refresh_token:
            return jsonify({
                'status': 'error',
                'message': 'Refresh token required'
            }), 400
        
        payload = verify_token(refresh_token)
        if not payload or payload.get('type') != 'refresh':
            return jsonify({
                'status': 'error',
                'message': 'Invalid or expired refresh token'
            }), 401
        
        user_id = payload.get('user_id')
        
        with _db_lock:
            conn = _get_db()
            cursor = conn.cursor()
            cursor.execute('SELECT username, role FROM users WHERE id = ?', (user_id,))
            user = cursor.fetchone()
            conn.close()
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
        username, role = user
        access_token = create_access_token(user_id, username, role)
        
        return jsonify({
            'status': 'success',
            'access_token': access_token
        }), 200
        
    except Exception as e:
        logger.error(f"Error refreshing token: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    """Get current authenticated user info"""
    try:
        user_id = request.user.get('user_id')
        
        with _db_lock:
            conn = _get_db()
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, username, email, role, created_at, last_login
                FROM users WHERE id = ?
            ''', (user_id,))
            user = cursor.fetchone()
            conn.close()
        
        if not user:
            return jsonify({
                'status': 'error',
                'message': 'User not found'
            }), 404
        
        return jsonify({
            'status': 'success',
            'user': dict(user)
        }), 200
        
    except Exception as e:
        logger.error(f"Error getting current user: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@token_required
def logout():
    """Logout user (revoke token)"""
    try:
        # In a real implementation, add token to blacklist
        return jsonify({
            'status': 'success',
            'message': 'Logged out successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Error logging out: {e}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500


logger.info("✅ Authentication API blueprint initialized")
