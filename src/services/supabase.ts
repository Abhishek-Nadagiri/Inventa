/**
 * Supabase Client Configuration
 * Inventa - Document Ownership Verification System
 */

import { createClient } from '@supabase/supabase-js';

// Load from .env (Vite)
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Safety check (helps during development)
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    'Supabase environment variables are missing. Check your .env file.'
  );
}

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database table names
export const TABLES = {
  USERS: 'users',
  DOCUMENTS: 'documents',
  LOGIN_HISTORY: 'login_history'
} as const;

// Check if Supabase is configured
export const isSupabaseConfigured = (): boolean => {
  return !!SUPABASE_URL && !!SUPABASE_ANON_KEY;
};

// Test connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(TABLES.USERS)
      .select('id')
      .limit(1);

    if (error) {
      console.error('Supabase connection error:', error.message);
      return false;
    }

    console.log('Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return false;
  }
};

export default supabase;