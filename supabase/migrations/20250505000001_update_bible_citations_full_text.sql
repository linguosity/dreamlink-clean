-- Migration to update the bible_citations table to store verse text in full_text
-- Instead of storing the citation reference in full_text, we'll use it to store the actual verse text
-- This is cleaner as we already store the book, chapter, and verse in separate columns

-- Create a temporary table to store common Bible verses
CREATE TEMPORARY TABLE temp_bible_verses (
  book TEXT NOT NULL,
  chapter INTEGER NOT NULL,
  verse INTEGER NOT NULL,
  text TEXT NOT NULL
);

-- Insert common verses that appear in the hardcoded frontend object
INSERT INTO temp_bible_verses (book, chapter, verse, text) VALUES
  ('Genesis', 1, 1, 'In the beginning God created the heaven and the earth.'),
  ('Psalm', 23, 1, 'The Lord is my shepherd; I shall not want.'),
  ('Psalm', 23, 2, 'He maketh me to lie down in green pastures: he leadeth me beside the still waters.'),
  ('Matthew', 5, 3, 'Blessed are the poor in spirit: for theirs is the kingdom of heaven.'),
  ('John', 3, 16, 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.'),
  ('John', 8, 12, 'Then spake Jesus again unto them, saying, I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.'),
  ('Exodus', 14, 21, 'And Moses stretched out his hand over the sea; and the LORD caused the sea to go back by a strong east wind all that night, and made the sea dry land, and the waters were divided.'),
  ('1 Kings', 6, 19, 'And the oracle he prepared in the house within, to set there the ark of the covenant of the LORD.');

-- Update existing bible_citations records to replace citation reference with verse text
UPDATE bible_citations bc
SET full_text = tv.text
FROM temp_bible_verses tv
WHERE 
  bc.bible_book = tv.book AND 
  bc.chapter = tv.chapter AND 
  bc.verse = tv.verse;

-- Add a comment to the full_text column to clarify its purpose for future developers
COMMENT ON COLUMN bible_citations.full_text IS 'The actual text of the Bible verse, not the citation reference';

-- Drop the temporary table
DROP TABLE temp_bible_verses;

-- Create or replace a function to build the citation reference string from component parts
-- This helps maintain consistency when displaying citations
CREATE OR REPLACE FUNCTION build_citation_reference(book TEXT, chapter INT, verse INT)
RETURNS TEXT AS $$
BEGIN
  RETURN book || ' ' || chapter::TEXT || ':' || verse::TEXT;
END;
$$ LANGUAGE plpgsql;