import { getAuthSupabase } from './server/lib/supabase';
async function test() {
  console.log("Testing with null token");
  const client = getAuthSupabase('null'); // Should ignore 'null' and use Admin
  const res = await client.from('chats').insert([{ user_id: 'test', title: 'test chat' }]).select().single();
  console.log("Result:", res);
}
test();
