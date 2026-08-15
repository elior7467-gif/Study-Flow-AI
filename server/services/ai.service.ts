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
    const ncertContext = await this.retrieveContext(query);

    const solverPrompt = `You are the StudyFlow AI "Solver AI".
Solve the following question strictly using principles relevant to the subject.

Question: "${query}"
Course Context: "${subject}"

=== NCERT GROUND TRUTH KNOWLEDGE BASE ===
${ncertContext}
=========================================

CRITICAL RULE FOR HONESTY:
- You MUST ONLY use formulas and concepts found in the Ground Truth Knowledge Base above.`;

    const solverSystemInstruction = 'You are StudyFlow AI, an intelligent study assistant. Provide a step-by-step derivation without verifying your own work.';
    
    const solverSchema = `{
      "title": "string",
      "summary": "string",
      "steps": [
        {
          "stepNumber": 1,
          "title": "string",
          "description": "string",
          "mathBlock": "string (optional)"
        }
      ],
      "finalEquation": "string",
      "citation": {
        "textbook": "string",
        "chapter": "string",
        "notes": "string",
        "ncertPage": "string (optional)"
      },
      "pipelineLog": {
        "solverDraftSummary": "string",
        "ncertSourceMatch": "string"
      }
    }`;

    const cacheKey = `solverCritic_${Buffer.from(query + subject).toString('base64')}`;
    const cachedResponse = appCache.get<any>(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    const solverData = await this.executeWithFallback(solverPrompt, solverSystemInstruction, solverSchema);

    const criticPrompt = `You are the StudyFlow AI "Critic AI". Fact-check the following Solver AI's derivation line-by-line against standard academic curriculum and the ground truth.

Question: "${query}"

Solver Derivation:
${JSON.stringify(solverData.steps, null, 2)}

=== NCERT GROUND TRUTH KNOWLEDGE BASE ===
${ncertContext}
=========================================

CRITICAL RULE FOR HONESTY:
- Verify every step against the Ground Truth.
- If the question is within academic scope and conceptually correct, set criticAuditStatus = "VERIFIED" and isOutOfScope = false.
- If the question contains a trick assumption, asks for out-of-scope concepts, or includes a common student/AI hallucination trap, set criticAuditStatus = "FLAGGED", isOutOfScope = true, and provide criticAuditNotes.
- Provide a confidenceScore (0-100).
- Mark unverified steps clearly with verified = false and provide criticFeedback.`;

    const criticSystemInstruction = 'You are the StudyFlow AI Critic Auditor. You have NEVER seen this derivation before and must audit it skeptically step by step.';
    
    const criticSchema = `{
      "criticAuditStatus": "VERIFIED" | "FLAGGED",
      "isOutOfScope": true, // boolean
      "criticAuditNotes": "string",
      "confidenceScore": 0, // integer 0-100
      "stepVerdicts": [
        {
          "stepNumber": 1,
          "verified": true, // boolean
          "criticFeedback": "string (optional)"
        }
      ],
      "pipelineLog": {
        "criticVerificationPassed": true, // boolean
        "criticWarnings": ["string"]
      }
    }`;

    const criticData = await this.executeWithFallback(criticPrompt, criticSystemInstruction, criticSchema);

    const stepVerdictsMap = new Map();
    if (criticData.stepVerdicts && Array.isArray(criticData.stepVerdicts)) {
      for (const v of criticData.stepVerdicts) {
        stepVerdictsMap.set(v.stepNumber, v);
      }
    }

    if (solverData.steps && Array.isArray(solverData.steps)) {
      solverData.steps = solverData.steps.map((step: any) => {
        const verdict = stepVerdictsMap.get(step.stepNumber) || { verified: true, criticFeedback: '' };
        return {
          ...step,
          verified: verdict.verified,
          criticFeedback: verdict.criticFeedback
        };
      });
    }

    let finalStatus = 'FLAGGED';
    if (criticData.criticAuditStatus === 'VERIFIED' && typeof criticData.confidenceScore === 'number' && criticData.confidenceScore >= 75) {
      finalStatus = 'VERIFIED';
    }

    const finalResponse = {
      ...solverData,
      criticAuditStatus: finalStatus,
      isOutOfScope: criticData.isOutOfScope,
      criticAuditNotes: criticData.criticAuditNotes,
      confidenceScore: criticData.confidenceScore,
      stepVerdicts: criticData.stepVerdicts,
      pipelineLog: {
        ...(solverData.pipelineLog || {}),
        ...(criticData.pipelineLog || {})
      }
    };

    appCache.set(cacheKey, finalResponse, 3600 * 24);
    return finalResponse;
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
