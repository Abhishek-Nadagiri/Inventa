/**
 * API Service for Inventa
 * Uses Supabase Auth for authentication and Supabase DB for documents
 */

import { supabase, TABLES, testConnection } from './supabase';
import { User, Document, StoredLoginHistory, DocType, DocWorkType } from '../types';
import { generateSHA256Hash, generateECCKeyPair, signData, hashString } from './crypto';

// Storage mode tracking
let useSupabase = true;
let connectionTested = false;

// Initialize and test connection
const ensureConnection = async (): Promise<boolean> => {
  if (connectionTested) return useSupabase;
  
  try {
    useSupabase = await testConnection();
    connectionTested = true;
    console.log(useSupabase ? '🌐 Using Supabase Cloud Database' : '💾 Using LocalStorage (Supabase unavailable)');
    return useSupabase;
  } catch {
    useSupabase = false;
    connectionTested = true;
    console.log('💾 Using LocalStorage (Supabase connection failed)');
    return false;
  }
};

// LocalStorage helpers
const getLocalData = <T>(key: string): T[] => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setLocalData = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// ============================================
// USER OPERATIONS - Using Supabase Auth
// ============================================

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export interface RegisterResult {
  success: boolean;
  user?: User;
  message: string;
}

export const register = async (data: RegisterData): Promise<RegisterResult> => {
  try {
    await ensureConnection();
    
    const keyPair = await generateECCKeyPair();
    const email = data.email.toLowerCase().trim();
    const username = data.username.trim();
    
    if (useSupabase) {
      // Use Supabase Auth for registration
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: data.password,
        options: {
          data: {
            username: username,
            public_key: keyPair.publicKey,
            private_key_encrypted: keyPair.privateKey
          }
        }
      });
      
      if (authError) {
        console.error('Registration error:', authError);
        if (authError.message.includes('already registered')) {
          return { success: false, message: 'Email already registered' };
        }
        return { success: false, message: authError.message };
      }
      
      if (!authData.user) {
        return { success: false, message: 'Registration failed. Please try again.' };
      }
      
      // Also store in users table for additional data
      const newUser = {
        id: authData.user.id,
        email: email,
        username: username,
        password_hash: await hashString(data.password),
        public_key: keyPair.publicKey,
        private_key_encrypted: keyPair.privateKey,
        created_at: new Date().toISOString()
      };
      
      await supabase.from(TABLES.USERS).upsert(newUser);
      
      const user: User = {
        id: authData.user.id,
        email: email,
        username: username,
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
        createdAt: newUser.created_at
      };
      
      // Store session locally
      localStorage.setItem('inventa_session', JSON.stringify({
        userId: user.id,
        token: authData.session?.access_token || `token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      return { success: true, user, message: 'Registration successful! Please check your email to confirm.' };
    } else {
      // LocalStorage fallback
      const passwordHash = await hashString(data.password);
      const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newUser = {
        id: userId,
        email: email,
        username: username,
        password_hash: passwordHash,
        public_key: keyPair.publicKey,
        private_key_encrypted: keyPair.privateKey,
        created_at: new Date().toISOString()
      };
      
      const users = getLocalData<typeof newUser>('inventa_users');
      
      if (users.some(u => u.email === email)) {
        return { success: false, message: 'Email already registered' };
      }
      
      if (users.some(u => u.username === username)) {
        return { success: false, message: 'Username already taken' };
      }
      
      users.push(newUser);
      setLocalData('inventa_users', users);
      
      localStorage.setItem('inventa_session', JSON.stringify({
        userId: userId,
        token: `token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      const user: User = {
        id: userId,
        email: email,
        username: username,
        publicKey: keyPair.publicKey,
        privateKey: keyPair.privateKey,
        createdAt: newUser.created_at
      };
      
      return { success: true, user, message: 'Registration successful' };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, message: 'Registration failed. Please try again.' };
  }
};

export interface LoginData {
  email: string;
  password: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  message: string;
}

export const login = async (data: LoginData): Promise<LoginResult> => {
  try {
    await ensureConnection();
    
    const email = data.email.toLowerCase().trim();
    
    if (useSupabase) {
      // Use Supabase Auth for login
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password: data.password
      });
      
      if (authError) {
        await recordLoginHistory(null, email, '', 'failed', authError.message);
        return { success: false, message: 'Invalid email or password' };
      }
      
      if (!authData.user) {
        await recordLoginHistory(null, email, '', 'failed', 'User not found');
        return { success: false, message: 'Invalid email or password' };
      }
      
      // Get user data from users table
      const { data: userData } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', authData.user.id)
        .single();
      
      const username = userData?.username || authData.user.user_metadata?.username || email.split('@')[0];
      const publicKey = userData?.public_key || authData.user.user_metadata?.public_key || '';
      const privateKey = userData?.private_key_encrypted || authData.user.user_metadata?.private_key_encrypted || '';
      
      // Store session locally
      localStorage.setItem('inventa_session', JSON.stringify({
        userId: authData.user.id,
        token: authData.session?.access_token || `token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      // Record successful login
      await recordLoginHistory(authData.user.id, email, username, 'success');
      
      const user: User = {
        id: authData.user.id,
        email: email,
        username: username,
        publicKey: publicKey,
        privateKey: privateKey,
        createdAt: userData?.created_at || new Date().toISOString()
      };
      
      return { success: true, user, message: 'Login successful' };
    } else {
      // LocalStorage fallback
      const passwordHash = await hashString(data.password);
      
      interface DbUser {
        id: string;
        email: string;
        username: string;
        password_hash: string;
        public_key: string;
        private_key_encrypted: string;
        created_at: string;
      }
      
      const users = getLocalData<DbUser>('inventa_users');
      const foundUser = users.find(u => u.email === email);
      
      if (!foundUser) {
        await recordLoginHistory(null, email, '', 'failed', 'User not found');
        return { success: false, message: 'Invalid email or password' };
      }
      
      if (foundUser.password_hash !== passwordHash) {
        await recordLoginHistory(foundUser.id, email, foundUser.username, 'failed', 'Invalid password');
        return { success: false, message: 'Invalid email or password' };
      }
      
      localStorage.setItem('inventa_session', JSON.stringify({
        userId: foundUser.id,
        token: `token_${Date.now()}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }));
      
      await recordLoginHistory(foundUser.id, foundUser.email, foundUser.username, 'success');
      
      const user: User = {
        id: foundUser.id,
        email: foundUser.email,
        username: foundUser.username,
        publicKey: foundUser.public_key,
        privateKey: foundUser.private_key_encrypted,
        createdAt: foundUser.created_at
      };
      
      return { success: true, user, message: 'Login successful' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, message: 'Login failed. Please try again.' };
  }
};

