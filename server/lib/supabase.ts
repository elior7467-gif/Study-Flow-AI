import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';

const supabaseUrl = config.supabaseUrl || 'https://placeholder.supabase.co';
const supabaseKey = config.supabaseAnonKey || 'placeholder';

if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.warn("⚠️ Warning: Missing Supabase credentials in environment variables. Database features will not work.");
}

// Create a Supabase client using the anon key (respects RLS)
export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create an authenticated Supabase client using a user's Clerk JWT
export const getAuthSupabase = (token: string) => {
  return createClient(
    supabaseUrl,
    supabaseKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
};
