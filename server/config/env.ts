import 'dotenv/config';
export const config = {
  port: Number(process.env.PORT) || 3000,
  primaryAiApiKey: process.env.PRIMARY_AI_API_KEY,
  primaryAiBaseUrl: process.env.PRIMARY_AI_BASE_URL || 'https://api.openai.com/v1',
  primaryAiModel: process.env.PRIMARY_AI_MODEL || 'gpt-4o-mini',
  secondaryAiApiKey: process.env.SECONDARY_AI_API_KEY,
  secondaryAiBaseUrl: process.env.SECONDARY_AI_BASE_URL || 'https://api.openai.com/v1',
  secondaryAiModel: process.env.SECONDARY_AI_MODEL || 'gpt-3.5-turbo',
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL,
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  adminSecret: process.env.ADMIN_SECRET,
};
