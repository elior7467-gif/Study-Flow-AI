import OpenAI from 'openai';
import { config } from '../config/env';
import { appCache } from '../utils/cache';
import fs from 'fs';
import path from 'path';
import { pipeline } from '@xenova/transformers';
import { supabase } from '../lib/supabase';


export class AiService {
  private static getPrimaryClient() {
    if (!config.primaryAiApiKey) {
      throw new Error('Missing Primary AI API Key. Please configure it in .env');
    }
    return new OpenAI({
      apiKey: config.primaryAiApiKey,
      baseURL: config.primaryAiBaseUrl,
    });
  }

  private static getSecondaryClient() {
    if (!config.secondaryAiApiKey) {
      throw new Error('Missing Secondary AI API Key. Please configure it in .env');
    }
    return new OpenAI({
      apiKey: config.secondaryAiApiKey,
      baseURL: config.secondaryAiBaseUrl,
    });
  }

  private static async executeWithFallback(prompt: string, systemInstruction: string, schemaDescription: string) {
    let primaryError: any = null;
    let secondaryError: any = null;

    const fullSystemInstruction = `${systemInstruction}\n\nIMPORTANT: You MUST return ONLY valid JSON matching this exact structure, with no markdown formatting or other text:\n${schemaDescription}`;

    try {
      const primaryClient = this.getPrimaryClient();
      console.log(`[AI Engine] Attempting generation with Primary API (${config.primaryAiModel})...`);
      const response = await primaryClient.chat.completions.create({
        model: config.primaryAiModel,
        messages: [
          { role: 'system', content: fullSystemInstruction },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
      });
      const content = response.choices[0].message.content;
      return content ? JSON.parse(content) : {};
    } catch (error) {
      console.warn(`[AI Engine] Primary API failed:`, error);
      primaryError = error;
    }

    try {
      const secondaryClient = this.getSecondaryClient();
      console.log(`[AI Engine] Attempting generation with Secondary API (${config.secondaryAiModel})...`);
      const response = await secondaryClient.chat.completions.create({
        model: config.secondaryAiModel,
        messages: [
          { role: 'system', content: fullSystemInstruction },
          { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' },
      });
      const content = response.choices[0].message.content;
      return content ? JSON.parse(content) : {};
    } catch (error) {
      console.error(`[AI Engine] Secondary API also failed:`, error);
      secondaryError = error;
    }

    throw new Error(`AI Engine Failure. Primary Error: ${primaryError?.message}. Secondary Error: ${secondaryError?.message}`);
  }

  static async retrieveContext(query: string) {
    try {
      const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
      const output = await extractor(query, { pooling: 'mean', normalize: true });
      const query_embedding = Array.from(output.data);

      const { data, error } = await supabase.rpc('match_documents', {
        query_embedding,
        match_threshold: 0.3,
        match_count: 3
      });

      if (error) throw error;
      return data?.map((d: any) => d.content).join('\n\n') || 'No external context available.';
    } catch (err) {
      console.error('Retrieval error:', err);
      return 'No external context available.';
    }
  }

  static async streamChat(messages: any[], systemInstruction: string) {
    let primaryError: any = null;
    
    // Step 1: Extract the latest user query
    const latestQuery = messages[messages.length - 1]?.content || '';
    
    // Step 2: Retrieve Context
    const retrievedContext = await this.retrieveContext(latestQuery);

    // Step 3: Run the Critic pipeline in the background before streaming
    const pipelineSystemInstruction = `${systemInstruction}\n\nYou are a dual-engine AI. \n=== GROUND TRUTH ===\n${retrievedContext}\n====================\n\nEnsure your answer strictly aligns with the Ground Truth. If you rely on the Ground Truth, cite it.`;

    const fullSystemInstruction = `${pipelineSystemInstruction}\n\nCRITICAL MATH FORMATTING INSTRUCTIONS:\n- Use $...$ for inline math and $$...$$ for block math.\n- Do NOT use \\\\( ... \\\\) or \\\\[ ... \\\\].\n- Block math ($$) MUST start and end on their own separate lines.\n- If you write multi-line equations or use alignment (&=), you MUST explicitly wrap them in \\\\begin{aligned} ... \\\\end{aligned} inside the $$ block.\n- Do NOT output \\\\end{aligned} without a matching \\\\begin{aligned}.\n- Never put text on the same line as the closing $$.`;

    try {
      const primaryClient = this.getPrimaryClient();
      console.log(`[AI Engine] Attempting stream with Primary API (${config.primaryAiModel})...`);
      const stream = await primaryClient.chat.completions.create({
        model: config.primaryAiModel,
        messages: [
          { role: 'system', content: fullSystemInstruction },
          ...messages
        ],
        stream: true,
      });
      return stream;
    } catch (error) {
      console.warn(`[AI Engine] Primary API stream failed:`, error);
      primaryError = error;
    }

    try {
      const secondaryClient = this.getSecondaryClient();
      console.log(`[AI Engine] Attempting stream with Secondary API (${config.secondaryAiModel})...`);
      const stream = await secondaryClient.chat.completions.create({
        model: config.secondaryAiModel,
        messages: [
          { role: 'system', content: fullSystemInstruction },
          ...messages
        ],
        stream: true,
      });
      return stream;
    } catch (error) {
      console.error(`[AI Engine] Secondary API stream also failed:`, error);
      throw new Error(`AI Engine Stream Failure. Primary Error: ${primaryError?.message}. Secondary Error: ${error?.message}`);
    }
  }

  static async generateSolverCritic(query: string, subject: string) {
    const ncertDataPath = path.join(process.cwd(), 'server', 'data', 'ncert_physics_ch5.md');
    let ncertContext = 'No external context available.';
    try {
      ncertContext = fs.readFileSync(ncertDataPath, 'utf8');
    } catch (err) {
      console.error('Failed to load NCERT data:', err);
    }

    const prompt = `You are the StudyFlow AI Dual-Engine system for students:
1. "Solver AI": Solve the following question strictly using principles relevant to the subject.
2. "Critic AI": Fact-check the Solver AI's derivation line-by-line against standard academic curriculum.

Question: "${query}"
Course Context: "${subject}"

=== NCERT GROUND TRUTH KNOWLEDGE BASE ===
${ncertContext}
=========================================

CRITICAL RULE FOR HONESTY:
- The Solver AI MUST ONLY use formulas and concepts found in the Ground Truth Knowledge Base above.
- The Critic AI MUST verify every step against the Ground Truth.
- If the question is within academic scope and conceptually correct:
  * Set criticAuditStatus = "VERIFIED"
  * Set isOutOfScope = false
  * Provide relevant textbook or curriculum citations (e.g. "NCERT Class 11 Physics Chapter 5, Section X.Y").
- If the question contains a trick assumption (e.g., assuming static friction always equals mu_s * N instead of matching applied force), asks for out-of-scope concepts, or includes a common student/AI hallucination trap:
  * Set criticAuditStatus = "FLAGGED"
  * Set isOutOfScope = true
  * Set criticAuditNotes = "HONEST WARNING: This question contains out-of-scope concepts or potential AI hallucination risks. Do not trust or memorize this derivation! Please consult your teacher."
  * Mark unverified steps clearly with verified = false and criticFeedback = "Critic AI Alert: Unbacked by standard curriculum text."`;

    const systemInstruction = 'You are StudyFlow AI, an honest and intelligent study assistant with a built-in Critic AI fact-checker. You prefer to say "I am not confident / Out of scope — ask a teacher" over providing a misleading or unbacked answer.';
    
    const schemaDescription = `{
      "title": "string",
      "summary": "string",
      "isOutOfScope": true or false,
      "steps": [
        {
          "stepNumber": 1,
          "title": "string",
          "description": "string",
          "verified": true or false,
          "mathBlock": "string (optional)",
          "criticFeedback": "string (optional)"
        }
      ],
      "finalEquation": "string",
      "citation": {
        "textbook": "string",
        "chapter": "string",
        "notes": "string",
        "ncertPage": "string (optional)"
      },
      "criticAuditStatus": "string",
      "criticAuditNotes": "string",
      "pipelineLog": {
        "solverDraftSummary": "string",
        "criticVerificationPassed": true or false,
        "ncertSourceMatch": "string",
        "criticWarnings": ["string"]
      }
    }`;

    const cacheKey = `solverCritic_${Buffer.from(query + subject).toString('base64')}`;
    const cachedResponse = appCache.get<any>(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await this.executeWithFallback(prompt, systemInstruction, schemaDescription);
    appCache.set(cacheKey, response, 3600 * 24); // Cache for 24 hours
    return response;
  }

  static async generateTopicAudit(topicTitle: string, subtitle: string, unit: string) {
    const prompt = `Perform a Critic Audit on the academic topic "${topicTitle}" (${subtitle}) in unit "${unit}". Evaluate mathematical consistency, sign conventions, and common student pitfalls.`;
    
    const systemInstruction = 'You are StudyFlow AI Critic Auditor. You audit physics concepts for mathematical consistency, sign errors, reference frames, and edge cases.';

    const schemaDescription = `{
      "status": "string",
      "auditDetails": "string",
      "insights": ["string"],
      "recommendedMasteryScore": 0 // integer
    }`;

    const cacheKey = `topicAudit_${Buffer.from(topicTitle + subtitle + unit).toString('base64')}`;
    const cachedResponse = appCache.get<any>(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const response = await this.executeWithFallback(prompt, systemInstruction, schemaDescription);
    appCache.set(cacheKey, response, 3600 * 24); // Cache for 24 hours
    return response;
  }
}
