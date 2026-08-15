import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';

const supabaseUrl = config.supabaseUrl || 'https://placeholder.supabase.co';
const supabaseKey = config.supabaseAnonKey || 'placeholder';
const supabaseAdminKey = config.supabaseServiceRoleKey;

if (!config.supabaseUrl || !config.supabaseAnonKey) {
  console.warn("⚠️ Warning: Missing Supabase credentials in environment variables. Database features will not work.");
}

// Create a Supabase client using the anon key
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

// If we have a service role key, use it to bypass RLS in the trusted backend environment.
// Otherwise, fall back to using the user's Clerk JWT (which requires proper RLS policies in Supabase).
export const getAuthSupabase = (token: string) => {
  console.log(`[DEBUG getAuthSupabase] Admin key present? ${!!supabaseAdminKey}`);
  if (supabaseAdminKey) {
    return createClient(supabaseUrl, supabaseAdminKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

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
