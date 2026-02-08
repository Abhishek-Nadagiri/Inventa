/**
 * ORIGIN X - API Service
 * Simulates Flask RESTful API endpoints
 * All cryptographic operations happen client-side using Web Crypto API
 */

import type {
  User,
  Document,
  AuthSession,
  ApiResponse,
  LoginCredentials,
  RegisterCredentials,
  OwnershipProof,
  VerificationResult
} from '../types';
import {
  hashString,
  generateSHA256Hash,
  generateAESKey,
  exportAESKey,
  encryptFile,
  generateECCKeyPair,
  signData,
  generateTimestamp,
  generateId
} from './crypto';
import { UserStorage, DocumentStorage, SessionStorage } from './storage';

// Session duration: 24 hours
const SESSION_DURATION = 24 * 60 * 60 * 1000;

/**
 * POST /api/register
 * Register a new user with ECC key pair generation
 */
export async function register(
  credentials: RegisterCredentials
): Promise<ApiResponse<{ user: Pick<User, 'id' | 'username' | 'email'> }>> {
  try {
    // Validate input
    if (!credentials.username || !credentials.email || !credentials.password) {
      return { success: false, error: 'All fields are required' };
    }

    if (credentials.password !== credentials.confirmPassword) {
      return { success: false, error: 'Passwords do not match' };
    }

    if (credentials.password.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters' };
    }

    // Check if user exists
    if (UserStorage.getByEmail(credentials.email)) {
      return { success: false, error: 'Email already registered' };
    }

    if (UserStorage.getByUsername(credentials.username)) {
      return { success: false, error: 'Username already taken' };
    }

    // Generate cryptographic keys
    const passwordHash = await hashString(credentials.password);
    const { publicKey, privateKey } = await generateECCKeyPair();

    // Create user
    const user: User = {
      id: generateId(),
      username: credentials.username,
      email: credentials.email.toLowerCase(),
      passwordHash,
      publicKey,
      privateKey,
      createdAt: generateTimestamp()
    };

    UserStorage.create(user);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      }
    };
  } catch (error) {
    return { success: false, error: 'Registration failed. Please try again.' };
  }
}

/**
 * POST /api/login
 * Authenticate user and create session
 */
export async function login(
  credentials: LoginCredentials
): Promise<ApiResponse<{ user: Pick<User, 'id' | 'username' | 'email'>; token: string }>> {
  try {
    const { email, password } = credentials;

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    const user = UserStorage.getByEmail(email);
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    const passwordHash = await hashString(password);
    if (passwordHash !== user.passwordHash) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Create session token
    const token = generateId();
    const session: AuthSession = {
      userId: user.id,
      token,
      expiresAt: Date.now() + SESSION_DURATION
    };

    SessionStorage.set(session);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      }
    };
  } catch (error) {
    return { success: false, error: 'Login failed. Please try again.' };
  }
}

/**
 * Logout - Clear session
 */
export function logout(): void {
  SessionStorage.clear();
}

/**
 * Get current authenticated user
 */
export function getCurrentUser(): User | null {
  const session = SessionStorage.get();
  if (!session) return null;
  return UserStorage.getById(session.userId) || null;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * POST /api/upload
 * Upload and encrypt document, bind to owner
 */
export async function uploadDocument(
  file: File
): Promise<ApiResponse<{ document: Document }>> {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    // Generate document hash before encryption
    const originalHash = await generateSHA256Hash(file);

    // Check if document already exists
    const existingDoc = DocumentStorage.getByHash(originalHash);
    if (existingDoc) {
      return { 
        success: false, 
        error: 'This document has already been registered in the system' 
      };
    }

    // Generate AES key and encrypt document
    const aesKey = await generateAESKey();
    const exportedKey = await exportAESKey(aesKey);
    const { encryptedData, iv } = await encryptFile(file, aesKey);

    // Create timestamp
    const timestamp = generateTimestamp();

    // Sign the document hash with owner's private key
    const signatureData = `${originalHash}:${timestamp}:${user.id}`;
    const ownerSignature = await signData(signatureData, user.privateKey);

    // Create document record
    const document: Document = {
      id: generateId(),
      ownerId: user.id,
      filename: file.name,
      originalHash,
      encryptedData,
      encryptionIv: iv,
      encryptionKey: exportedKey,
      timestamp,
      ownerSignature,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream'
    };

    DocumentStorage.create(document);

    return { success: true, data: { document } };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, error: 'Document upload failed. Please try again.' };
  }
}

/**
 * POST /api/verify
 * Verify document ownership by hash or file upload
 */
export async function verifyDocument(
  input: { file?: File; hash?: string }
): Promise<ApiResponse<VerificationResult>> {
  try {
    let hash: string;

    if (input.file) {
      hash = await generateSHA256Hash(input.file);
    } else if (input.hash) {
      hash = input.hash.toLowerCase();
    } else {
      return { success: false, error: 'Please provide a file or hash to verify' };
    }

    const document = DocumentStorage.getByHash(hash);

    if (!document) {
      return {
        success: true,
        data: {
          verified: false,
          message: 'No ownership record found for this document'
        }
      };
    }

    const owner = UserStorage.getById(document.ownerId);
    if (!owner) {
      return { success: false, error: 'Owner record not found' };
    }

    return {
      success: true,
      data: {
        verified: true,
        document,
        owner: {
          username: owner.username,
          publicKey: owner.publicKey
        },
        message: 'Document ownership verified successfully'
      }
    };
  } catch (error) {
    return { success: false, error: 'Verification failed. Please try again.' };
  }
}

/**
 * GET /api/documents
 * Get all documents for authenticated user
 */
export function getUserDocuments(): ApiResponse<{ documents: Document[] }> {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Authentication required' };
  }

  const documents = DocumentStorage.getByOwnerId(user.id);
  return { success: true, data: { documents } };
}

/**
 * GET /api/proof/:document_id
 * Generate ownership proof for a document
 */
export async function generateProof(
  documentId: string
): Promise<ApiResponse<{ proof: OwnershipProof }>> {
  try {
    const user = getCurrentUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    const document = DocumentStorage.getById(documentId);
    if (!document) {
      return { success: false, error: 'Document not found' };
    }

    if (document.ownerId !== user.id) {
      return { success: false, error: 'You are not the owner of this document' };
    }

    const proofGenerated = generateTimestamp();
    const proofData = `${document.originalHash}:${document.timestamp}:${user.username}:${proofGenerated}`;
    const signature = await signData(proofData, user.privateKey);

    const proof: OwnershipProof = {
      documentId: document.id,
      documentHash: document.originalHash,
      timestamp: document.timestamp,
      ownerUsername: user.username,
      ownerPublicKey: user.publicKey,
      signature,
      proofGenerated
    };

    return { success: true, data: { proof } };
  } catch (error) {
    return { success: false, error: 'Failed to generate proof. Please try again.' };
  }
}

/**
 * Delete a document (owner only)
 */
export function deleteDocument(documentId: string): ApiResponse<void> {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'Authentication required' };
  }

  const document = DocumentStorage.getById(documentId);
  if (!document) {
    return { success: false, error: 'Document not found' };
  }

  if (document.ownerId !== user.id) {
    return { success: false, error: 'You are not the owner of this document' };
  }

  DocumentStorage.delete(documentId);
  return { success: true };
}
