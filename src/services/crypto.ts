/**
 * ORIGIN X - Cryptographic Services
 * Implements SHA-256 hashing, AES-GCM encryption, and ECC for ownership binding
 * Uses Web Crypto API for secure cryptographic operations
 */

// Convert ArrayBuffer to hex string
export function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert hex string to ArrayBuffer
export function hexToBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

// Convert ArrayBuffer to Base64
export function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  return btoa(binary);
}

// Convert Base64 to ArrayBuffer
export function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Generate SHA-256 hash of a file
 * Used for document fingerprinting and integrity verification
 */
export async function generateSHA256Hash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  return bufferToHex(hashBuffer);
}

/**
 * Generate SHA-256 hash from string (for passwords)
 */
export async function hashString(str: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

/**
 * Generate AES-GCM encryption key
 * Used for document encryption
 */
export async function generateAESKey(): Promise<CryptoKey> {
  return crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Export AES key to Base64 for storage
 */
export async function exportAESKey(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey('raw', key);
  return bufferToBase64(exported);
}

/**
 * Import AES key from Base64
 */
export async function importAESKey(keyBase64: string): Promise<CryptoKey> {
  const keyBuffer = base64ToBuffer(keyBase64);
  return crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypt file data using AES-GCM
 * Returns encrypted data and IV as Base64 strings
 */
export async function encryptFile(
  file: File,
  key: CryptoKey
): Promise<{ encryptedData: string; iv: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    arrayBuffer
  );
  
  return {
    encryptedData: bufferToBase64(encryptedBuffer),
    iv: bufferToBase64(iv.buffer)
  };
}

/**
 * Decrypt file data using AES-GCM
 */
export async function decryptFile(
  encryptedData: string,
  iv: string,
  key: CryptoKey
): Promise<ArrayBuffer> {
  const encryptedBuffer = base64ToBuffer(encryptedData);
  const ivBuffer = new Uint8Array(base64ToBuffer(iv));
  
  return crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuffer },
    key,
    encryptedBuffer
  );
}

/**
 * Generate ECC key pair for ownership binding
 * Uses ECDSA with P-256 curve
 */
export async function generateECCKeyPair(): Promise<{
  publicKey: string;
  privateKey: string;
}> {
  const keyPair = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
  
  const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
  
  return {
    publicKey: bufferToBase64(publicKeyBuffer),
    privateKey: bufferToBase64(privateKeyBuffer)
  };
}

/**
 * Sign data using ECC private key
 * Used for ownership proof generation
 */
export async function signData(data: string, privateKeyBase64: string): Promise<string> {
  const privateKeyBuffer = base64ToBuffer(privateKeyBase64);
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privateKey,
    dataBuffer
  );
  
  return bufferToBase64(signature);
}

/**
 * Verify signature using ECC public key
 */
export async function verifySignature(
  data: string,
  signatureBase64: string,
  publicKeyBase64: string
): Promise<boolean> {
  try {
    const publicKeyBuffer = base64ToBuffer(publicKeyBase64);
    const publicKey = await crypto.subtle.importKey(
      'spki',
      publicKeyBuffer,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['verify']
    );
    
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const signatureBuffer = base64ToBuffer(signatureBase64);
    
    return crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      publicKey,
      signatureBuffer,
      dataBuffer
    );
  } catch {
    return false;
  }
}

/**
 * Generate secure timestamp in ISO format
 */
export function generateTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Generate unique ID using crypto
 */
export function generateId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return bufferToHex(array.buffer);
}
