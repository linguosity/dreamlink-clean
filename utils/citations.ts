/**
 * Utilities for parsing and handling biblical citations
 */

/**
 * Parses a citation string into its component parts
 * @param citation - Citation string (e.g., "Genesis 1:1", "Psalm 23:4-6")
 * @returns Parsed citation object or null if invalid format
 */
export function parseCitation(citation: string): {
  book: string;
  chapter: number;
  verse: number;
  rangeEnd?: number;
} | null {
  // Match patterns like "Genesis 1:1" or "Psalm 23:4-6"
  const regex = /^([a-zA-Z\s]+)\s+(\d+):(\d+)(?:-(\d+))?$/;
  const match = citation.match(regex);

  if (!match) {
    return null;
  }

  const [, book, chapterStr, verseStr, rangeEndStr] = match;
  const chapter = parseInt(chapterStr, 10);
  const verse = parseInt(verseStr, 10);
  
  // Basic validation
  if (isNaN(chapter) || isNaN(verse) || chapter <= 0 || verse <= 0) {
    return null;
  }

  // Handle verse ranges
  if (rangeEndStr) {
    const rangeEnd = parseInt(rangeEndStr, 10);
    if (!isNaN(rangeEnd) && rangeEnd > verse) {
      return { book: book.trim(), chapter, verse, rangeEnd };
    }
  }

  return { book: book.trim(), chapter, verse };
}

/**
 * Extracts citation references from text content
 * @param text - Text that may contain citations in parentheses
 * @returns Array of citation strings found in the text
 */
export function extractCitations(text: string): string[] {
  const citationRegex = /\(([^)]+)\)/g;
  const matches = text.match(citationRegex) || [];
  
  return matches
    .map(match => match.slice(1, -1)) // Remove parentheses
    .filter(citation => parseCitation(citation) !== null); // Ensure it's a valid citation
}

/**
 * Processes a set of sentences with a citation to create an argument object
 * @param sentences - Array of sentences related to the citation
 * @param citation - The citation reference (e.g., "Genesis 1:1")
 * @param citationText - The full text of the referenced verse
 * @returns Structured argument object
 */
export function createCitationArgument(
  sentences: string[], 
  citation: string, 
  citationText: string
) {
  return {
    sentences,
    citation,
    citationText,
    parsedCitation: parseCitation(citation)
  };
}