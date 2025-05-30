import { describe, it, expect } from 'vitest';
import { parseCitation, extractCitations, createCitationArgument } from '../../utils/citations';

describe('Bible Citation Utilities', () => {
  describe('parseCitation function', () => {
    it('should correctly parse a simple citation', () => {
      const result = parseCitation('Genesis 1:1');
      
      expect(result).toEqual({
        book: 'Genesis',
        chapter: 1,
        verse: 1
      });
    });

    it('should correctly parse a citation with multi-word book name', () => {
      const result = parseCitation('1 Kings 6:19');
      
      expect(result).toEqual({
        book: '1 Kings',
        chapter: 6,
        verse: 19
      });
    });

    it('should correctly parse a citation with verse range', () => {
      const result = parseCitation('Psalm 23:4-6');
      
      expect(result).toEqual({
        book: 'Psalm',
        chapter: 23,
        verse: 4,
        rangeEnd: 6
      });
    });

    it('should return null for invalid citation format', () => {
      expect(parseCitation('Genesis')).toBeNull();
      expect(parseCitation('Genesis 1')).toBeNull();
      expect(parseCitation('Genesis 1:')).toBeNull();
      expect(parseCitation('Genesis:1')).toBeNull();
      expect(parseCitation('1:1')).toBeNull();
    });

    it('should return null if numbers are invalid', () => {
      expect(parseCitation('Genesis 0:1')).toBeNull();
      expect(parseCitation('Genesis 1:0')).toBeNull();
      expect(parseCitation('Genesis -1:1')).toBeNull();
    });
  });

  describe('extractCitations function', () => {
    it('should extract all valid citations from text', () => {
      const text = 'This dream shows guidance (Psalm 23:4) and divine light (John 8:12) for your path.';
      const result = extractCitations(text);
      
      expect(result).toEqual(['Psalm 23:4', 'John 8:12']);
    });

    it('should return an empty array if no citations are found', () => {
      const text = 'This dream has no biblical references at all.';
      const result = extractCitations(text);
      
      expect(result).toEqual([]);
    });

    it('should filter out invalid citation formats', () => {
      const text = 'Citations (Genesis 1:1) (Invalid 2:3) (Psalm 23:4-6) (Not a citation)';
      const result = extractCitations(text);
      
      expect(result).toEqual(['Genesis 1:1', 'Psalm 23:4-6']);
    });
  });

  describe('createCitationArgument function', () => {
    it('should create a correctly structured citation argument', () => {
      const sentences = [
        'The water represents spiritual cleansing.',
        'It symbolizes renewal of the soul.'
      ];
      const citation = 'John 7:38';
      const citationText = 'Whoever believes in me, as Scripture has said, rivers of living water will flow from within them.';
      
      const result = createCitationArgument(sentences, citation, citationText);
      
      expect(result).toEqual({
        sentences,
        citation,
        citationText,
        parsedCitation: {
          book: 'John',
          chapter: 7,
          verse: 38
        }
      });
    });
  });
});