/**
 * Supabase Client Configuration
 * Inventa - Document Ownership Verification System
 */

import { createClient } from '@supabase/supabase-js';

// Supabase Configuration
const SUPABASE_URL = 'https://godeykiqbtfzymjijyhf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvZGV5a2lxYnRmenltamlqeWhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzExMDQ3MjYsImV4cCI6MjA4NjY4MDcyNn0.0VWGOenzvMzaBRc_Yckj9E3ale8IFOLsYfHXZ9aO67U';

// Create Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database table names
export const TABLES = {
  USERS: 'users',
  DOCUMENTS: 'documents',
  LOGIN_HISTORY: 'login_history'
} as const;

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return SUPABASE_URL && SUPABASE_ANON_KEY;
};

// Test connection
export const testConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from(TABLES.USERS).select('id').limit(1);
    if (error) {
      console.error('Supabase connection error:', error.message);
      return false;
    }
    console.log('✅ Supabase connected successfully!');
    return true;
  } catch (err) {
    console.error('Supabase connection failed:', err);
    return false;
  }
};

export default supabase;
