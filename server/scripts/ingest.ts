import fs from 'fs';
import path from 'path';
import { pipeline } from '@xenova/transformers';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function generateEmbeddings() {
  console.log("Loading embedding model...");
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

  const filePath = path.join(process.cwd(), 'server', 'data', 'ncert_physics_ch5.md');
  const text = fs.readFileSync(filePath, 'utf8');

  // Simple chunking by paragraph/section
  const chunks = text.split(/\n\s*\n/).filter(c => c.trim().length > 20);
  
  console.log(`Found ${chunks.length} chunks. Generating embeddings...`);

  for (let i = 0; i < chunks.length; i++) {
    const content = chunks[i].trim();
    // Generate embedding
    const output = await extractor(content, { pooling: 'mean', normalize: true });
    const embedding = Array.from(output.data);

    // Insert into Supabase
    const { error } = await supabase.from('documents').insert({
      content,
      metadata: { source: 'ncert_physics_ch5.md', chunkIndex: i },
      embedding
    });

    if (error) {
      console.error(`Error inserting chunk ${i}:`, error);
    } else {
      console.log(`Inserted chunk ${i}/${chunks.length}`);
    }
  }

  console.log("Ingestion complete!");
}

generateEmbeddings().catch(console.error);
