"""
Inventa Document Routes
=======================
Handles document upload, retrieval, and ownership proof generation.
"""

import os
import base64
from flask import Blueprint, request, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename
from datetime import datetime
import io

from config import get_config
from utils.database import db
from utils.crypto import (
    generate_document_id,
    hash_file,
    encrypt_file,
    decrypt_file,
    sign_document,
    generate_timestamp,
    create_ownership_proof
)

config = get_config()
documents_bp = Blueprint('documents', __name__)


def allowed_file(filename):
    """Check if the file extension is allowed."""
    if '.' not in filename:
        return True  # Allow files without extension
    ext = filename.rsplit('.', 1)[1].lower()
    return ext in config.ALLOWED_EXTENSIONS


@documents_bp.route('/upload', methods=['POST'])
@jwt_required()
def upload_document():
    """
    Upload and register a new document.
    
    Request: multipart/form-data
    - file: The document file
    - ownerName: Name of the owner
    - description: Document description
    - documentType: Type of document (pdf, image, audio, video, article, other)
    - workType: Type of work (human, ai)
    - proofOfWork: (optional) Proof of work file
    
    Response:
    {
        "success": true,
        "document": { ... }
    }
    """
    try:
        user_id = get_jwt_identity()
        user = db.get_user_by_id(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        # Check if file is in request
        if 'file' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No file provided'
            }), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected'
            }), 400
        
        if not allowed_file(file.filename):
            return jsonify({
                'success': False,
                'error': 'File type not allowed'
            }), 400
        
        # Get metadata from form
        owner_name = request.form.get('ownerName', user['username'])
        description = request.form.get('description', '')
        document_type = request.form.get('documentType', 'other')
        work_type = request.form.get('workType', 'human')
        
        # Read file data
        file_data = file.read()
        original_filename = secure_filename(file.filename)
        
        # Generate document hash (fingerprint)
        doc_hash = hash_file(file_data)
        
        # Check if document already exists
        existing_doc = db.get_document_by_hash(doc_hash)
        if existing_doc:
            return jsonify({
                'success': False,
                'error': 'This document has already been registered',
                'existingDocument': {
                    'id': existing_doc['id'],
                    'registeredAt': existing_doc['timestamp'],
                    'ownerId': existing_doc['user_id']
                }
            }), 409
        
        # Encrypt the document
        encryption_result = encrypt_file(file_data)
        
        # Generate timestamp
        timestamp = generate_timestamp()
        
        # Create signature data (hash + timestamp + user_id)
        signature_data = f"{doc_hash}:{timestamp}:{user_id}"
        signature = sign_document(signature_data, user['private_key'])
        
        # Handle proof of work file if provided
        proof_of_work = None
        if 'proofOfWork' in request.files:
            proof_file = request.files['proofOfWork']
            if proof_file.filename:
                proof_data = proof_file.read()
                proof_of_work = {
                    'filename': secure_filename(proof_file.filename),
                    'data': base64.b64encode(proof_data).decode('utf-8'),
                    'size': len(proof_data)
                }
        
        # Generate document ID
        doc_id = generate_document_id()
        
        # Create document record
        document = {
            'id': doc_id,
            'user_id': user_id,
            'original_name': original_filename,
            'hash': doc_hash,
            'timestamp': timestamp,
            'signature': signature,
            'encrypted_data': encryption_result['encrypted_data'],
            'encryption_nonce': encryption_result['nonce'],
            'encryption_key': encryption_result['key'],
            'file_size': len(file_data),
            'metadata': {
                'owner_name': owner_name,
                'description': description,
                'document_type': document_type,
                'work_type': work_type,
                'proof_of_work': proof_of_work
            }
        }
        
        # Save to database
        db.create_document(document)
        
        # Return response (exclude encryption key and encrypted data)
        safe_document = {
            'id': document['id'],
            'originalName': document['original_name'],
            'hash': document['hash'],
            'timestamp': document['timestamp'],
            'signature': document['signature'],
            'fileSize': document['file_size'],
            'metadata': document['metadata'],
            'userId': document['user_id']
        }
        
        return jsonify({
            'success': True,
            'message': 'Document registered successfully',
            'document': safe_document
        }), 201
        
    except Exception as e:
        print(f"Upload error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to upload document. Please try again.'
        }), 500


@documents_bp.route('/documents', methods=['GET'])
@jwt_required()
def get_user_documents():
    """
    Get all documents for the authenticated user.
    """
    try:
        user_id = get_jwt_identity()
        documents = db.get_documents_by_user(user_id)
        
        # Format documents for response
        safe_documents = []
        for doc in documents:
            safe_documents.append({
                'id': doc['id'],
                'originalName': doc['original_name'],
                'hash': doc['hash'],
                'timestamp': doc['timestamp'],
                'signature': doc['signature'],
                'fileSize': doc.get('file_size', 0),
                'metadata': doc.get('metadata', {}),
                'userId': doc['user_id']
            })
        
        # Sort by timestamp descending
        safe_documents.sort(key=lambda x: x['timestamp'], reverse=True)
        
        return jsonify({
            'success': True,
            'documents': safe_documents,
            'count': len(safe_documents)
        }), 200
        
    except Exception as e:
        print(f"Get documents error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to retrieve documents'
        }), 500


