-- SQL to create the audio_stories table in Supabase
-- Run this in the Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.audio_stories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    audio_url TEXT NOT NULL,
    transcription TEXT,
    creator_id TEXT, -- Can be UUID if linked to profiles.id
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.audio_stories ENABLE ROW LEVEL SECURITY;

-- Create policies (Public Read, Admin/System Write)
CREATE POLICY "Public read access" ON public.audio_stories
    FOR SELECT USING (true);

-- For now, allow all insertions if using service role, 
-- or restrict to authenticated users if needed:
CREATE POLICY "System insert access" ON public.audio_stories
    FOR INSERT WITH CHECK (true);
