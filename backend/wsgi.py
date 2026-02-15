"""
Inventa WSGI Entry Point
========================
For production deployment with Gunicorn or other WSGI servers.

Usage:
    gunicorn wsgi:app
"""

from app import app

if __name__ == '__main__':
    app.run()