@documents_bp.route('/proof/<document_id>', methods=['GET'])
@jwt_required()
def get_ownership_proof(document_id):
    """
    Get ownership proof for a specific document.
    Only the document owner can access this.
    """
    try:
        user_id = get_jwt_identity()
        
        # Get the document
        document = db.get_document_by_id(document_id)
        
        if not document:
            return jsonify({
                'success': False,
                'error': 'Document not found'
            }), 404
        
        # Verify ownership
        if document['user_id'] != user_id:
            return jsonify({
                'success': False,
                'error': 'Access denied. You are not the owner of this document.'
            }), 403
        
        # Get user info
        user = db.get_user_by_id(user_id)
        
        if not user:
            return jsonify({
                'success': False,
                'error': 'User not found'
            }), 404
        
        # Generate ownership proof
        proof = create_ownership_proof(document, user)
        
        return jsonify({
            'success': True,
            'proof': proof
        }), 200
        
    except Exception as e:
        print(f"Get proof error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to generate ownership proof'
        }), 500


@documents_bp.route('/verify', methods=['POST'])
def verify_document():
    """
    Verify a document by file upload or hash.
    This endpoint is public (no authentication required).
    
    Request: multipart/form-data OR JSON
    - file: The document file to verify
    OR
    - hash: The SHA-256 hash to verify
    
    Response:
    {
        "success": true,
        "verified": true/false,
        "document": { ... }
    }
    """
    try:
        doc_hash = None
        
        # Check if file is provided
        if 'file' in request.files:
            file = request.files['file']
            if file.filename:
                file_data = file.read()
                doc_hash = hash_file(file_data)
        
        # Check if hash is provided in form data
        if not doc_hash:
            doc_hash = request.form.get('hash')
        
        # Check if hash is provided in JSON body
        if not doc_hash:
            json_data = request.get_json(silent=True)
            if json_data:
                doc_hash = json_data.get('hash')
        
        if not doc_hash:
            return jsonify({
                'success': False,
                'error': 'No file or hash provided for verification'
            }), 400
        
        # Clean the hash
        doc_hash = doc_hash.strip().lower()
        
        # Search for document by hash
        document = db.get_document_by_hash(doc_hash)
        
        if not document:
            return jsonify({
                'success': True,
                'verified': False,
                'message': 'No registration found for this document',
                'hash': doc_hash
            }), 200
        
        # Get owner info
        user = db.get_user_by_id(document['user_id'])
        
        # Document found - return verification info
        verification_result = {
            'success': True,
            'verified': True,
            'message': 'Document ownership verified',
            'document': {
                'id': document['id'],
                'hash': document['hash'],
                'filename': document['original_name'],
                'registeredAt': document['timestamp'],
                'signature': document['signature'],
                'metadata': document.get('metadata', {})
            },
            'owner': {
                'id': user['id'] if user else None,
                'username': user['username'] if user else 'Unknown',
                'publicKey': user['public_key'] if user else None
            }
        }
        
        return jsonify(verification_result), 200
        
    except Exception as e:
        print(f"Verify error: {e}")
        return jsonify({
            'success': False,
            'error': 'Verification failed. Please try again.'
        }), 500


@documents_bp.route('/download/<document_id>', methods=['GET'])
@jwt_required()
def download_document(document_id):
    """
    Download the original document (decrypted).
    Only the document owner can download.
    """
    try:
        user_id = get_jwt_identity()
        
        # Get the document
        document = db.get_document_by_id(document_id)
        
        if not document:
            return jsonify({
                'success': False,
                'error': 'Document not found'
            }), 404
        
        # Verify ownership
        if document['user_id'] != user_id:
            return jsonify({
                'success': False,
                'error': 'Access denied. You are not the owner of this document.'
            }), 403
        
        # Decrypt the document
        decrypted_data = decrypt_file(
            document['encrypted_data'],
            document['encryption_nonce'],
            document['encryption_key']
        )
        
        if not decrypted_data:
            return jsonify({
                'success': False,
                'error': 'Failed to decrypt document'
            }), 500
        
        # Send file
        return send_file(
            io.BytesIO(decrypted_data),
            download_name=document['original_name'],
            as_attachment=True
        )
        
    except Exception as e:
        print(f"Download error: {e}")
        return jsonify({
            'success': False,
            'error': 'Failed to download document'
        }), 500
