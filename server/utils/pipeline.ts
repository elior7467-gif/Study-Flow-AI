import { pipeline } from '@huggingface/transformers';

let extractorInstance: any = null;

export async function getExtractor() {
  if (!extractorInstance) {
    console.log('[AI Engine] Initializing HuggingFace pipeline singleton...');
    extractorInstance = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return extractorInstance;
}
