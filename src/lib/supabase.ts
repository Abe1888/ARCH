import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Supabase Initialization Check:');
console.log('  - URL:', supabaseUrl ? '✅ PRESENT' : '❌ MISSING');
console.log('  - Anon Key:', supabaseAnonKey ? '✅ PRESENT' : '❌ MISSING');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('  - VITE_SUPABASE_URL:', supabaseUrl || 'undefined');
  console.error('  - VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '[REDACTED]' : 'undefined');
  throw new Error('Missing required Supabase environment variables');
}

if (typeof supabaseUrl !== 'string' || supabaseUrl.trim() === '') {
  console.error('❌ Invalid Supabase URL: must be a non-empty string');
  throw new Error('Invalid Supabase URL configuration');
}

if (typeof supabaseAnonKey !== 'string' || supabaseAnonKey.trim() === '') {
  console.error('❌ Invalid Supabase Anon Key: must be a non-empty string');
  throw new Error('Invalid Supabase Anon Key configuration');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'X-Client-Info': 'document-management-system',
    },
  },
});

if (!supabase || typeof supabase !== 'object') {
  console.error('❌ Supabase client creation failed: client is not an object');
  throw new Error('Failed to create Supabase client');
}

if (typeof supabase.from !== 'function') {
  console.error('❌ Supabase client is invalid: .from() method not found');
  throw new Error('Supabase client missing required methods');
}

if (typeof supabase.auth?.getUser !== 'function') {
  console.error('❌ Supabase client is invalid: .auth.getUser() method not found');
  throw new Error('Supabase client auth module not properly initialized');
}

console.log('✅ Supabase client created successfully');
console.log('  - Client type:', typeof supabase);
console.log('  - .from() method:', typeof supabase.from);
console.log('  - .auth.getUser() method:', typeof supabase.auth?.getUser);

export { supabase };
