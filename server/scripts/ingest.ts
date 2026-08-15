import fs from 'fs';
import path from 'path';
import { pipeline } from '@xenova/transformers';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function ingestDocument(filePath: string, subject: string, chapter: string) {
  console.log("Loading embedding model...");
  const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');

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
      metadata: { source: path.basename(filePath), chunkIndex: i, subject, chapter },
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

import { fileURLToPath } from 'url';

// Keep backwards compatibility for direct script execution
const isMainModule = process.argv[1] && process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule || process.argv[1]?.endsWith('ingest.ts')) {
  const defaultPath = path.join(process.cwd(), 'server', 'data', 'ncert_physics_ch5.md');
  ingestDocument(defaultPath, 'NCERT Class 11 Physics', 'Ch 5: Laws of Motion')
    .catch(console.error);
}
