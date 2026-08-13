import { createClient } from '@supabase/supabase-js';
import { config } from '../config/env';

if (!config.supabaseUrl || !config.supabaseAnonKey) {
  throw new Error("Missing Supabase credentials in .env");
}

// Create a Supabase client using the anon key (respects RLS)
export const supabase = createClient(
  config.supabaseUrl,
  config.supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);
