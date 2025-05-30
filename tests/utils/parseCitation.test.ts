import { describe, it, expect } from 'vitest';
import { parseCitation, extractCitations, createCitationArgument } from '../../utils/citations';

describe('parseCitation', () => {
  it('should correctly parse a simple citation', () => {
    const result = parseCitation('Genesis 1:1');
    expect(result).toEqual({
      book: 'Genesis',
      chapter: 1,
      verse: 1
    });
  });

  it('should correctly parse a citation with a multi-word book name', () => {
    const result = parseCitation('1 Corinthians 13:4');
    expect(result).toEqual({
      book: '1 Corinthians',
      chapter: 13,
      verse: 4
    });
  });

  it('should correctly parse a citation with a verse range', () => {
    const result = parseCitation('Psalm 23:4-6');
    expect(result).toEqual({
      book: 'Psalm',
      chapter: 23,
      verse: 4,
      rangeEnd: 6
    });
  });

  it('should return null for invalid citation formats', () => {
    expect(parseCitation('Not a citation')).toBeNull();
    expect(parseCitation('Genesis')).toBeNull();
    expect(parseCitation('Genesis 1')).toBeNull();
    expect(parseCitation('Genesis 1:')).toBeNull();
    expect(parseCitation('Genesis :1')).toBeNull();
    expect(parseCitation('Genesis 0:1')).toBeNull();
    expect(parseCitation('Genesis 1:0')).toBeNull();
  });
});

describe('extractCitations', () => {
  it('should extract citations from text', () => {
    const text = 'This dream symbolizes transformation (Romans 12:2) and also shows divine guidance (Psalm 23:4).';
    const result = extractCitations(text);
    expect(result).toEqual(['Romans 12:2', 'Psalm 23:4']);
  });

  it('should filter out invalid citations', () => {
    const text = 'This contains valid (Romans 12:2) and invalid (Not a citation) parenthetical content.';
    const result = extractCitations(text);
    expect(result).toEqual(['Romans 12:2']);
  });

  it('should return an empty array when no citations are present', () => {
    const text = 'This text contains no citations or references to Bible verses.';
    const result = extractCitations(text);
    expect(result).toEqual([]);
  });
});

describe('createCitationArgument', () => {
  it('should create a properly structured argument object', () => {
    const sentences = [
      'The water in your dream symbolizes spiritual renewal.', 
      'This represents the cleansing of your spirit.'
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