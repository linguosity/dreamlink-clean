-- Migration to add a source column to bible_citations table

-- First check if the column already exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'bible_citations' 
        AND column_name = 'source'
    ) THEN
        -- Add source column to track where verse text came from
        ALTER TABLE bible_citations
        ADD COLUMN source TEXT;
        
        -- Add comment explaining the column
        COMMENT ON COLUMN bible_citations.source IS 'Tracks the source of the verse text: structured (from OpenAI response), verseTextMap (extracted from text), fallback (from static list), fallback-fuzzy (fuzzy match from static list), flexible (from API response with flexible matching), or missing (placeholder)';
    END IF;
END
$$;