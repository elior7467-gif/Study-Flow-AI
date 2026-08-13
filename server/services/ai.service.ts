import { GoogleGenAI, Type } from '@google/genai';
import { config } from '../config/env';

export class AiService {
  private static getClient() {
    if (!config.geminiApiKey) {
      throw new Error('Missing Gemini API Key. Please attach your API key in the environment to use AI features.');
    }
    return new GoogleGenAI({
      apiKey: config.geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }

  static async generateSolverCritic(query: string, subject: string) {
    const ai = this.getClient();
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

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are StudyFlow AI, an honest JEE & NEET physics study assistant with a built-in Critic AI fact-checker. You prefer to say "I am not confident / Out of NCERT scope — ask a teacher" over providing a misleading or unbacked answer.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            isOutOfScope: { type: Type.BOOLEAN },
            steps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  stepNumber: { type: Type.INTEGER },
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  verified: { type: Type.BOOLEAN },
                  mathBlock: { type: Type.STRING },
                  criticFeedback: { type: Type.STRING },
                },
                required: ['stepNumber', 'title', 'description', 'verified'],
              },
            },
            finalEquation: { type: Type.STRING },
            citation: {
              type: Type.OBJECT,
              properties: {
                textbook: { type: Type.STRING },
                chapter: { type: Type.STRING },
                notes: { type: Type.STRING },
                ncertPage: { type: Type.STRING },
              },
              required: ['textbook', 'chapter', 'notes'],
            },
            criticAuditStatus: { type: Type.STRING },
            criticAuditNotes: { type: Type.STRING },
            pipelineLog: {
              type: Type.OBJECT,
              properties: {
                solverDraftSummary: { type: Type.STRING },
                criticVerificationPassed: { type: Type.BOOLEAN },
                ncertSourceMatch: { type: Type.STRING },
                criticWarnings: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
              },
              required: [
                'solverDraftSummary',
                'criticVerificationPassed',
                'ncertSourceMatch',
              ],
            },
          },
          required: [
            'title',
            'summary',
            'steps',
            'finalEquation',
            'citation',
            'criticAuditStatus',
            'criticAuditNotes',
          ],
        },
      },
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  }

  static async generateTopicAudit(topicTitle: string, subtitle: string, unit: string) {
    const ai = this.getClient();
    const prompt = `Perform a Critic Audit on the academic topic "${topicTitle}" (${subtitle}) in unit "${unit}". Evaluate mathematical consistency, sign conventions, and common student pitfalls.`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction:
          'You are StudyFlow AI Critic Auditor. You audit physics concepts for mathematical consistency, sign errors, reference frames, and edge cases.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING },
            auditDetails: { type: Type.STRING },
            insights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            recommendedMasteryScore: { type: Type.INTEGER },
          },
          required: ['status', 'auditDetails', 'insights', 'recommendedMasteryScore'],
        },
      },
    });

    const text = response.text || '{}';
    return JSON.parse(text);
  }
}
