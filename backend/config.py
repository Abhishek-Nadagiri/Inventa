"""
Inventa Configuration
=====================
Central configuration for the Flask application.
"""

import os
from datetime import timedelta
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()


class Config:
    """Base configuration class."""
    
    # Flask Settings
    SECRET_KEY = os.getenv('SECRET_KEY', 'inventa-super-secret-key-change-in-production')
    DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'
    
    # JWT Settings
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'inventa-jwt-secret-key-change-in-production')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)
    
    # Database Settings
    DATABASE_PATH = os.getenv('DATABASE_PATH', 'data/inventa_db.json')
    USERS_TABLE = 'users'
    DOCUMENTS_TABLE = 'documents'
    LOGIN_HISTORY_TABLE = 'login_history'
    
    # File Upload Settings
    UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50 MB max file size
    ALLOWED_EXTENSIONS = {
        'pdf', 'doc', 'docx', 'txt', 'rtf',  # Documents
        'png', 'jpg', 'jpeg', 'gif', 'bmp', 'svg',  # Images
        'mp3', 'wav', 'ogg', 'flac', 'aac',  # Audio
        'mp4', 'avi', 'mov', 'mkv', 'webm',  # Video
        'zip', 'rar', '7z',  # Archives
    }
    
    # Encryption Settings
    AES_KEY_SIZE = 32  # 256 bits
    
    # CORS Settings
    CORS_ORIGINS = os.getenv('CORS_ORIGINS', '*')


class DevelopmentConfig(Config):
    """Development configuration."""
    DEBUG = True


class ProductionConfig(Config):
    """Production configuration."""
    DEBUG = False


# Select configuration based on environment
config_by_name = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig
}


def get_config():
    """Get configuration based on FLASK_ENV environment variable."""
    env = os.getenv('FLASK_ENV', 'development')
    return config_by_name.get(env, DevelopmentConfig)
