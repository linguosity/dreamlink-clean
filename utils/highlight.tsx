/**
 * Utility for highlighting text matches in search results
 */

import React from 'react';

/**
 * Helper function to highlight text matches for multiple keywords
 * 
 * @param text The text to search in
 * @param searchTerms Search terms (single string or array of strings)
 * @returns React node with highlighted matches
 */
export function highlightMatches(text: string, searchTerms: string | string[]): React.ReactNode {
  if (!text) return text;
  
  // If searchTerms is a string, convert it to an array
  const terms = Array.isArray(searchTerms) ? searchTerms : [searchTerms];
  
  // Filter out empty terms
  const validTerms = terms.filter(term => term && term.trim().length > 0);
  
  // If no valid search terms, return the original text
  if (!validTerms.length) {
    return text;
  }
  
  // Create a safe pattern by escaping special regex characters
  const escapedTerms = validTerms.map(term => 
    term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  
  // Create a RegExp that matches any of the search terms
  const searchPattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
  
  // Split the text into parts where matching parts are separate array items
  const parts = text.split(searchPattern);
  
  return (
    <>
      {parts.map((part, i) => {
        // Check if this part matches any of the search terms (case insensitive)
        const isMatch = validTerms.some(term => 
          part.toLowerCase() === term.toLowerCase()
        );
        
        if (isMatch) {
          return (
            <mark key={i} className="bg-yellow-200 dark:bg-amber-900 dark:text-white rounded-sm px-0.5">
              {part}
            </mark>
          );
        }
        
        return part;
      })}
    </>
  );
}