"""
Authentication & Authorization System
JWT-based auth with role-based access control
"""

import os
import jwt
import secrets
from datetime import datetime, timedelta
from functools import wraps
from typing import Dict, Any, Optional, Tuple
from flask import request, jsonify

class AuthManager:
    """Handle JWT authentication and authorization"""
    
    ROLES = {
        'admin': ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
        'analyst': ['read', 'write', 'export'],
        'viewer': ['read'],
    }
    
    def __init__(self):
        self.secret_key = os.getenv('JWT_SECRET_KEY', secrets.token_urlsafe(32))
        self.token_expiry = int(os.getenv('JWT_EXPIRY_HOURS', 24))
        self.users = {}
        self.api_keys = {}
    
    def generate_token(self, user_id: str, role: str = 'viewer', expires_in: int = None) -> str:
        """Generate JWT token"""
        if expires_in is None:
            expires_in = self.token_expiry
        
        payload = {
            'user_id': user_id,
            'role': role,
            'exp': datetime.utcnow() + timedelta(hours=expires_in),
            'iat': datetime.utcnow(),
        }
        
        return jwt.encode(payload, self.secret_key, algorithm='HS256')
    
    def verify_token(self, token: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """Verify and decode JWT token"""
        try:
            payload = jwt.decode(token, self.secret_key, algorithms=['HS256'])
            return True, payload
        except jwt.ExpiredSignatureError:
            return False, {'error': 'Token expired'}
        except jwt.InvalidTokenError:
            return False, {'error': 'Invalid token'}
    
    def has_permission(self, role: str, permission: str) -> bool:
        """Check if role has permission"""
        return permission in self.ROLES.get(role, [])
    
    def generate_api_key(self, name: str, user_id: str, role: str = 'viewer') -> str:
        """Generate API key for programmatic access"""
        api_key = secrets.token_urlsafe(32)
        
        self.api_keys[api_key] = {
            'name': name,
            'user_id': user_id,
            'role': role,
            'created_at': datetime.utcnow().isoformat(),
            'last_used': None,
        }
        
        return api_key
    
    def verify_api_key(self, api_key: str) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """Verify API key"""
        if api_key not in self.api_keys:
            return False, None
        
        key_data = self.api_keys[api_key]
        key_data['last_used'] = datetime.utcnow().isoformat()
        
        return True, key_data

# Initialize auth manager
auth_manager = AuthManager()

def require_auth(permission: str = 'read'):
    """Decorator to require authentication"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Check for JWT token or API key
            token = None
            api_key = None
            
            # Try Bearer token
            auth_header = request.headers.get('Authorization', '')
            if auth_header.startswith('Bearer '):
                token = auth_header[7:]
            
            # Try X-API-Key header
            api_key = request.headers.get('X-API-Key')
            
            if token:
                valid, payload = auth_manager.verify_token(token)
                if not valid:
                    return jsonify({'status': 'error', 'message': 'Invalid token'}), 401
                
                if not auth_manager.has_permission(payload.get('role'), permission):
                    return jsonify({'status': 'error', 'message': 'Insufficient permissions'}), 403
                
                request.user = payload
                return f(*args, **kwargs)
            
            elif api_key:
                valid, key_data = auth_manager.verify_api_key(api_key)
                if not valid:
                    return jsonify({'status': 'error', 'message': 'Invalid API key'}), 401
                
                if not auth_manager.has_permission(key_data.get('role'), permission):
                    return jsonify({'status': 'error', 'message': 'Insufficient permissions'}), 403
                
                request.user = {
                    'user_id': key_data['user_id'],
                    'role': key_data['role'],
                }
                return f(*args, **kwargs)
            
            else:
                return jsonify({'status': 'error', 'message': 'Missing authentication'}), 401
        
        return decorated_function
    return decorator
