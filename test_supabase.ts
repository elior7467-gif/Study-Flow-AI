import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

supabase.from('chats').insert([{ user_id: 'test', title: 'test chat' }]).select().single()
  .then(res => console.log('OK:', res))
  .catch(err => console.error('ERR:', err));
