"use client";

import { useState, useEffect, KeyboardEvent as ReactKeyboardEvent } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import UserAvatar from "./UserAvatar";
import { useSearch } from "@/context/search-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { 
    currentInput, 
    setCurrentInput, 
    keywords, 
    addKeyword, 
    removeKeyword, 
    removeLastKeyword,
    clearKeywords,
    isSearchEnabled 
  } = useSearch();
  
  const [isFocused, setIsFocused] = useState(false);
  
  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Handle Enter and Backspace in the search input
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && currentInput.trim()) {
      // Add a new keyword on Enter
      addKeyword(currentInput);
      e.preventDefault();
    } else if (e.key === 'Backspace' && !currentInput && keywords.length > 0) {
      // Remove the last keyword on Backspace when input is empty
      removeLastKeyword();
    }
  };
  
  return (
    <nav className="sticky top-0 z-50 border-b bg-background p-4">
      <div className="container mx-auto flex items-center justify-between gap-3">
        {/* Left: Logo - flexible width on mobile */}
        <div className="flex-shrink-0">
          <Link href="/" className="text-lg sm:text-xl font-blanka tracking-wider text-gray-900 dark:text-gray-100 no-brand-style">
            <span className="hidden sm:inline">Dreamlink</span>
            <span className="sm:hidden">DL</span>
          </Link>
        </div>

        {/* Center: Search - takes available space */}
        <div className="flex-1 flex justify-center px-2">
          <div className="w-full max-w-md">
            {/* Search UI - Using client-side only rendering to prevent hydration mismatch */}
            {typeof window !== 'undefined' ? (
              isSearchEnabled ? (
                <div 
                  className={cn(
                    "border rounded-md px-3 py-2 flex flex-wrap items-center gap-2 min-h-10 cursor-text transition-all duration-200",
                    isFocused ? "border-primary shadow-sm bg-background/50" : "border-border hover:border-border/80",
                    keywords.length > 0 ? "border-primary/70" : ""
                  )}
                  onClick={() => {
                    document.getElementById('search-input')?.focus();
                  }}
                >
                  <Search className={cn(
                    "h-4 w-4 flex-shrink-0",
                    keywords.length > 0 || isFocused ? "text-primary" : "text-muted-foreground"
                  )} />
                  
                  {/* Keyword chips */}
                  {keywords.map((keyword, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="flex items-center gap-1 px-2 py-1 text-xs"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeKeyword(keyword);
                        }}
                        className="ml-1 rounded-full hover:bg-primary/20 p-0.5"
                      >
                        <X className="h-2 w-2" />
                      </button>
                    </Badge>
                  ))}
                  
                  {/* Input box */}
                  <input
                    id="search-input"
                    type="text"
                    value={currentInput}
                    onChange={(e) => setCurrentInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={keywords.length > 0 ? "Add..." : "Search..."}
                    className="flex-1 bg-transparent border-none text-sm min-w-[60px] outline-none"
                    autoComplete="off"
                    data-testid="search-input"
                  />
                  
                  {/* Clear button (only shown when there are keywords) */}
                  {keywords.length > 0 && (
                    <button
                      type="button"
                      className="h-5 w-5 p-0 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearKeywords();
                      }}
                      aria-label="Clear search"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                  
                  {/* Keyboard shortcut hint */}
                  <span className="ml-auto text-xs text-muted-foreground hidden sm:inline">
                    Ctrl+K
                  </span>
                </div>
              ) : (
                // Original search UI when feature is disabled (simplified)
                <div className="w-full flex items-center gap-2 text-sm text-muted-foreground border rounded-md px-3 py-2">
                  <Search className="h-4 w-4" />
                  <span>Search dreams...</span>
                </div>
              )
            ) : (
              // Fallback UI for server-side rendering to prevent hydration mismatch
              <div className="w-full flex items-center gap-2 text-sm text-muted-foreground border rounded-md px-3 py-2">
                <Search className="h-4 w-4" />
                <span>Search dreams...</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Profile Avatar with Dropdown */}
        <div className="flex-shrink-0">
          <UserAvatar />
        </div>
      </div>
    </nav>
  );
}