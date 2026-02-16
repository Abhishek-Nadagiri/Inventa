"""
Inventa Admin Routes
====================
Admin endpoints for database management and analytics.
"""

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from utils.database import db

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/stats', methods=['GET'])
def get_stats():
    """
    Get overall database statistics.
    Public endpoint for basic stats.
    """
    try:
        stats = db.get_stats()
        
        return jsonify({
            'success': True,
            'stats': {
                'users': stats['users_count'],
                'documents': stats['documents_count'],
                'loginHistory': stats['login_history_count'],
                'logins': stats['login_stats']
            }
        }), 200
        
    except Exception as e:
        print(f"Get stats error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to get statistics'
        }), 500


@admin_bp.route('/login-history', methods=['GET'])
def get_login_history():
    """
    Get login history.
    """
    try:
        limit = request.args.get('limit', 100, type=int)
        history = db.get_login_history(limit)
        
        # Format for response
        formatted_history = []
        for entry in history:
            formatted_history.append({
                'id': entry.get('id'),
                'userId': entry.get('user_id'),
                'userEmail': entry.get('user_email'),
                'userName': entry.get('user_name'),
                'status': entry.get('status'),
                'action': entry.get('action', 'login'),
                'failReason': entry.get('fail_reason'),
                'userAgent': entry.get('user_agent'),
                'timestamp': entry.get('timestamp')
            })
        
        return jsonify({
            'success': True,
            'history': formatted_history,
            'count': len(formatted_history)
        }), 200
        
    except Exception as e:
        print(f"Get login history error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to get login history'
        }), 500


@admin_bp.route('/users', methods=['GET'])
def get_all_users():
    """
    Get all users (without sensitive data).
    """
    try:
        users = db.get_all_users()
        
        # Remove sensitive data
        safe_users = []
        for user in users:
            safe_users.append({
                'id': user.get('id'),
                'username': user.get('username'),
                'email': user.get('email'),
                'createdAt': user.get('created_at'),
                'hasPublicKey': bool(user.get('public_key'))
            })
        
        return jsonify({
            'success': True,
            'users': safe_users,
            'count': len(safe_users)
        }), 200
        
    except Exception as e:
        print(f"Get users error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to get users'
        }), 500


@admin_bp.route('/documents', methods=['GET'])
def get_all_documents():
    """
    Get all documents (public metadata only).
    """
    try:
        documents = db.get_all_documents()
        
        # Format for response
        safe_documents = []
        for doc in documents:
            safe_documents.append({
                'id': doc.get('id'),
                'originalName': doc.get('original_name'),
                'hash': doc.get('hash'),
                'timestamp': doc.get('timestamp'),
                'userId': doc.get('user_id'),
                'fileSize': doc.get('file_size', 0),
                'metadata': doc.get('metadata', {})
            })
        
        # Sort by timestamp descending
        safe_documents.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        
        return jsonify({
            'success': True,
            'documents': safe_documents,
            'count': len(safe_documents)
        }), 200
        
    except Exception as e:
        print(f"Get documents error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to get documents'
        }), 500


@admin_bp.route('/export', methods=['GET'])
def export_database():
    """
    Export the entire database.
    WARNING: This includes sensitive data. Use with caution!
    """
    try:
        data = db.export_all()
        
        # Remove sensitive fields from users
        for user in data.get('users', []):
            user.pop('password_hash', None)
            user.pop('private_key', None)
        
        # Remove encrypted data from documents
        for doc in data.get('documents', []):
            doc.pop('encrypted_data', None)
            doc.pop('encryption_key', None)
            doc.pop('encryption_nonce', None)
        
        return jsonify({
            'success': True,
            'data': data
        }), 200
        
    except Exception as e:
        print(f"Export error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to export database'
        }), 500
