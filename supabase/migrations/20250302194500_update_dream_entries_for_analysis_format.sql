-- supabase/migrations/20250302194500_update_dream_entries_for_analysis_format.sql

-- Add a conclusion_sentence field to complement the topic_sentence for the analysis format
ALTER TABLE dream_entries ADD COLUMN IF NOT EXISTS conclusion_sentence text;

-- Add a supporting_points text array to store supporting statements with citations
ALTER TABLE dream_entries ADD COLUMN IF NOT EXISTS supporting_points text[];

-- Add a formatted_analysis field for pre-formatted analysis text
ALTER TABLE dream_entries ADD COLUMN IF NOT EXISTS formatted_analysis text;

-- Update the bible_citations table to better support the citation format
ALTER TABLE bible_citations ADD COLUMN IF NOT EXISTS supporting_text text;