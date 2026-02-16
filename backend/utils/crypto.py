"""
Inventa Cryptography Utilities
==============================
Handles all cryptographic operations including:
- SHA-256 document hashing
- AES-GCM encryption/decryption
- ECC key pair generation
- ECDSA signing and verification
"""

import os
import hashlib
import base64
import json
from datetime import datetime
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from cryptography.hazmat.backends import default_backend


def generate_document_id():
    """Generate a unique document ID."""
    random_bytes = os.urandom(16)
    return f"doc_{hashlib.sha256(random_bytes).hexdigest()[:16]}"


def generate_user_id():
    """Generate a unique user ID."""
    random_bytes = os.urandom(16)
    return f"user_{hashlib.sha256(random_bytes).hexdigest()[:12]}"


def hash_password(password: str) -> str:
    """
    Hash a password using SHA-256.
    In production, use bcrypt or Argon2 instead.
    """
    return hashlib.sha256(password.encode('utf-8')).hexdigest()


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash."""
    return hash_password(password) == password_hash


def hash_file(file_data: bytes) -> str:
    """
    Generate SHA-256 hash of file data.
    This creates a unique fingerprint of the document.
    """
    return hashlib.sha256(file_data).hexdigest()


def generate_ecc_keypair():
    """
    Generate an ECC key pair using NIST P-256 curve.
    Returns (private_key_pem, public_key_pem) as strings.
    """
    # Generate private key
    private_key = ec.generate_private_key(ec.SECP256R1(), default_backend())
    
    # Serialize private key to PEM format
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ).decode('utf-8')
    
    # Get public key and serialize
    public_key = private_key.public_key()
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')
    
    return private_pem, public_pem


def sign_document(data: str, private_key_pem: str) -> str:
    """
    Sign document data using ECDSA with the private key.
    Returns base64-encoded signature.
    """
    try:
        # Load private key
        private_key = serialization.load_pem_private_key(
            private_key_pem.encode('utf-8'),
            password=None,
            backend=default_backend()
        )
        
        # Sign the data
        signature = private_key.sign(
            data.encode('utf-8'),
            ec.ECDSA(hashes.SHA256())
        )
        
        return base64.b64encode(signature).decode('utf-8')
    except Exception as e:
        print(f"Signing error: {e}")
        return ""


def verify_signature(data: str, signature_b64: str, public_key_pem: str) -> bool:
    """
    Verify a signature using the public key.
    Returns True if signature is valid.
    """
    try:
        # Load public key
        public_key = serialization.load_pem_public_key(
            public_key_pem.encode('utf-8'),
            backend=default_backend()
        )
        
        # Decode signature
        signature = base64.b64decode(signature_b64)
        
        # Verify
        public_key.verify(
            signature,
            data.encode('utf-8'),
            ec.ECDSA(hashes.SHA256())
        )
        return True
    except Exception:
        return False


def generate_aes_key() -> bytes:
    """Generate a random 256-bit AES key."""
    return os.urandom(32)


def encrypt_file(file_data: bytes, key: bytes = None) -> dict:
    """
    Encrypt file data using AES-256-GCM.
    Returns dict with encrypted data, nonce, and key (all base64 encoded).
    """
    if key is None:
        key = generate_aes_key()
    
    # Generate random nonce (12 bytes for GCM)
    nonce = os.urandom(12)
    
    # Create cipher and encrypt
    aesgcm = AESGCM(key)
    encrypted_data = aesgcm.encrypt(nonce, file_data, None)
    
    return {
        'encrypted_data': base64.b64encode(encrypted_data).decode('utf-8'),
        'nonce': base64.b64encode(nonce).decode('utf-8'),
        'key': base64.b64encode(key).decode('utf-8')
    }


def decrypt_file(encrypted_data_b64: str, nonce_b64: str, key_b64: str) -> bytes:
    """
    Decrypt file data using AES-256-GCM.
    Returns decrypted file bytes.
    """
    try:
        encrypted_data = base64.b64decode(encrypted_data_b64)
        nonce = base64.b64decode(nonce_b64)
        key = base64.b64decode(key_b64)
        
        aesgcm = AESGCM(key)
        decrypted_data = aesgcm.decrypt(nonce, encrypted_data, None)
        
        return decrypted_data
    except Exception as e:
        print(f"Decryption error: {e}")
        return None


def generate_timestamp() -> str:
    """Generate ISO format timestamp."""
    return datetime.utcnow().isoformat() + 'Z'


def create_ownership_proof(document: dict, user: dict) -> dict:
    """
    Create a complete ownership proof for a document.
    """
    return {
        'document_id': document.get('id'),
        'document_hash': document.get('hash'),
        'filename': document.get('original_name'),
        'owner_id': user.get('id'),
        'owner_name': document.get('metadata', {}).get('owner_name', user.get('username')),
        'owner_username': user.get('username'),
        'owner_email': user.get('email'),
        'owner_public_key': user.get('public_key'),
        'timestamp': document.get('timestamp'),
        'signature': document.get('signature'),
        'metadata': document.get('metadata', {}),
        'verification_status': 'VERIFIED',
        'generated_at': generate_timestamp()
    }
