"""
Inventa Database Utilities
==========================
TinyDB wrapper for document-based storage.
Handles all database operations for users, documents, and login history.
"""

import os
from tinydb import TinyDB, Query
from tinydb.table import Table
from typing import Optional, List, Dict, Any
from datetime import datetime

from config import get_config

config = get_config()


class Database:
    """
    TinyDB database wrapper for Inventa.
    Provides CRUD operations for users, documents, and login history.
    """
    
    _instance = None
    
    def __new__(cls):
        """Singleton pattern to ensure only one database instance."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize the database connection."""
        # Ensure data directory exists
        db_path = config.DATABASE_PATH
        os.makedirs(os.path.dirname(db_path), exist_ok=True)
        
        # Initialize TinyDB
        self.db = TinyDB(db_path, indent=2)
        
        # Get table references
        self.users = self.db.table(config.USERS_TABLE)
        self.documents = self.db.table(config.DOCUMENTS_TABLE)
        self.login_history = self.db.table(config.LOGIN_HISTORY_TABLE)
        
        print(f"✅ Database initialized at: {db_path}")
        print(f"   - Users: {len(self.users)} records")
        print(f"   - Documents: {len(self.documents)} records")
        print(f"   - Login History: {len(self.login_history)} records")
    
    # ==================== USER OPERATIONS ====================
    
    def create_user(self, user_data: dict) -> dict:
        """Create a new user."""
        user_data['created_at'] = datetime.utcnow().isoformat() + 'Z'
        self.users.insert(user_data)
        print(f"✅ User created: {user_data.get('username')}")
        return user_data
    
    def get_user_by_id(self, user_id: str) -> Optional[dict]:
        """Get user by ID."""
        User = Query()
        result = self.users.search(User.id == user_id)
        return result[0] if result else None
    
    def get_user_by_email(self, email: str) -> Optional[dict]:
        """Get user by email (case-insensitive)."""
        User = Query()
        result = self.users.search(User.email.test(lambda e: e.lower() == email.lower()))
        return result[0] if result else None
    
    def get_user_by_username(self, username: str) -> Optional[dict]:
        """Get user by username."""
        User = Query()
        result = self.users.search(User.username == username)
        return result[0] if result else None
    
    def get_all_users(self) -> List[dict]:
        """Get all users."""
        return self.users.all()
    
    def update_user(self, user_id: str, data: dict) -> bool:
        """Update user data."""
        User = Query()
        self.users.update(data, User.id == user_id)
        return True
    
    def delete_user(self, user_id: str) -> bool:
        """Delete a user."""
        User = Query()
        self.users.remove(User.id == user_id)
        return True
    
    # ==================== DOCUMENT OPERATIONS ====================
    
    def create_document(self, doc_data: dict) -> dict:
        """Create a new document record."""
        doc_data['created_at'] = datetime.utcnow().isoformat() + 'Z'
        self.documents.insert(doc_data)
        print(f"✅ Document created: {doc_data.get('id')}")
        return doc_data
    
    def get_document_by_id(self, doc_id: str) -> Optional[dict]:
        """Get document by ID."""
        Doc = Query()
        result = self.documents.search(Doc.id == doc_id)
        return result[0] if result else None
    
    def get_document_by_hash(self, doc_hash: str) -> Optional[dict]:
        """Get document by hash."""
        Doc = Query()
        result = self.documents.search(Doc.hash == doc_hash)
        return result[0] if result else None
    
    def get_documents_by_user(self, user_id: str) -> List[dict]:
        """Get all documents for a user."""
        Doc = Query()
        return self.documents.search(Doc.user_id == user_id)
    
    def get_all_documents(self) -> List[dict]:
        """Get all documents."""
        return self.documents.all()
    
    def update_document(self, doc_id: str, data: dict) -> bool:
        """Update document data."""
        Doc = Query()
        self.documents.update(data, Doc.id == doc_id)
        return True
    
    def delete_document(self, doc_id: str) -> bool:
        """Delete a document."""
        Doc = Query()
        self.documents.remove(Doc.id == doc_id)
        return True
    
    # ==================== LOGIN HISTORY OPERATIONS ====================
    
    def record_login(self, login_data: dict) -> dict:
        """Record a login attempt."""
        login_data['timestamp'] = datetime.utcnow().isoformat() + 'Z'
        self.login_history.insert(login_data)
        return login_data
    
    def get_login_history(self, limit: int = 100) -> List[dict]:
        """Get login history, most recent first."""
        history = self.login_history.all()
        # Sort by timestamp descending
        history.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        return history[:limit]
    
    def get_user_login_history(self, user_id: str) -> List[dict]:
        """Get login history for a specific user."""
        Login = Query()
        history = self.login_history.search(Login.user_id == user_id)
        history.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
        return history
    
    def get_login_stats(self) -> dict:
        """Get login statistics."""
        all_logins = self.login_history.all()
        
        total = len(all_logins)
        successful = len([l for l in all_logins if l.get('status') == 'success'])
        failed = len([l for l in all_logins if l.get('status') == 'failed'])
        
        # Get unique users
        unique_users = set(l.get('user_id') for l in all_logins if l.get('user_id'))
        
        # Today's logins
        today = datetime.utcnow().date().isoformat()
        today_logins = len([l for l in all_logins if l.get('timestamp', '').startswith(today)])
        
        return {
            'total_logins': total,
            'successful_logins': successful,
            'failed_logins': failed,
            'unique_users': len(unique_users),
            'today_logins': today_logins
        }
    
    # ==================== UTILITY OPERATIONS ====================
    
    def get_stats(self) -> dict:
        """Get overall database statistics."""
        return {
            'users_count': len(self.users),
            'documents_count': len(self.documents),
            'login_history_count': len(self.login_history),
            'login_stats': self.get_login_stats()
        }
    
    def clear_all(self):
        """Clear all data (use with caution!)."""
        self.db.drop_tables()
        self._initialize()
        print("⚠️ All data cleared!")
    
    def export_all(self) -> dict:
        """Export all data as a dictionary."""
        return {
            'users': self.users.all(),
            'documents': self.documents.all(),
            'login_history': self.login_history.all(),
            'exported_at': datetime.utcnow().isoformat() + 'Z'
        }


# Create a global database instance
db = Database()
