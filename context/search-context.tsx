'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-dream-search';
import { FeatureFlag, isFeatureEnabled } from '@/utils/feature-flags';

interface SearchContextType {
  // Current input (what user is typing)
  currentInput: string;
  setCurrentInput: (input: string) => void;
  
  // Keywords array (the chips)
  keywords: string[];
  addKeyword: (keyword: string) => void;
  removeKeyword: (keyword: string) => void;
  removeLastKeyword: () => void;
  clearKeywords: () => void;
  
  // Feature flag and loading state
  isSearchEnabled: boolean;
  isLoading: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export function SearchProvider({ children }: { children: React.ReactNode }) {
  // Check if search feature is enabled - use client only
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  
  // Initialize feature flag from localStorage on client side only
  useEffect(() => {
    setIsSearchEnabled(isFeatureEnabled(FeatureFlag.CLIENT_SEARCH, false));
    
    // Listen for feature flag changes
    const handleFeatureFlagChange = (event: any) => {
      if (event.detail.flag === FeatureFlag.CLIENT_SEARCH) {
        setIsSearchEnabled(event.detail.enabled);
      }
    };
    
    window.addEventListener('featureFlagChanged', handleFeatureFlagChange);
    
    return () => {
      window.removeEventListener('featureFlagChanged', handleFeatureFlagChange);
    };
  }, []);
  
  // State for current input (what user is typing)
  const [currentInput, setCurrentInput] = useState('');
  
  // State for keywords (chips)
  const [keywords, setKeywords] = useState<string[]>([]);
  
  // Debounced keywords to prevent excessive filtering
  const debouncedKeywords = useDebounce(keywords, 300);
  
  // Loading state for when the keywords are updating
  const [isLoading, setIsLoading] = useState(false);
  
  // Add a keyword chip
  const addKeyword = (keyword: string) => {
    if (!keyword.trim()) return;
    
    // Don't add duplicates
    if (keywords.includes(keyword.trim())) return;
    
    setKeywords([...keywords, keyword.trim()]);
    setCurrentInput(''); // Clear input after adding
  };
  
  // Remove a specific keyword chip
  const removeKeyword = (keyword: string) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };
  
  // Remove the last keyword chip (for backspace handling)
  const removeLastKeyword = () => {
    if (keywords.length === 0) return;
    setKeywords(keywords.slice(0, -1));
  };
  
  // Clear all keywords
  const clearKeywords = () => {
    setKeywords([]);
  };
  
  // Set loading state when keywords change but debounced keywords haven't caught up
  useEffect(() => {
    if (JSON.stringify(keywords) !== JSON.stringify(debouncedKeywords)) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [keywords, debouncedKeywords]);
  
  return (
    <SearchContext.Provider
      value={{
        currentInput,
        setCurrentInput,
        keywords,
        addKeyword,
        removeKeyword,
        removeLastKeyword,
        clearKeywords,
        isSearchEnabled,
        isLoading,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch(): SearchContextType {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}