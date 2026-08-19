import OpenAI from 'openai';
import { config } from 'dotenv';
config();

async function testGroq() {
  const client = new OpenAI({
    apiKey: process.env.PRIMARY_AI_API_KEY,
    baseURL: process.env.PRIMARY_AI_BASE_URL,
  });

  try {
    const res = await client.chat.completions.create({
      model: process.env.PRIMARY_AI_MODEL || 'llama3-8b-8192',
      messages: [{ role: 'user', content: 'What is 2+2?' }],
      tools: [{
        type: 'function',
        function: {
          name: 'get_weather',
          description: 'Get weather',
          parameters: {
            type: 'object',
            properties: { location: { type: 'string' } }
          }
        }
      }]
    });
    console.log(res.choices[0].message);
  } catch (err) {
    console.error("Groq Error:", err.message);
  }
}

testGroq();
