-- Add personalized_summary column to dream_entries table
ALTER TABLE dream_entries 
ADD COLUMN IF NOT EXISTS personalized_summary text;

-- Add comment to explain the column
COMMENT ON COLUMN dream_entries.personalized_summary IS 'A personalized one-sentence summary addressing the dreamer directly';