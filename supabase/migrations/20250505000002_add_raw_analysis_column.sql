-- Migration to add a JSONB column for storing raw analysis responses
-- This implements a hybrid approach that maintains structured data while adding flexibility

-- Add raw_analysis JSONB column to dream_entries table
ALTER TABLE dream_entries 
ADD COLUMN raw_analysis JSONB;

-- Add a comment explaining the purpose of this column
COMMENT ON COLUMN dream_entries.raw_analysis IS 'Raw JSON response from ChatGPT/AI analysis for flexibility and future feature expansion';

-- Add an index on the raw_analysis column to improve query performance for JSON operations
CREATE INDEX idx_dream_entries_raw_analysis ON dream_entries USING gin(raw_analysis);

-- Create a function to extract fields from raw_analysis if the structured fields are empty
-- This helps with backwards compatibility
CREATE OR REPLACE FUNCTION extract_missing_analysis_fields()
RETURNS TRIGGER AS $$
BEGIN
    -- Only update empty fields if raw_analysis is present
    IF NEW.raw_analysis IS NOT NULL THEN
        -- Update dream_summary if empty
        IF (NEW.dream_summary IS NULL OR NEW.dream_summary = '') AND NEW.raw_analysis->>'dreamSummary' IS NOT NULL THEN
            NEW.dream_summary := NEW.raw_analysis->>'dreamSummary';
        END IF;
        
        -- Update analysis_summary if empty
        IF (NEW.analysis_summary IS NULL OR NEW.analysis_summary = '') AND NEW.raw_analysis->>'analysisSummary' IS NOT NULL THEN
            NEW.analysis_summary := NEW.raw_analysis->>'analysisSummary';
        END IF;
        
        -- Update topic_sentence if empty
        IF (NEW.topic_sentence IS NULL OR NEW.topic_sentence = '') AND NEW.raw_analysis->>'topicSentence' IS NOT NULL THEN
            NEW.topic_sentence := NEW.raw_analysis->>'topicSentence';
        END IF;
        
        -- Update formatted_analysis if empty
        IF (NEW.formatted_analysis IS NULL OR NEW.formatted_analysis = '') AND NEW.raw_analysis->>'formattedAnalysis' IS NOT NULL THEN
            NEW.formatted_analysis := NEW.raw_analysis->>'formattedAnalysis';
        END IF;
        
        -- Update conclusion_sentence if empty
        IF (NEW.conclusion_sentence IS NULL OR NEW.conclusion_sentence = '') AND NEW.raw_analysis->>'conclusionSentence' IS NOT NULL THEN
            NEW.conclusion_sentence := NEW.raw_analysis->>'conclusionSentence';
        END IF;
        
        -- Update supporting_points if empty
        IF NEW.supporting_points IS NULL OR NEW.supporting_points = '{}' THEN
            IF NEW.raw_analysis->'supportingPoints' IS NOT NULL THEN
                NEW.supporting_points := NEW.raw_analysis->'supportingPoints';
            END IF;
        END IF;
        
        -- Update tags if empty
        IF NEW.tags IS NULL OR NEW.tags = '{}' THEN
            IF NEW.raw_analysis->'tags' IS NOT NULL THEN
                NEW.tags := NEW.raw_analysis->'tags';
            END IF;
        END IF;
        
        -- Update bible_refs if empty
        IF NEW.bible_refs IS NULL OR NEW.bible_refs = '{}' THEN
            IF NEW.raw_analysis->'biblicalReferences' IS NOT NULL THEN
                NEW.bible_refs := NEW.raw_analysis->'biblicalReferences';
            END IF;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically extract fields from raw_analysis when needed
DROP TRIGGER IF EXISTS trigger_extract_missing_analysis_fields ON dream_entries;
CREATE TRIGGER trigger_extract_missing_analysis_fields
BEFORE INSERT OR UPDATE ON dream_entries
FOR EACH ROW
EXECUTE FUNCTION extract_missing_analysis_fields();