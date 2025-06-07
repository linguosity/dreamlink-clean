-- Create image_generations table to track image generation requests
CREATE TABLE IF NOT EXISTS image_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dream_id UUID NOT NULL REFERENCES dream_entries(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  request_id TEXT NOT NULL,
  polling_url TEXT,
  image_url TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE image_generations ENABLE ROW LEVEL SECURITY;

-- Users can only see their own image generations
CREATE POLICY "Users can view own image generations" ON image_generations
  FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own image generations
CREATE POLICY "Users can create own image generations" ON image_generations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own image generations
CREATE POLICY "Users can update own image generations" ON image_generations
  FOR UPDATE USING (auth.uid() = user_id);

-- Create index for faster lookups
CREATE INDEX idx_image_generations_user_id ON image_generations(user_id);
CREATE INDEX idx_image_generations_dream_id ON image_generations(dream_id);
CREATE INDEX idx_image_generations_request_id ON image_generations(request_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_image_generations_updated_at BEFORE UPDATE
  ON image_generations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();