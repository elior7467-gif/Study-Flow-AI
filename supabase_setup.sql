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
CREATE POLICY "Allow all access to chats" ON public.chats FOR ALL USING (true);
CREATE POLICY "Allow all access to messages" ON public.messages FOR ALL USING (true);
