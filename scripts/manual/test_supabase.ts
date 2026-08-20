import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);

const run = async () => {
  try {
    const res = await supabase.from('chats').insert([{ user_id: 'test', title: 'test chat' }]).select().single();
    console.log('OK:', res);
  } catch (err: any) {
    console.error('ERR:', err);
  }
};
run();
