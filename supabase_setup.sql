-- Run this SQL in your Supabase SQL Editor to create the necessary tables for Chat History

CREATE TABLE IF NOT EXISTS public.chats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Optional: Set up Row Level Security (RLS) if you haven't already
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow read/write access to authenticated users (and anon for development if needed)
-- Note: You may want to restrict this further in production based on auth.uid()
-- Setup Clerk-Supabase JWT integration:
-- 1. In Clerk Dashboard: Go to JWT Templates, create a new template named 'supabase', and add the default claims.
-- 2. In Supabase Dashboard: Go to Project Settings -> API -> JWT Settings and set the JWT secret to your Clerk signing key (or use JWKS).

DROP POLICY IF EXISTS "Allow all access to chats" ON public.chats;
DROP POLICY IF EXISTS "Allow users to access own chats" ON public.chats;
CREATE POLICY "Allow users to access own chats" ON public.chats
FOR ALL USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Allow all access to messages" ON public.messages;
DROP POLICY IF EXISTS "Allow users to access own messages" ON public.messages;
CREATE POLICY "Allow users to access own messages" ON public.messages
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.chats
    WHERE chats.id = messages.chat_id
    AND auth.uid()::text = chats.user_id
  )
);

-- Grant privileges to the anon and authenticated roles
GRANT ALL ON public.chats TO anon, authenticated;
GRANT ALL ON public.messages TO anon, authenticated;

-- ==========================================
-- RAG / Vector Database Setup
-- ==========================================

-- 1. Enable the pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the documents table for storing chunks and embeddings
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    metadata JSONB,
    embedding vector(384) -- 384 dimensions for all-MiniLM-L6-v2
);

-- 3. Set up RLS for documents (optional but good practice)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all access to documents" ON public.documents;
CREATE POLICY "Allow all access to documents" ON public.documents FOR ALL USING (true);
GRANT ALL ON public.documents TO anon, authenticated;

-- 4. Create the match_documents function for cosine similarity search
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(384),
  match_threshold float,
  match_count int,
  filter_subject text DEFAULT NULL,
  filter_chapter text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE sql STABLE
AS $$
  SELECT
    documents.id,
    documents.content,
    documents.metadata,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
    AND (filter_subject IS NULL OR (documents.metadata->>'subject') = filter_subject)
    AND (filter_chapter IS NULL OR (documents.metadata->>'chapter') = filter_chapter)
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
$$;

-- Topic Mastery Tracking
CREATE TABLE IF NOT EXISTS public.user_topic_mastery (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT NOT NULL,
    topic_id TEXT NOT NULL,
    topic_title TEXT,
    verified_count INTEGER DEFAULT 0,
    flagged_count INTEGER DEFAULT 0,
    last_updated TIMESTAMPTZ DEFAULT now(),
    UNIQUE(user_id, topic_id)
);

ALTER TABLE public.user_topic_mastery ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can only read their own mastery" ON public.user_topic_mastery;
CREATE POLICY "Users can only read their own mastery"
    ON public.user_topic_mastery
    FOR SELECT
    USING (auth.uid()::text = user_id);

-- RPC for securely incrementing topic mastery
CREATE OR REPLACE FUNCTION public.upsert_topic_mastery(
    p_user_id TEXT,
    p_topic_id TEXT,
    p_topic_title TEXT,
    p_is_verified BOOLEAN
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_topic_mastery (user_id, topic_id, topic_title, verified_count, flagged_count)
    VALUES (
        p_user_id, 
        p_topic_id, 
        p_topic_title,
        CASE WHEN p_is_verified THEN 1 ELSE 0 END, 
        CASE WHEN NOT p_is_verified THEN 1 ELSE 0 END
    )
    ON CONFLICT (user_id, topic_id) DO UPDATE SET
        topic_title = EXCLUDED.topic_title,
        verified_count = user_topic_mastery.verified_count + CASE WHEN p_is_verified THEN 1 ELSE 0 END,
        flagged_count = user_topic_mastery.flagged_count + CASE WHEN NOT p_is_verified THEN 1 ELSE 0 END,
        last_updated = now();
END;
$$;

-- RPC to get global cohort analytics securely
CREATE OR REPLACE FUNCTION get_cohort_analytics()
RETURNS TABLE(cohort_id TEXT, mean_score NUMERIC, participation BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        topic_id AS cohort_id,
        AVG(
            CASE 
                WHEN (verified_count + flagged_count) = 0 THEN 0.0
                ELSE (verified_count::NUMERIC / (verified_count + flagged_count)::NUMERIC) * 100.0
            END
        ) AS mean_score,
        COUNT(DISTINCT user_id) AS participation
    FROM public.user_topic_mastery
    GROUP BY topic_id;
END;
$$;