// Record login history
const recordLoginHistory = async (
  userId: string | null,
  email: string,
  username: string,
  status: 'success' | 'failed',
  failReason?: string
): Promise<void> => {
  try {
    const loginRecord = {
      id: `login_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      user_email: email,
      user_name: username,
      login_time: new Date().toISOString(),
      status,
      fail_reason: failReason || null
    };
    
    if (useSupabase) {
      await supabase.from(TABLES.LOGIN_HISTORY).insert(loginRecord);
    } else {
      const history = getLocalData<typeof loginRecord>('inventa_login_history');
      history.push(loginRecord);
      setLocalData('inventa_login_history', history);
    }
  } catch (error) {
    console.error('Failed to record login history:', error);
  }
};

export const logout = async (): Promise<void> => {
  localStorage.removeItem('inventa_session');
  
  if (useSupabase) {
    await supabase.auth.signOut();
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const sessionStr = localStorage.getItem('inventa_session');
    if (!sessionStr) return null;
    
    const session = JSON.parse(sessionStr);
    if (new Date(session.expiresAt) < new Date()) {
      localStorage.removeItem('inventa_session');
      return null;
    }
    
    await ensureConnection();
    
    if (useSupabase) {
      // Check Supabase Auth session
      const { data: authData } = await supabase.auth.getUser();
      
      if (authData.user) {
        // Get user data from users table
        const { data: userData } = await supabase
          .from(TABLES.USERS)
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        if (userData) {
          return {
            id: userData.id,
            email: userData.email,
            username: userData.username,
            publicKey: userData.public_key,
            privateKey: userData.private_key_encrypted,
            createdAt: userData.created_at
          };
        }
        
        // Fallback to auth metadata
        return {
          id: authData.user.id,
          email: authData.user.email || '',
          username: authData.user.user_metadata?.username || authData.user.email?.split('@')[0] || '',
          publicKey: authData.user.user_metadata?.public_key || '',
          privateKey: authData.user.user_metadata?.private_key_encrypted || '',
          createdAt: authData.user.created_at
        };
      }
      
      // Try to get user from users table using session userId
      const { data: userData } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', session.userId)
        .single();
      
      if (userData) {
        return {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          publicKey: userData.public_key,
          privateKey: userData.private_key_encrypted,
          createdAt: userData.created_at
        };
      }
      
      return null;
    } else {
      interface DbUser {
        id: string;
        email: string;
        username: string;
        public_key: string;
        private_key_encrypted: string;
        created_at: string;
      }
      
      const users = getLocalData<DbUser>('inventa_users');
      const foundUser = users.find(u => u.id === session.userId);
      if (!foundUser) return null;
      
      return {
        id: foundUser.id,
        email: foundUser.email,
        username: foundUser.username,
        publicKey: foundUser.public_key,
        privateKey: foundUser.private_key_encrypted,
        createdAt: foundUser.created_at
      };
    }
  } catch {
    return null;
  }
};

// ============================================
// DOCUMENT OPERATIONS
// ============================================

export interface UploadData {
  file: File;
  ownerName: string;
  description: string;
  documentType: string;
  workType: string;
  proofOfWork?: File;
}

export interface UploadResult {
  success: boolean;
  document?: Document;
  message: string;
}

export const uploadDocument = async (userId: string, data: UploadData): Promise<UploadResult> => {
  try {
    await ensureConnection();
    
    // Get user for signing
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, message: 'User not authenticated' };
    }
    
    // Generate document hash
    const hash = await generateSHA256Hash(data.file);
    
    interface DbDocument {
      id: string;
      user_id: string;
      hash: string;
    }
    
    // Check if document already exists
    if (useSupabase) {
      const { data: existing } = await supabase
        .from(TABLES.DOCUMENTS)
        .select('id, user_id')
        .eq('hash', hash)
        .single();
      
      if (existing) {
        const existingDoc = existing as DbDocument;
        return { 
          success: false, 
          message: existingDoc.user_id === userId 
            ? 'You have already registered this document' 
            : 'This document has already been registered by another user'
        };
      }
    } else {
      const docs = getLocalData<DbDocument>('inventa_documents');
      const existing = docs.find(d => d.hash === hash);
      
      if (existing) {
        return { 
          success: false, 
          message: existing.user_id === userId 
            ? 'You have already registered this document' 
            : 'This document has already been registered by another user'
        };
      }
    }
    
    // Generate signature
    const timestamp = new Date().toISOString();
    const dataToSign = `${hash}:${userId}:${timestamp}`;
    const signature = await signData(dataToSign, user.privateKey || '');
    
    // Process proof of work
    let proofOfWorkName: string | null = null;
    let proofOfWorkHash: string | null = null;
    
    if (data.proofOfWork) {
      proofOfWorkName = data.proofOfWork.name;
      proofOfWorkHash = await generateSHA256Hash(data.proofOfWork);
    }
    
    const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newDocument = {
      id: documentId,
      user_id: userId,
      filename: data.file.name,
      original_name: data.file.name,
      hash,
      signature,
      timestamp,
      encrypted_data: null,
      file_size: data.file.size,
      owner_name: data.ownerName,
      description: data.description,
      document_type: data.documentType,
      work_type: data.workType,
      proof_of_work_name: proofOfWorkName,
      proof_of_work_hash: proofOfWorkHash,
      created_at: timestamp
    };
    
    if (useSupabase) {
      const { error } = await supabase.from(TABLES.DOCUMENTS).insert(newDocument);
      
      if (error) {
        console.error('Upload error:', error);
        return { success: false, message: 'Failed to register document' };
      }
    } else {
      const docs = getLocalData<typeof newDocument>('inventa_documents');
      docs.push(newDocument);
      setLocalData('inventa_documents', docs);
    }
    
    const document: Document = {
      id: documentId,
      userId,
      filename: data.file.name,
      originalName: data.file.name,
      hash,
      signature,
      timestamp,
      fileSize: data.file.size,
      metadata: {
        ownerName: data.ownerName,
        description: data.description,
        documentType: data.documentType as DocType,
        workType: data.workType as DocWorkType,
        proofOfWork: proofOfWorkName ? {
          filename: proofOfWorkName,
          hash: proofOfWorkHash || ''
        } : undefined
      }
    };
    
    return { success: true, document, message: 'Document registered successfully!' };
  } catch (error) {
    console.error('Upload error:', error);
    return { success: false, message: 'Upload failed. Please try again.' };
  }
};

export interface VerifyResult {
  verified: boolean;
  document?: Document;
  owner?: User;
  message: string;
  hash?: string;
}

export const verifyDocument = async (fileOrHash: File | string): Promise<VerifyResult> => {
  try {
    await ensureConnection();
    
    let hash: string;
    
    if (typeof fileOrHash === 'string') {
      hash = fileOrHash.trim();
    } else {
      hash = await generateSHA256Hash(fileOrHash);
    }
    
    interface DbDocument {
      id: string;
      user_id: string;
      filename: string;
      original_name: string;
      hash: string;
      signature: string;
      timestamp: string;
      file_size: number;
      owner_name: string;
      description: string;
      document_type: string;
      work_type: string;
      proof_of_work_name: string | null;
      proof_of_work_hash: string | null;
    }
    
    interface DbUser {
      id: string;
      email: string;
      username: string;
      public_key: string;
      created_at: string;
    }
    
    let foundDoc: DbDocument | null = null;
    
    if (useSupabase) {
      const { data } = await supabase
        .from(TABLES.DOCUMENTS)
        .select('*')
        .eq('hash', hash)
        .single();
      
      foundDoc = data as DbDocument | null;
    } else {
      const docs = getLocalData<DbDocument>('inventa_documents');
      foundDoc = docs.find(d => d.hash === hash) || null;
    }
    
    if (!foundDoc) {
      return { 
        verified: false, 
        message: 'Document not found. This document has not been registered yet.',
        hash
      };
    }
    
    // Get owner info
    let owner: User | undefined;
    
    if (useSupabase) {
      const { data: userData } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .eq('id', foundDoc.user_id)
        .single();
      
      if (userData) {
        const userInfo = userData as DbUser;
        owner = {
          id: userInfo.id,
          email: userInfo.email,
          username: userInfo.username,
          publicKey: userInfo.public_key,
          createdAt: userInfo.created_at
        };
      }
    } else {
      const users = getLocalData<DbUser>('inventa_users');
      const userData = users.find(u => u.id === foundDoc!.user_id);
      if (userData) {
        owner = {
          id: userData.id,
          email: userData.email,
          username: userData.username,
          publicKey: userData.public_key,
          createdAt: userData.created_at
        };
      }
    }
    
    const document: Document = {
      id: foundDoc.id,
      userId: foundDoc.user_id,
      filename: foundDoc.filename,
      originalName: foundDoc.original_name,
      hash: foundDoc.hash,
      signature: foundDoc.signature,
      timestamp: foundDoc.timestamp,
      fileSize: foundDoc.file_size,
      metadata: {
        ownerName: foundDoc.owner_name,
        description: foundDoc.description,
        documentType: foundDoc.document_type as DocType,
        workType: foundDoc.work_type as DocWorkType,
        proofOfWork: foundDoc.proof_of_work_name ? {
          filename: foundDoc.proof_of_work_name,
          hash: foundDoc.proof_of_work_hash || ''
        } : undefined
      }
    };
    
    return {
      verified: true,
      document,
      owner,
      message: 'Document verified! This document is registered.',
      hash
    };
  } catch (error) {
    console.error('Verification error:', error);
    return { verified: false, message: 'Verification failed. Please try again.' };
  }
};

export const getUserDocuments = async (userId: string): Promise<Document[]> => {
  try {
    await ensureConnection();
    
    interface DbDocument {
      id: string;
      user_id: string;
      filename: string;
      original_name: string;
      hash: string;
      signature: string;
      timestamp: string;
      file_size: number;
      owner_name: string;
      description: string;
      document_type: string;
      work_type: string;
      proof_of_work_name: string | null;
      proof_of_work_hash: string | null;
    }
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from(TABLES.DOCUMENTS)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error || !data) return [];
      
      return (data as DbDocument[]).map(doc => ({
        id: doc.id,
        userId: doc.user_id,
        filename: doc.filename,
        originalName: doc.original_name,
        hash: doc.hash,
        signature: doc.signature,
        timestamp: doc.timestamp,
        fileSize: doc.file_size,
        metadata: {
          ownerName: doc.owner_name,
          description: doc.description,
          documentType: doc.document_type as DocType,
          workType: doc.work_type as DocWorkType,
          proofOfWork: doc.proof_of_work_name ? {
            filename: doc.proof_of_work_name,
            hash: doc.proof_of_work_hash || ''
          } : undefined
        }
      }));
    } else {
      const docs = getLocalData<DbDocument>('inventa_documents');
      
      return docs
        .filter(d => d.user_id === userId)
        .map(doc => ({
          id: doc.id,
          userId: doc.user_id,
          filename: doc.filename,
          originalName: doc.original_name,
          hash: doc.hash,
          signature: doc.signature,
          timestamp: doc.timestamp,
          fileSize: doc.file_size,
          metadata: {
            ownerName: doc.owner_name,
            description: doc.description,
            documentType: doc.document_type as DocType,
            workType: doc.work_type as DocWorkType,
            proofOfWork: doc.proof_of_work_name ? {
              filename: doc.proof_of_work_name,
              hash: doc.proof_of_work_hash || ''
            } : undefined
          }
        }))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
  } catch (error) {
    console.error('Error fetching documents:', error);
    return [];
  }
};

// ============================================
// ADMIN/STATS OPERATIONS
// ============================================

export interface StatsResult {
  totalUsers: number;
  totalDocuments: number;
  totalLogins: number;
  successfulLogins: number;
  failedLogins: number;
  storageMode: 'supabase' | 'localStorage';
}

export const getStats = async (): Promise<StatsResult> => {
  try {
    await ensureConnection();
    
    if (useSupabase) {
      const [usersRes, docsRes, loginsRes] = await Promise.all([
        supabase.from(TABLES.USERS).select('id', { count: 'exact' }),
        supabase.from(TABLES.DOCUMENTS).select('id', { count: 'exact' }),
        supabase.from(TABLES.LOGIN_HISTORY).select('*')
      ]);
      
      const logins = loginsRes.data || [];
      
      return {
        totalUsers: usersRes.count || 0,
        totalDocuments: docsRes.count || 0,
        totalLogins: logins.length,
        successfulLogins: logins.filter((l: { status: string }) => l.status === 'success').length,
        failedLogins: logins.filter((l: { status: string }) => l.status === 'failed').length,
        storageMode: 'supabase'
      };
    } else {
      const users = getLocalData('inventa_users');
      const docs = getLocalData('inventa_documents');
      const logins = getLocalData<{ status: string }>('inventa_login_history');
      
      return {
        totalUsers: users.length,
        totalDocuments: docs.length,
        totalLogins: logins.length,
        successfulLogins: logins.filter(l => l.status === 'success').length,
        failedLogins: logins.filter(l => l.status === 'failed').length,
        storageMode: 'localStorage'
      };
    }
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalUsers: 0,
      totalDocuments: 0,
      totalLogins: 0,
      successfulLogins: 0,
      failedLogins: 0,
      storageMode: 'localStorage'
    };
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    await ensureConnection();
    
    interface DbUser {
      id: string;
      email: string;
      username: string;
      public_key: string;
      created_at: string;
    }
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from(TABLES.USERS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error || !data) return [];
      
      return (data as DbUser[]).map(u => ({
        id: u.id,
        email: u.email,
        username: u.username,
        publicKey: u.public_key,
        createdAt: u.created_at
      }));
    } else {
      const users = getLocalData<DbUser>('inventa_users');
      
      return users.map(u => ({
        id: u.id,
        email: u.email,
        username: u.username,
        publicKey: u.public_key,
        createdAt: u.created_at
      }));
    }
  } catch {
    return [];
  }
};

export const getAllDocuments = async (): Promise<Document[]> => {
  try {
    await ensureConnection();
    
    interface DbDocument {
      id: string;
      user_id: string;
      filename: string;
      original_name: string;
      hash: string;
      signature: string;
      timestamp: string;
      file_size: number;
      owner_name: string;
      description: string;
      document_type: string;
      work_type: string;
      proof_of_work_name: string | null;
      proof_of_work_hash: string | null;
    }
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from(TABLES.DOCUMENTS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error || !data) return [];
      
      return (data as DbDocument[]).map(doc => ({
        id: doc.id,
        userId: doc.user_id,
        filename: doc.filename,
        originalName: doc.original_name,
        hash: doc.hash,
        signature: doc.signature,
        timestamp: doc.timestamp,
        fileSize: doc.file_size,
        metadata: {
          ownerName: doc.owner_name,
          description: doc.description,
          documentType: doc.document_type as DocType,
          workType: doc.work_type as DocWorkType,
          proofOfWork: doc.proof_of_work_name ? {
            filename: doc.proof_of_work_name,
            hash: doc.proof_of_work_hash || ''
          } : undefined
        }
      }));
    } else {
      const docs = getLocalData<DbDocument>('inventa_documents');
      
      return docs.map(doc => ({
        id: doc.id,
        userId: doc.user_id,
        filename: doc.filename,
        originalName: doc.original_name,
        hash: doc.hash,
        signature: doc.signature,
        timestamp: doc.timestamp,
        fileSize: doc.file_size,
        metadata: {
          ownerName: doc.owner_name,
          description: doc.description,
          documentType: doc.document_type as DocType,
          workType: doc.work_type as DocWorkType,
          proofOfWork: doc.proof_of_work_name ? {
            filename: doc.proof_of_work_name,
            hash: doc.proof_of_work_hash || ''
          } : undefined
        }
      }));
    }
  } catch {
    return [];
  }
};

export const getLoginHistory = async (): Promise<StoredLoginHistory[]> => {
  try {
    await ensureConnection();
    
    interface DbLoginHistory {
      id: string;
      user_id: string;
      user_email: string;
      user_name: string;
      login_time: string;
      status: string;
      fail_reason: string | null;
    }
    
    if (useSupabase) {
      const { data, error } = await supabase
        .from(TABLES.LOGIN_HISTORY)
        .select('*')
        .order('login_time', { ascending: false });
      
      if (error || !data) return [];
      
      return (data as DbLoginHistory[]).map(l => ({
        id: l.id,
        userId: l.user_id,
        userEmail: l.user_email,
        userName: l.user_name,
        loginTime: l.login_time,
        status: l.status as 'success' | 'failed',
        failReason: l.fail_reason || undefined
      }));
    } else {
      const history = getLocalData<DbLoginHistory>('inventa_login_history');
      
      return history.map(l => ({
        id: l.id,
        userId: l.user_id,
        userEmail: l.user_email,
        userName: l.user_name,
        loginTime: l.login_time,
        status: l.status as 'success' | 'failed',
        failReason: l.fail_reason || undefined
      }));
    }
  } catch {
    return [];
  }
};

export const exportAllData = async (): Promise<{
  users: User[];
  documents: Document[];
  loginHistory: StoredLoginHistory[];
  exportedAt: string;
}> => {
  const [users, documents, loginHistory] = await Promise.all([
    getAllUsers(),
    getAllDocuments(),
    getLoginHistory()
  ]);
  
  return {
    users,
    documents,
    loginHistory,
    exportedAt: new Date().toISOString()
  };
};

// Get storage mode
export const getStorageMode = async (): Promise<'supabase' | 'localStorage'> => {
  await ensureConnection();
  return useSupabase ? 'supabase' : 'localStorage';
};
