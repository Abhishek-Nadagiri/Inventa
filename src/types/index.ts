/**
 * ORIGIN X - Type Definitions
 * Core TypeScript interfaces for the IP protection system
 */

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  publicKey: string;
  privateKey: string;
  createdAt: string;
}

export interface AuthSession {
  userId: string;
  token: string;
  expiresAt: number;
}

// Document types
export interface Document {
  id: string;
  ownerId: string;
  filename: string;
  originalHash: string;
  encryptedData: string;
  encryptionIv: string;
  encryptionKey: string;
  timestamp: string;
  ownerSignature: string;
  fileSize: number;
  mimeType: string;
}

// Ownership proof
export interface OwnershipProof {
  documentId: string;
  documentHash: string;
  timestamp: string;
  ownerUsername: string;
  ownerPublicKey: string;
  signature: string;
  proofGenerated: string;
}

// Verification result
export interface VerificationResult {
  verified: boolean;
  document?: Document;
  owner?: Pick<User, 'username' | 'publicKey'>;
  message: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Form types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
