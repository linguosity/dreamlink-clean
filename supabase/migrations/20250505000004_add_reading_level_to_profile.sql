-- Add reading_level to profile table
ALTER TABLE profile 
ADD COLUMN IF NOT EXISTS reading_level text DEFAULT 'celestial_insight';

-- Add comment to explain reading levels
COMMENT ON COLUMN profile.reading_level IS 'User preference for dream analysis reading level: radiant_clarity (simple), celestial_insight (standard), prophetic_wisdom (advanced), divine_revelation (scholarly)';