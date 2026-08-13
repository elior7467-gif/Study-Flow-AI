import OpenAI from 'openai';
import { config } from '../config/env';

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

  static async generateSolverCritic(query: string, subject: string) {
    const prompt = `You are the StudyFlow AI Dual-Engine system for JEE/NEET physics students:
1. "Solver AI": Solve the following question strictly using NCERT Class 11 Physics Chapter 5 ("Laws of Motion") principles.
2. "Critic AI": Fact-check the Solver AI's derivation line-by-line against NCERT Class 11 physics curriculum.

Question: "${query}"
Course Context: "${subject}"

CRITICAL RULE FOR HONESTY:
- If the question is in NCERT Class 11 Laws of Motion scope and physically correct:
  * Set criticAuditStatus = "VERIFIED"
  * Set isOutOfScope = false
  * Provide NCERT chapter & page citations.
- If the question contains a trick assumption, asks for out-of-scope advanced physics (e.g., relativistic mechanics, non-inertial quantum tensors), or includes a common student/AI hallucination trap:
  * Set criticAuditStatus = "FLAGGED"
  * Set isOutOfScope = true
  * Set criticAuditNotes = "HONEST WARNING: This question contains out-of-scope concepts or potential AI hallucination risks for JEE/NEET. Do not trust or memorize this derivation! Please consult your physics teacher."
  * Mark unverified steps clearly with verified = false and criticFeedback = "Critic AI Alert: Unbacked by NCERT Class 11 Ch 5 text."`;

    const systemInstruction = 'You are StudyFlow AI, an honest JEE & NEET physics study assistant with a built-in Critic AI fact-checker. You prefer to say "I am not confident / Out of NCERT scope — ask a teacher" over providing a misleading or unbacked answer.';
    
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

    return this.executeWithFallback(prompt, systemInstruction, schemaDescription);
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

    return this.executeWithFallback(prompt, systemInstruction, schemaDescription);
  }
}
