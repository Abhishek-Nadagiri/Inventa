/**
 * Inventa Type Definitions
 * ========================
 * Core TypeScript types for the application.
 */

// Document types
export type DocType = 'audio' | 'video' | 'image' | 'pdf' | 'article' | 'other';
export type DocWorkType = 'human_made' | 'ai_generated';

// User interface (public - returned from API)
export interface User {
  id: string;
  username: string;
  email: string;
  publicKey?: string;
  privateKey?: string;
  createdAt?: string;
}

// Internal user with password hash (for localStorage storage)
export interface StoredUser extends User {
  passwordHash?: string;
}

// Proof of work file
export interface ProofOfWorkFile {
  filename: string;
  data?: string;
  size?: number;
  hash?: string;
}

// Document metadata
export interface DocumentMetadata {
  ownerName: string;
  description: string;
  documentType: DocType;
  workType: DocWorkType;
  proofOfWorkFilename?: string;
  proofOfWorkHash?: string;
  proofOfWork?: ProofOfWorkFile;
  // Support snake_case from backend
  owner_name?: string;
  document_type?: string;
  work_type?: string;
  proof_of_work?: ProofOfWorkFile;
}

// Document interface
export interface Document {
  id: string;
  userId?: string;
  user_id?: string;
  filename: string;
  originalName?: string;
  original_name?: string;
  hash?: string;
  originalHash?: string;
  timestamp: string;
  signature?: string;
  encryptedData?: string;
  encrypted_data?: string;
  fileSize?: number;
  file_size?: number;
  metadata?: DocumentMetadata;
}

// Ownership proof
export interface OwnershipProof {
  documentId: string;
  documentHash: string;
  ownerUsername: string;
  ownerPublicKey: string;
  signature: string;
  timestamp: string;
  proofGenerated: string;
}

// Login history
export interface LoginHistory {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  loginTime?: string;
  timestamp?: string;
  userAgent?: string;
  status: 'success' | 'failed';
  failReason?: string;
  action?: string;
}

// Stored login history (with all fields)
export interface StoredLoginHistory {
  id: string;
  userId?: string;
  userEmail?: string;
  userName?: string;
  loginTime: string;
  status: 'success' | 'failed';
  failReason?: string;
}

// Session
export interface Session {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}
