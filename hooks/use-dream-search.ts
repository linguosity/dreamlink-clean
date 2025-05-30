import { useMemo, useState, useEffect } from 'react';

// Dream type definition matching what we use in AnimatedDreamGrid
interface Dream {
  id: string;
  original_text: string;
  title?: string;
  dream_summary?: string;
  analysis_summary?: string;
  topic_sentence?: string;
  supporting_points?: string[];
  conclusion_sentence?: string;
  formatted_analysis?: string;
  tags?: string[];
  bible_refs?: string[];
  created_at?: string;
}

/**
 * Checks if a dream matches a single keyword
 * 
 * @param dream Dream object to check
 * @param keyword Keyword to match against
 * @returns Boolean indicating if the dream matches the keyword
 */
function dreamMatchesKeyword(dream: Dream, keyword: string): boolean {
  const lowerCaseKeyword = keyword.toLowerCase();
  
  // Search in original text
  if (dream.original_text?.toLowerCase().includes(lowerCaseKeyword)) {
    return true;
  }
  
  // Search in title
  if (dream.title?.toLowerCase().includes(lowerCaseKeyword)) {
    return true;
  }
  
  // Search in dream summary
  if (dream.dream_summary?.toLowerCase().includes(lowerCaseKeyword)) {
    return true;
  }
  
  // Search in analysis summary
  if (dream.analysis_summary?.toLowerCase().includes(lowerCaseKeyword)) {
    return true;
  }
  
  // Search in formatted analysis
  if (dream.formatted_analysis?.toLowerCase().includes(lowerCaseKeyword)) {
    return true;
  }
  
  // Search in tags
  if (dream.tags?.some(tag => tag.toLowerCase().includes(lowerCaseKeyword))) {
    return true;
  }
  
  // Search in biblical references
  if (dream.bible_refs?.some(ref => ref.toLowerCase().includes(lowerCaseKeyword))) {
    return true;
  }
  
  // No matches found
  return false;
}

/**
 * Hook for filtering dreams based on multiple keywords (AND logic)
 * 
 * @param dreams Array of dream objects to search
 * @param keywords Array of keywords to filter by (all must match)
 * @returns Filtered array of dreams
 */
export function useDreamSearch(dreams: Dream[], keywords: string[] = []) {
  return useMemo(() => {
    // If no keywords, return all dreams
    if (!keywords || keywords.length === 0) {
      return dreams;
    }
    
    // Filter dreams that match ALL keywords (AND logic)
    return dreams.filter(dream => 
      keywords.every(keyword => dreamMatchesKeyword(dream, keyword))
    );
  }, [dreams, keywords]);
}

/**
 * Legacy hook for filtering dreams based on a single search query
 * Maintained for backward compatibility
 * 
 * @param dreams Array of dream objects to search
 * @param query Search query string
 * @returns Filtered array of dreams
 */
export function useDreamSearchLegacy(dreams: Dream[], query: string = '') {
  return useMemo(() => {
    // If no query, return all dreams
    if (!query || query.trim() === '') {
      return dreams;
    }
    
    return dreams.filter(dream => dreamMatchesKeyword(dream, query));
  }, [dreams, query]);
}

/**
 * Hook for debouncing search input to reduce excessive filtering
 * 
 * @param value Input value to debounce
 * @param delay Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    // Set up timeout to update debounced value
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    // Clean up on unmount or value change
    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);
  
  return debouncedValue;
}