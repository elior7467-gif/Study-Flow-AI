import OpenAI from 'openai';
import { config } from '../config/env';
import { appCache } from '../utils/cache';
import fs from 'fs';
import path from 'path';
import { getExtractor } from '../utils/pipeline';
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

  private static async executeWithFallback(prompt: string, systemInstruction: string, schemaDescription: string, userId?: string, endpoint?: string) {
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
      
      const tokensUsed = response.usage?.total_tokens || 0;
      if (userId && endpoint && tokensUsed > 0) {
        // Fire-and-forget logging
        supabase.from('usage_log').insert([{ 
          user_id: userId, 
          endpoint, 
          tokens_used: tokensUsed 
        }]).then(({error}) => {
          if (error) console.error('[Usage Logger] Error:', error);
        });
      }

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
      
      const tokensUsed = response.usage?.total_tokens || 0;
      if (userId && endpoint && tokensUsed > 0) {
        // Fire-and-forget logging
        supabase.from('usage_log').insert([{ 
          user_id: userId, 
          endpoint, 
          tokens_used: tokensUsed 
        }]).then(({error}) => {
          if (error) console.error('[Usage Logger] Error:', error);
        });
      }

      const content = response.choices[0].message.content;
      return content ? JSON.parse(content) : {};
    } catch (error) {
      console.error(`[AI Engine] Secondary API also failed:`, error);
      secondaryError = error;
    }

    throw new Error(`AI Engine Failure. Primary Error: ${primaryError?.message}. Secondary Error: ${secondaryError?.message}`);
  }

  static async retrieveContext(query: string, filter?: { subject?: string; chapter?: string }) {
    try {
      const extractor = await getExtractor();
      const output = await extractor(query, { pooling: 'mean', normalize: true });
      const query_embedding = Array.from(output.data);

      const { data, error } = await supabase.rpc('match_documents', {
        query_embedding,
        match_threshold: 0.3,
        match_count: 3,
        filter_subject: filter?.subject || null,
        filter_chapter: filter?.chapter || null
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

  static async generateSolverCritic(query: string, subject: string, language: string = 'en', messages: any[] = [], onEvent?: (event: any) => void, userId?: string) {
    const languageMap: Record<string, string> = {
      'en': 'English',
      'bn': 'Bengali',
      'hi': 'Hindi'
    };
    const langName = languageMap[language] || language;

    try {
      if (query.length < 150) {
        const primaryClient = this.getPrimaryClient();
        const recentHistory = messages.slice(-4).map(m => ({ role: m.role, content: m.content }));
        const intentRes = await primaryClient.chat.completions.create({
          model: config.primaryAiModel,
          messages: [
            { role: 'system', content: 'You are an intent classifier. Respond with ONLY the word "CONVERSATION" if the user input is a casual greeting, small talk, or simple acknowledgement without any academic/math/physics query. Otherwise, respond with "ACADEMIC".' },
            ...recentHistory,
            { role: 'user', content: query }
          ],
          max_tokens: 10
        });
        const intent = intentRes.choices[0].message.content?.trim().toUpperCase() || 'ACADEMIC';

        if (intent.includes('CONVERSATION')) {
          if (onEvent) {
            const stream = await primaryClient.chat.completions.create({
              model: config.primaryAiModel,
              messages: [
                { role: 'system', content: `You are StudyFlow AI, a helpful and friendly study assistant. Respond in ${langName}. Keep it brief, conversational, and invite the user to ask a study-related question.` },
                ...recentHistory,
                { role: 'user', content: query }
              ],
              stream: true
            });
            let fullText = '';
            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullText += content;
                onEvent({ type: 'conversation_chunk', data: { content } });
              }
            }
            return { isConversation: true, content: fullText };
          } else {
            const convRes = await primaryClient.chat.completions.create({
              model: config.primaryAiModel,
              messages: [
                { role: 'system', content: `You are StudyFlow AI, a helpful and friendly study assistant. Respond in ${langName}. Keep it brief, conversational, and invite the user to ask a study-related question.` },
                ...recentHistory,
                { role: 'user', content: query }
              ]
            });
            const content = convRes.choices[0].message.content || 'Hello! How can I help you with your studies today?';
            return { isConversation: true, content };
          }
        }
      }
    } catch (err) {
      console.warn('[AI Engine] Intent check failed, falling back:', err);
    }

    // The frontend sends the entire message array including the latest query. 
    // We should exclude the latest query from the history block so it isn't duplicated in the prompt.
    let historyToUse = messages;
    if (messages.length > 0 && messages[messages.length - 1].content === query) {
      historyToUse = messages.slice(0, -1);
    }
    const recentHistory = historyToUse.slice(-5).map(m => ({ role: m.role, content: m.content }));
    const historyText = recentHistory.map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`).join('\n');
    
    let searchQuery = query;
    if (recentHistory.length > 1) {
      try {
        const primaryClient = this.getPrimaryClient();
        const searchRes = await primaryClient.chat.completions.create({
          model: config.primaryAiModel,
          messages: [
            { role: 'system', content: 'You are a search query generator. Given the chat history and the latest question, rewrite the latest question into a standalone, detailed search query optimized for semantic vector search in a physics textbook. Return ONLY the rewritten query text without quotes or preamble.' },
            { role: 'user', content: `Chat History:\n${historyText}\n\nLatest Question: ${query}\n\nRewritten Search Query:` }
          ],
          max_tokens: 60
        });
        searchQuery = searchRes.choices[0].message.content?.trim() || query;
        console.log(`[AI Engine] Rewrote query for RAG: "${query}" -> "${searchQuery}"`);
      } catch (err) {
        console.warn('[AI Engine] Query rewrite failed, using original query:', err);
      }
    }

    const ncertContext = await this.retrieveContext(searchQuery, { subject });

    const solverPrompt = `You are the StudyFlow AI "Solver AI".
Solve the following question strictly using principles relevant to the subject.

=== RECENT CHAT HISTORY ===
${historyText || 'No previous history.'}
===========================

Question: "${query}"
Course Context: "${subject}"

=== NCERT GROUND TRUTH KNOWLEDGE BASE ===
${ncertContext}
=========================================

CRITICAL RULE FOR HONESTY:
- You MUST ONLY use formulas and concepts found in the Ground Truth Knowledge Base above.`;

    const languageInstruction = `Respond entirely in ${langName}, including step descriptions and citation notes, but keep mathematical notation and variable names in English/standard math notation.`;
    const solverSystemInstruction = `You are StudyFlow AI, an intelligent study assistant. Provide a step-by-step derivation without verifying your own work. ${languageInstruction}`;
    
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

    const historyString = JSON.stringify(recentHistory);
    const cacheKey = `solverCritic_${Buffer.from(query + subject + language + historyString).toString('base64')}`;
    const cachedResponse = appCache.get<any>(cacheKey);
    if (cachedResponse) {
      if (onEvent) {
        onEvent({ type: 'solver_draft', data: cachedResponse });
      }
      return cachedResponse;
    }

    const solverData = await this.executeWithFallback(solverPrompt, solverSystemInstruction, solverSchema, userId, 'solver');
    if (onEvent) {
      onEvent({ type: 'solver_draft', data: solverData });
    }

    const criticPrompt = `You are the StudyFlow AI "Critic AI". Fact-check the following Solver AI's derivation line-by-line against standard academic curriculum and the ground truth.

=== RECENT CHAT HISTORY ===
${historyText || 'No previous history.'}
===========================

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

    const criticSystemInstruction = `You are the StudyFlow AI Critic Auditor. You have NEVER seen this derivation before and must audit it skeptically step by step. ${languageInstruction}`;
    
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

    const criticData = await this.executeWithFallback(criticPrompt, criticSystemInstruction, criticSchema, userId, 'critic');

    const stepVerdictsMap = new Map();
    if (criticData.stepVerdicts && Array.isArray(criticData.stepVerdicts)) {
      for (const v of criticData.stepVerdicts) {
        stepVerdictsMap.set(v.stepNumber, v);
      }
    }

    let finalStatus = 'FLAGGED';
    if (criticData.criticAuditStatus === 'VERIFIED' && typeof criticData.confidenceScore === 'number' && criticData.confidenceScore >= 75) {
      finalStatus = 'VERIFIED';
    }

    let finalSolverData = solverData;
    let finalCriticData = criticData;

    // Autonomous Self-Correction Loop
    if (finalStatus === 'FLAGGED') {
      console.log(`[AI Engine] Critic flagged the response. Initiating Self-Correction Loop...`);
      const correctionPrompt = `${solverPrompt}

=== CRITIC FEEDBACK FROM PREVIOUS ATTEMPT ===
The Critic AI rejected your previous derivation for the following reasons:
${criticData.criticAuditNotes}
Step-specific feedback:
${JSON.stringify(criticData.stepVerdicts?.filter((v: any) => !v.verified) || [], null, 2)}

CRITICAL INSTRUCTION: You must rewrite your derivation to address ALL of the Critic's feedback. Do not repeat the same mistakes.`;

      const correctedSolverData = await this.executeWithFallback(correctionPrompt, solverSystemInstruction, solverSchema, userId, 'solver');
      
      if (onEvent) {
         onEvent({ type: 'solver_draft', data: correctedSolverData });
      }

      const reCriticPrompt = `You are the StudyFlow AI "Critic AI". Fact-check the following corrected Solver AI's derivation line-by-line against standard academic curriculum and the ground truth.

=== RECENT CHAT HISTORY ===
${historyText || 'No previous history.'}
===========================

Question: "${query}"

Corrected Solver Derivation:
${JSON.stringify(correctedSolverData.steps, null, 2)}

=== NCERT GROUND TRUTH KNOWLEDGE BASE ===
${ncertContext}
=========================================

CRITICAL RULE FOR HONESTY:
- Verify every step against the Ground Truth.
- If the question is within academic scope and conceptually correct, set criticAuditStatus = "VERIFIED" and isOutOfScope = false.
- If the question contains a trick assumption, asks for out-of-scope concepts, or includes a common student/AI hallucination trap, set criticAuditStatus = "FLAGGED", isOutOfScope = true, and provide criticAuditNotes.
- Provide a confidenceScore (0-100).
- Mark unverified steps clearly with verified = false and provide criticFeedback.`;

      const reCriticData = await this.executeWithFallback(reCriticPrompt, criticSystemInstruction, criticSchema, userId, 'critic');
      
      finalSolverData = correctedSolverData;
      finalCriticData = reCriticData;
      
      if (reCriticData.criticAuditStatus === 'VERIFIED' && typeof reCriticData.confidenceScore === 'number' && reCriticData.confidenceScore >= 75) {
        finalStatus = 'VERIFIED';
      } else {
        finalStatus = 'FLAGGED';
      }
      
      // Update step mapping for the corrected data
      const reStepVerdictsMap = new Map();
      if (reCriticData.stepVerdicts && Array.isArray(reCriticData.stepVerdicts)) {
        for (const v of reCriticData.stepVerdicts) {
          reStepVerdictsMap.set(v.stepNumber, v);
        }
      }

      if (finalSolverData.steps && Array.isArray(finalSolverData.steps)) {
        finalSolverData.steps = finalSolverData.steps.map((step: any) => {
          const verdict = reStepVerdictsMap.get(step.stepNumber) || { verified: true, criticFeedback: '' };
          return {
            ...step,
            verified: verdict.verified,
            criticFeedback: verdict.criticFeedback
          };
        });
      }
    } else {
      if (finalSolverData.steps && Array.isArray(finalSolverData.steps)) {
        finalSolverData.steps = finalSolverData.steps.map((step: any) => {
          const verdict = stepVerdictsMap.get(step.stepNumber) || { verified: true, criticFeedback: '' };
          return {
            ...step,
            verified: verdict.verified,
            criticFeedback: verdict.criticFeedback
          };
        });
      }
    }

    const finalResponse = {
      ...finalSolverData,
      criticAuditStatus: finalStatus,
      isOutOfScope: finalCriticData.isOutOfScope,
      criticAuditNotes: finalCriticData.criticAuditNotes,
      confidenceScore: finalCriticData.confidenceScore,
      stepVerdicts: finalCriticData.stepVerdicts,
      pipelineLog: {
        ...(finalSolverData.pipelineLog || {}),
        ...(finalCriticData.pipelineLog || {})
      }
    };

    appCache.set(cacheKey, finalResponse, 3600 * 24);
    return finalResponse;
  }

  static async generateTopicAudit(topicTitle: string, subtitle: string, unit: string, userId?: string) {
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

    const response = await this.executeWithFallback(prompt, systemInstruction, schemaDescription, userId, 'audit');
    appCache.set(cacheKey, response, 3600 * 24); // Cache for 24 hours
    return response;
  }
}
