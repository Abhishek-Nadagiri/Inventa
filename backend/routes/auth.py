"""
Inventa Authentication Routes
=============================
Handles user registration, login, and session management.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
    get_jwt
)
from datetime import datetime
import hashlib
import os

from utils.database import db
from utils.crypto import (
    generate_user_id,
    hash_password,
    verify_password,
    generate_ecc_keypair,
    generate_timestamp
)

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """
    Register a new user.
    
    Request Body:
    {
        "username": "johndoe",
        "email": "john@example.com",
        "password": "securepassword123"
    }
    
    Response:
    {
        "success": true,
        "message": "Registration successful",
        "user": { ... },
        "token": "jwt_token_here"
    }
    """
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        username = data.get('username', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not username or not email or not password:
            return jsonify({
                'success': False,
                'error': 'Username, email, and password are required'
            }), 400
        
        # Check if email already exists
        existing_user = db.get_user_by_email(email)
        if existing_user:
            return jsonify({
                'success': False,
                'error': 'Email already registered'
            }), 409
        
        # Check if username already exists
        existing_username = db.get_user_by_username(username)
        if existing_username:
            return jsonify({
                'success': False,
                'error': 'Username already taken'
            }), 409
        
        # Generate ECC key pair for the user
        private_key, public_key = generate_ecc_keypair()
        
        # Create user object
        user_id = generate_user_id()
        user = {
            'id': user_id,
            'username': username,
            'email': email,
            'password_hash': hash_password(password),
            'public_key': public_key,
            'private_key': private_key,  # In production, encrypt this!
            'created_at': generate_timestamp()
        }
        
        # Save to database
        db.create_user(user)
        
        # Generate JWT token
        access_token = create_access_token(identity=user_id)
        refresh_token = create_refresh_token(identity=user_id)
        
        # Record successful registration/login
        db.record_login({
            'id': f"login_{hashlib.sha256(os.urandom(16)).hexdigest()[:12]}",
            'user_id': user_id,
            'user_email': email,
            'user_name': username,
            'status': 'success',
            'action': 'register',
            'user_agent': request.headers.get('User-Agent', 'Unknown')
        })
        
        # Return user data (excluding sensitive fields)
        safe_user = {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'publicKey': user['public_key'],
            'createdAt': user['created_at']
        }
        
        return jsonify({
            'success': True,
            'message': 'Registration successful',
            'user': safe_user,
            'token': access_token,
            'refreshToken': refresh_token
        }), 201
        
    except Exception as e:
        print(f"Registration error: {e}")
        return jsonify({
            'success': False,
            'error': 'Registration failed. Please try again.'
        }), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Authenticate a user.
    
    Request Body:
    {
        "email": "john@example.com",
        "password": "securepassword123"
    }
    
    Response:
    {
        "success": true,
        "message": "Login successful",
        "user": { ... },
        "token": "jwt_token_here"
    }
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({
                'success': False,
                'error': 'No data provided'
            }), 400
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return jsonify({
                'success': False,
                'error': 'Email and password are required'
            }), 400
        
        # Find user by email
        user = db.get_user_by_email(email)
        
        if not user:
            # Record failed login
            db.record_login({
                'id': f"login_{hashlib.sha256(os.urandom(16)).hexdigest()[:12]}",
                'user_id': None,
                'user_email': email,
                'user_name': None,
                'status': 'failed',
                'fail_reason': 'User not found',
                'user_agent': request.headers.get('User-Agent', 'Unknown')
            })
            
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
        
        # Verify password
        if not verify_password(password, user['password_hash']):
            # Record failed login
            db.record_login({
                'id': f"login_{hashlib.sha256(os.urandom(16)).hexdigest()[:12]}",
                'user_id': user['id'],
                'user_email': email,
                'user_name': user['username'],
                'status': 'failed',
                'fail_reason': 'Invalid password',
                'user_agent': request.headers.get('User-Agent', 'Unknown')
            })
            
            return jsonify({
                'success': False,
                'error': 'Invalid email or password'
            }), 401
        
        # Generate JWT token
        access_token = create_access_token(identity=user['id'])
        refresh_token = create_refresh_token(identity=user['id'])
        
        # Record successful login
        db.record_login({
            'id': f"login_{hashlib.sha256(os.urandom(16)).hexdigest()[:12]}",
            'user_id': user['id'],
            'user_email': email,
            'user_name': user['username'],
            'status': 'success',
            'action': 'login',
            'user_agent': request.headers.get('User-Agent', 'Unknown')
        })
        
        # Return user data (excluding sensitive fields)
        safe_user = {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'publicKey': user['public_key'],
            'createdAt': user['created_at']
        }
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'user': safe_user,
            'token': access_token,
            'refreshToken': refresh_token
        }), 200
        
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({
            'success': False,
            'error': 'Login failed. Please try again.'
        }), 500


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """
    Get the current authenticated user's profile.
    Requires valid JWT token in Authorization header.
    """
    try:
        user_id = get_jwt_identity()
        user = db.get_user_by_id(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        safe_user = {
            'id': user['id'],
            'username': user['username'],
            'email': user['email'],
            'publicKey': user['public_key'],
            'createdAt': user['created_at']
        }
        
        return jsonify({
            'success': True,
            'user': safe_user
        }), 200
        
    except Exception as e:
        print(f"Get user error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to get user profile'
        }), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh the access token using a refresh token.
    """
    try:
        user_id = get_jwt_identity()
        access_token = create_access_token(identity=user_id)
        
        return jsonify({
            'success': True,
            'token': access_token
        }), 200
        
    except Exception as e:
        print(f"Token refresh error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to refresh token'
        }), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout the current user.
    In a production app, you would blacklist the token here.
    """
    try:
        user_id = get_jwt_identity()
        
        # Record logout
        user = db.get_user_by_id(user_id)
        if user:
            db.record_login({
                'id': f"login_{hashlib.sha256(os.urandom(16)).hexdigest()[:12]}",
                'user_id': user_id,
                'user_email': user['email'],
                'user_name': user['username'],
                'status': 'success',
                'action': 'logout',
                'user_agent': request.headers.get('User-Agent', 'Unknown')
            })
        
        return jsonify({
            'success': True,
            'message': 'Logged out successfully'
        }), 200
        
    except Exception as e:
        print(f"Logout error: {e}")
        return jsonify({
            'success': False,
            'error': 'Logout failed'
        }), 500
