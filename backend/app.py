"""
Inventa Backend Application
===========================
Flask REST API for the Inventa IP Protection System.

Features:
- User authentication with JWT
- Document upload and encryption
- Ownership verification
- TinyDB database storage
"""

import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

from config import get_config
from routes.auth import auth_bp
from routes.documents import documents_bp
from routes.admin import admin_bp


def create_app():
    """Create and configure the Flask application."""
    
    # Initialize Flask app
    app = Flask(__name__)
    
    # Load configuration
    config = get_config()
    app.config.from_object(config)
    
    # Initialize CORS
    CORS(app, resources={
        r"/api/*": {
            "origins": config.CORS_ORIGINS,
            "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Initialize JWT
    jwt = JWTManager(app)
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({
            'success': False,
            'error': 'Token has expired',
            'code': 'token_expired'
        }), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({
            'success': False,
            'error': 'Invalid token',
            'code': 'token_invalid'
        }), 401
    
    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        return jsonify({
            'success': False,
            'error': 'Authorization required',
            'code': 'authorization_required'
        }), 401
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(documents_bp, url_prefix='/api')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    
    # Health check endpoint
    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'success': True,
            'message': 'Inventa API is running',
            'version': '1.0.0'
        }), 200
    
    # Root endpoint
    @app.route('/', methods=['GET'])
    def root():
        return jsonify({
            'name': 'Inventa API',
            'tagline': 'Where Ownership Begins',
            'version': '1.0.0',
            'endpoints': {
                'auth': {
                    'register': 'POST /api/register',
                    'login': 'POST /api/login',
                    'me': 'GET /api/me',
                    'refresh': 'POST /api/refresh',
                    'logout': 'POST /api/logout'
                },
                'documents': {
                    'upload': 'POST /api/upload',
                    'list': 'GET /api/documents',
                    'verify': 'POST /api/verify',
                    'proof': 'GET /api/proof/<document_id>',
                    'download': 'GET /api/download/<document_id>'
                },
                'admin': {
                    'stats': 'GET /api/admin/stats',
                    'users': 'GET /api/admin/users',
                    'documents': 'GET /api/admin/documents',
                    'loginHistory': 'GET /api/admin/login-history',
                    'export': 'GET /api/admin/export'
                }
            }
        }), 200
    
    # Ensure upload directory exists
    os.makedirs(config.UPLOAD_FOLDER, exist_ok=True)
    os.makedirs('data', exist_ok=True)
    
    print("""
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║   ██╗███╗   ██╗██╗   ██╗███████╗███╗   ██╗████████╗ █████╗   ║
    ║   ██║████╗  ██║██║   ██║██╔════╝████╗  ██║╚══██╔══╝██╔══██╗  ║
    ║   ██║██╔██╗ ██║██║   ██║█████╗  ██╔██╗ ██║   ██║   ███████║  ║
    ║   ██║██║╚██╗██║╚██╗ ██╔╝██╔══╝  ██║╚██╗██║   ██║   ██╔══██║  ║
    ║   ██║██║ ╚████║ ╚████╔╝ ███████╗██║ ╚████║   ██║   ██║  ██║  ║
    ║   ╚═╝╚═╝  ╚═══╝  ╚═══╝  ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝  ║
    ║                                                              ║
    ║           Where Ownership Begins                             ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """)
    
    return app


# Create the application instance
app = create_app()


if __name__ == '__main__':
    # Run the development server
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
