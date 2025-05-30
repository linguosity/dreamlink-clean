-- Add arrays for tags and bible_refs to dream_entries table
ALTER TABLE dream_entries ADD COLUMN IF NOT EXISTS tags text[];
ALTER TABLE dream_entries ADD COLUMN IF NOT EXISTS bible_refs text[];