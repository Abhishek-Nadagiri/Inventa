/**
 * ORIGIN X - Storage Service
 * Simulates TinyDB document-based storage using localStorage
 * Provides CRUD operations for users and documents
 */

import type { User, Document, AuthSession } from '../types';

const STORAGE_KEYS = {
  USERS: 'inventa_users',
  DOCUMENTS: 'inventa_documents',
  SESSION: 'inventa_session'
};

/**
 * Generic storage operations
 */
function getCollection<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function saveCollection<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * User operations
 */
export const UserStorage = {
  getAll(): User[] {
    return getCollection<User>(STORAGE_KEYS.USERS);
  },

  getById(id: string): User | undefined {
    return this.getAll().find(u => u.id === id);
  },

  getByEmail(email: string): User | undefined {
    return this.getAll().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  getByUsername(username: string): User | undefined {
    return this.getAll().find(u => u.username.toLowerCase() === username.toLowerCase());
  },

  create(user: User): User {
    const users = this.getAll();
    users.push(user);
    saveCollection(STORAGE_KEYS.USERS, users);
    return user;
  },

  update(id: string, updates: Partial<User>): User | undefined {
    const users = this.getAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    users[index] = { ...users[index], ...updates };
    saveCollection(STORAGE_KEYS.USERS, users);
    return users[index];
  },

  delete(id: string): boolean {
    const users = this.getAll();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    saveCollection(STORAGE_KEYS.USERS, filtered);
    return true;
  }
};

/**
 * Document operations
 */
export const DocumentStorage = {
  getAll(): Document[] {
    return getCollection<Document>(STORAGE_KEYS.DOCUMENTS);
  },

  getById(id: string): Document | undefined {
    return this.getAll().find(d => d.id === id);
  },

  getByOwnerId(ownerId: string): Document[] {
    return this.getAll().filter(d => d.ownerId === ownerId);
  },

  getByHash(hash: string): Document | undefined {
    return this.getAll().find(d => d.originalHash === hash);
  },

  create(document: Document): Document {
    const documents = this.getAll();
    documents.push(document);
    saveCollection(STORAGE_KEYS.DOCUMENTS, documents);
    return document;
  },

  update(id: string, updates: Partial<Document>): Document | undefined {
    const documents = this.getAll();
    const index = documents.findIndex(d => d.id === id);
    if (index === -1) return undefined;
    documents[index] = { ...documents[index], ...updates };
    saveCollection(STORAGE_KEYS.DOCUMENTS, documents);
    return documents[index];
  },

  delete(id: string): boolean {
    const documents = this.getAll();
    const filtered = documents.filter(d => d.id !== id);
    if (filtered.length === documents.length) return false;
    saveCollection(STORAGE_KEYS.DOCUMENTS, filtered);
    return true;
  }
};

/**
 * Session operations
 */
export const SessionStorage = {
  get(): AuthSession | null {
    const data = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!data) return null;
    const session: AuthSession = JSON.parse(data);
    // Check if session is expired
    if (Date.now() > session.expiresAt) {
      this.clear();
      return null;
    }
    return session;
  },

  set(session: AuthSession): void {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
  },

  clear(): void {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }
};
