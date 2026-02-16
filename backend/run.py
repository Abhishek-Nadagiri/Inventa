#!/usr/bin/env python3
"""
Inventa Backend Runner
======================
Simple script to run the Flask development server.
"""

from app import app

if __name__ == '__main__':
    print("\n🚀 Starting Inventa Backend Server...")
    print("📍 API URL: http://localhost:5000")
    print("📖 API Docs: http://localhost:5000/")
    print("\n")
    
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True
    )
