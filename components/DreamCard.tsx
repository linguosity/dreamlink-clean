// components/DreamCard.tsx
//
// Technical explanation:
// UI component for displaying a single dream entry card. It's responsible for
// showing the dream's title, date, a brief summary, and any associated tags.
// This component also handles user interactions such as viewing detailed
// analysis in a dialog, deleting the dream entry, sharing it, and displaying
// loading states while data is being fetched or processed. It also includes
// functionality to highlight search terms within the card content.
//
// Analogy:
// Think of this as an individual display case for each dream in a gallery.
// Each case shows a preview of the dream (title, summary, tags) and has
// buttons to manage it: one to open a detailed view (like looking closer at
// the item), one to remove it from the gallery (delete), and one to share it
// with others. It also shows if the item is still being prepared (loading state)
// and can highlight parts of the description if you're searching for something
// specific.

"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from 'next/dynamic';
import { cn } from "@/lib/utils";
import { highlightMatches } from "@/utils/highlight";
import { usePreferences } from "@/context/preferences-context";

// Instead of direct import, use fallback icon components
const MessageSquareIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// Import UI components with error handling
let Card: any, CardContent: any, CardHeader: any, CardTitle: any;
try {
  const cardModule = require("@/components/ui/card");
  Card = cardModule.Card;
  CardContent = cardModule.CardContent;
  CardHeader = cardModule.CardHeader;
  CardTitle = cardModule.CardTitle;
} catch (e) {
  console.error("Failed to load card components:", e);
  // Fallback implementations
  Card = ({ className = "", children, ...props }: any) => (
    <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`} {...props}>{children}</div>
  );
  CardHeader = ({ className = "", children, ...props }: any) => (
    <div className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props}>{children}</div>
  );
  CardContent = ({ className = "", children, ...props }: any) => (
    <div className={`p-6 pt-0 ${className}`} {...props}>{children}</div>
  );
  CardTitle = ({ className = "", children, ...props }: any) => (
    <h3 className={`text-lg font-semibold leading-none tracking-tight ${className}`} {...props}>{children}</h3>
  );
}

// Import badge component with error handling
let Badge: any;
try {
  const badgeModule = require("@/components/ui/badge");
  Badge = badgeModule.Badge;
} catch (e) {
  console.error("Failed to load badge component:", e);
  Badge = ({ className = "", children, variant = "default", ...props }: any) => (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`} {...props}>{children}</div>
  );
}

// Import button component with error handling
let Button: any;
try {
  const buttonModule = require("@/components/ui/button");
  Button = buttonModule.Button;
} catch (e) {
  console.error("Failed to load button component:", e);
  Button = ({ className = "", children, variant = "default", size = "default", ...props }: any) => (
    <button className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background ${className}`} {...props}>{children}</button>
  );
}

// Use inline SVG components instead of lucide-react imports
const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const BookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
);

const PuzzleIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.47 1.229 0 1.698l-1.42 1.42c-.47.47-1.229.47-1.698 0l-1.568-1.568a.997.997 0 0 0-.878-.289l-2.736.419a1 1 0 0 0-.844.844l-.419 2.736a.997.997 0 0 0 .289.878l1.568 1.568c.47.47.47 1.229 0 1.698l-1.42 1.42c-.47.47-1.229.47-1.698 0l-1.568-1.568a.997.997 0 0 0-.878-.289l-2.736.419a1 1 0 0 0-.844.844l-.419 2.736c-.049.322.059.648.289.878l1.568 1.568c.47.47.47 1.229 0 1.698l-1.42 1.42c-.47.47-1.229.47-1.698 0L4.58 19.439a.997.997 0 0 0-.878-.289l-2.736.419a1 1 0 0 0-.844.844l-.419 2.736" />
    <path d="M4 5v4.343" />
    <path d="M9.343 0H5" />
    <path d="M4 14v1a5 5 0 0 0 5 5h1" />
    <path d="M14 19h1a5 5 0 0 0 5-5v-1" />
    <path d="M19 9h-1a5 5 0 0 0-5-5H9" />
  </svg>
);

const Trash2Icon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const ShareIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const StarIcon = ({ className, filled }: { className?: string; filled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
  </svg>
);

const MessageSquare = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

// Import dialog components with error handling
let Dialog: any, DialogContent: any, DialogHeader: any, DialogTitle: any, DialogTrigger: any, DialogDescription: any, DialogFooter: any;
try {
  const dialogModule = require("@/components/ui/dialog");
  Dialog = dialogModule.Dialog;
  DialogContent = dialogModule.DialogContent;
  DialogHeader = dialogModule.DialogHeader;
  DialogTitle = dialogModule.DialogTitle;
  DialogTrigger = dialogModule.DialogTrigger;
  DialogDescription = dialogModule.DialogDescription;
  DialogFooter = dialogModule.DialogFooter;
} catch (e) {
  console.error("Failed to load dialog components:", e);
  // Simple fallback implementations
  Dialog = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  DialogContent = ({ children, ...props }: any) => <div className="fixed inset-0 z-50 flex items-center justify-center" {...props}>{children}</div>;
  DialogHeader = ({ children, ...props }: any) => <div className="flex flex-col space-y-2 text-center sm:text-left" {...props}>{children}</div>;
  DialogTitle = ({ children, ...props }: any) => <h2 className="text-lg font-semibold leading-none tracking-tight" {...props}>{children}</h2>;
  DialogTrigger = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  DialogDescription = ({ children, ...props }: any) => <p className="text-sm text-muted-foreground" {...props}>{children}</p>;
  DialogFooter = ({ children, ...props }: any) => <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2" {...props}>{children}</div>;
}

// Import tabs components with error handling
let Tabs: any, TabsContent: any, TabsList: any, TabsTrigger: any;
try {
  const tabsModule = require("@/components/ui/tabs");
  Tabs = tabsModule.Tabs;
  TabsContent = tabsModule.TabsContent;
  TabsList = tabsModule.TabsList;
  TabsTrigger = tabsModule.TabsTrigger;
} catch (e) {
  console.error("Failed to load tabs components:", e);
  // Simple fallback implementations
  Tabs = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  TabsList = ({ children, ...props }: any) => <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground" {...props}>{children}</div>;
  TabsTrigger = ({ children, ...props }: any) => <button className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm" {...props}>{children}</button>;
  TabsContent = ({ children, ...props }: any) => <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" {...props}>{children}</div>;
}

// Import tooltip components with error handling
let Tooltip: any, TooltipContent: any, TooltipProvider: any, TooltipTrigger: any;
try {
  const tooltipModule = require("@/components/ui/tooltip");
  Tooltip = tooltipModule.Tooltip;
  TooltipContent = tooltipModule.TooltipContent;
  TooltipProvider = tooltipModule.TooltipProvider;
  TooltipTrigger = tooltipModule.TooltipTrigger;
} catch (e) {
  console.error("Failed to load tooltip components:", e);
  // Simple fallback implementations
  Tooltip = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  TooltipContent = ({ children, ...props }: any) => <div className="z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2" {...props}>{children}</div>;
  TooltipProvider = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  TooltipTrigger = ({ children, asChild, ...props }: any) => <div {...props}>{children}</div>;
}

// Import skeleton component with error handling
let Skeleton: any;
try {
  const skeletonModule = require("@/components/ui/skeleton");
  Skeleton = skeletonModule.Skeleton;
} catch (e) {
  console.error("Failed to load skeleton component:", e);
  Skeleton = ({ className = "", ...props }: any) => (
    <div className={`animate-pulse rounded-md bg-muted ${className}`} {...props} />
  );
}

// Import alert dialog components with error handling
let AlertDialog: any, AlertDialogAction: any, AlertDialogCancel: any, AlertDialogContent: any, 
    AlertDialogDescription: any, AlertDialogFooter: any, AlertDialogHeader: any, 
    AlertDialogTitle: any, AlertDialogTrigger: any;
try {
  const alertDialogModule = require("@/components/ui/alert-dialog");
  AlertDialog = alertDialogModule.AlertDialog;
  AlertDialogAction = alertDialogModule.AlertDialogAction;
  AlertDialogCancel = alertDialogModule.AlertDialogCancel;
  AlertDialogContent = alertDialogModule.AlertDialogContent;
  AlertDialogDescription = alertDialogModule.AlertDialogDescription;
  AlertDialogFooter = alertDialogModule.AlertDialogFooter;
  AlertDialogHeader = alertDialogModule.AlertDialogHeader;
  AlertDialogTitle = alertDialogModule.AlertDialogTitle;
  AlertDialogTrigger = alertDialogModule.AlertDialogTrigger;
} catch (e) {
  console.error("Failed to load alert dialog components:", e);
  // Simple fallback implementations
  AlertDialog = ({ children, ...props }: any) => <div {...props}>{children}</div>;
  AlertDialogContent = ({ children, ...props }: any) => <div className="fixed inset-0 z-50 flex items-center justify-center" {...props}>{children}</div>;
  AlertDialogHeader = ({ children, ...props }: any) => <div className="flex flex-col space-y-2 text-center sm:text-left" {...props}>{children}</div>;
  AlertDialogFooter = ({ children, ...props }: any) => <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2" {...props}>{children}</div>;
  AlertDialogTitle = ({ children, ...props }: any) => <h2 className="text-lg font-semibold leading-none tracking-tight" {...props}>{children}</h2>;
  AlertDialogDescription = ({ children, ...props }: any) => <p className="text-sm text-muted-foreground" {...props}>{children}</p>;
  AlertDialogAction = ({ children, ...props }: any) => <button className="inline-flex h-10 items-center justify-center rounded-md bg-primary text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" {...props}>{children}</button>;
  AlertDialogCancel = ({ children, ...props }: any) => <button className="mt-2 inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:mt-0" {...props}>{children}</button>;
  AlertDialogTrigger = ({ children, ...props }: any) => <div {...props}>{children}</div>;
}

// Helper function to highlight text matches for multiple keywords
function highlightText(text: string, searchTerms: string | string[]): React.ReactNode {
  if (!text) return text;
  
  // If searchTerms is a string, convert it to an array
  const terms = Array.isArray(searchTerms) ? searchTerms : [searchTerms];
  
  // If no search terms, return the original text
  if (!terms.length || (terms.length === 1 && !terms[0])) {
    return text;
  }
  
  // Create a safe pattern by escaping special regex characters
  const escapedTerms = terms.map(term => 
    term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  
  // Create a RegExp that matches any of the search terms
  const searchPattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
  
  const parts = text.split(searchPattern);
  
  return (
    <>
      {parts.map((part, i) => {
        // Check if this part matches any of the search terms (case insensitive)
        const isMatch = terms.some(term => 
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

// Legacy helper function to highlight a single search term
function highlightTextLegacy(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm || !text) return text;
  
  const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <mark key={i} className="bg-yellow-200 dark:bg-amber-900 dark:text-white rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

type DreamEntryProps = {
  empty?: boolean;
  loading?: boolean;
  searchTerms?: string[];
  dream: {
    id: string;
    original_text: string;
    title?: string;
    dream_summary?: string;
    personalized_summary?: string;
    analysis_summary?: string;
    topic_sentence?: string;
    supporting_points?: string[];
    conclusion_sentence?: string;
    formatted_analysis?: string;
    tags?: string[];
    bible_refs?: string[];
    created_at?: string;
  };
};

// This would come from your API in a real implementation
const BIBLE_VERSES = {
  "Genesis 1:1": "In the beginning God created the heaven and the earth.",
  "Psalm 23": "The Lord is my shepherd; I shall not want.",
  "Psalm 23:2": "He maketh me to lie down in green pastures: he leadeth me beside the still waters.",
  "Matthew 5:3": "Blessed are the poor in spirit: for theirs is the kingdom of heaven.",
  "John 3:16": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
  "John 8:12": "Then spake Jesus again unto them, saying, I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.",
  "Exodus 14:21": "And Moses stretched out his hand over the sea; and the LORD caused the sea to go back by a strong east wind all that night, and made the sea dry land, and the waters were divided.",
  "1 Kings 6:19": "And the oracle he prepared in the house within, to set there the ark of the covenant of the LORD."
};

export default function DreamCard({ empty, loading: initialLoading, dream: initialDream, searchTerms = [] }: DreamEntryProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(initialLoading || false);
  const [activeTab, setActiveTab] = useState("analysis");
  const [modalHeight, setModalHeight] = useState<number | null>(null);
  const analysisContentRef = useRef<HTMLDivElement>(null);
  const originalContentRef = useRef<HTMLDivElement>(null);
  const [dream, setDream] = useState(initialDream);
  const [bibleVerses, setBibleVerses] = useState<Record<string, string>>({});
  const [isMounted, setIsMounted] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(dream.image_url || null);
  const [showImage, setShowImage] = useState(!!dream.image_url);
  const { preferences } = usePreferences();

  // Ensure client-side hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Format date as MMM DD
  const dateObj = dream.created_at ? new Date(dream.created_at) : new Date();
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
  
  // Helper function to normalize a Bible reference
  const normalizeReference = (reference: string): string => {
    // Remove extra spaces and standardize format
    return reference.trim().replace(/\s+/g, ' ');
  };
  
  // Helper function to expand verse ranges
  const expandVerseRange = (reference: string): string[] => {
    // Match patterns like "Book XX:YY-ZZ" where YY and ZZ are verse numbers
    const rangeMatch = reference.match(/^([a-zA-Z\s]+\s+\d+):(\d+)-(\d+)$/);
    
    if (!rangeMatch) {
      // Not a range, return as is
      return [reference.trim()];
    }
    
    const [, bookChapter, startVerse, endVerse] = rangeMatch;
    const start = parseInt(startVerse, 10);
    const end = parseInt(endVerse, 10);
    
    // Check if it's a valid range
    if (isNaN(start) || isNaN(end) || start > end) {
      console.log(`⚠️ Invalid verse range: ${reference}`);
      return [reference.trim()];
    }
    
    // Expand the range
    const expandedRefs: string[] = [];
    for (let verse = start; verse <= end; verse++) {
      expandedRefs.push(`${bookChapter}:${verse}`);
    }
    
    console.log(`Expanded verse range ${reference} into ${expandedRefs.length} individual verses`);
    return expandedRefs;
  };
  
  // Utility function to find verse text with multiple reference formats
  const getVerseText = (reference: string): { text: string, isFallback: boolean, source: string } => {
    // Normalize reference for consistent lookup
    const normalizedRef = normalizeReference(reference);
    let verseText: string | undefined;
    let isFallback = false;
    let source = "";
    
    // Check if this is a verse range
    const isRange = reference.match(/^([a-zA-Z\s]+\s+\d+):(\d+)-(\d+)$/);
    
    if (isRange) {
      console.log(`Processing verse range in component: ${reference}`);
      
      // Step 1: Try to find the full range text directly
      if (bibleVerses[reference]) {
        verseText = bibleVerses[reference];
        source = "exact-range";
        console.log(`Found exact range match for ${reference}`);
      }
      else if (bibleVerses[normalizedRef]) {
        verseText = bibleVerses[normalizedRef];
        source = "normalized-range";
        console.log(`Found normalized range match for ${normalizedRef}`);
      }
      // Step 2: Try fallback lookup
      else if (BIBLE_VERSES[reference]) {
        verseText = BIBLE_VERSES[reference];
        isFallback = true;
        source = "fallback-range";
        console.log(`Using fallback for range ${reference}`);
      }
      else if (BIBLE_VERSES[normalizedRef]) {
        verseText = BIBLE_VERSES[normalizedRef];
        isFallback = true;
        source = "fallback-normalized-range";
        console.log(`Using fallback for normalized range ${normalizedRef}`);
      }
      // Step 3: Try to build text from individual verses
      else {
        const expandedRefs = expandVerseRange(reference);
        const expandedTexts: string[] = [];
        
        expandedRefs.forEach(expandedRef => {
          // Try finding text for each individual verse
          let expandedVerse: string | undefined;
          
          // Check in biblesVerses
          if (bibleVerses[expandedRef]) {
            expandedVerse = bibleVerses[expandedRef];
          } 
          // Check in fallbacks
          else if (BIBLE_VERSES[expandedRef]) {
            expandedVerse = BIBLE_VERSES[expandedRef];
            isFallback = true;
          }
          
          if (expandedVerse) {
            expandedTexts.push(expandedVerse);
          }
        });
        
        // If we found texts for individual verses, combine them
        if (expandedTexts.length > 0) {
          verseText = expandedTexts.join(" ");
          source = isFallback ? "expanded-fallback" : "expanded";
          console.log(`Built range ${reference} from ${expandedTexts.length}/${expandedRefs.length} individual verses`);
        }
      }
      
      // If still nothing found for range, use placeholder
      if (!verseText) {
        console.log(`No verse text found for range ${reference}`);
        source = "missing-range";
      }
    } 
    else {
      // Regular single verse reference
      
      // Step 1: Try exact reference match first (as provided)
      if (bibleVerses[reference]) {
        verseText = bibleVerses[reference];
        source = "exact";
        console.log(`Found exact verse match for ${reference}`);
      }
      
      // Step 2: Try normalized reference if exact match failed
      else if (bibleVerses[normalizedRef]) {
        verseText = bibleVerses[normalizedRef];
        source = "normalized";
        console.log(`Found normalized verse match for ${normalizedRef}`);
      }
      
      // Step 3: Try alternative formats
      else {
        // Try without spaces between book and chapter (e.g., "Genesis1:1")
        const noSpaceRef = reference.replace(/\s+/g, '');
        if (bibleVerses[noSpaceRef]) {
          verseText = bibleVerses[noSpaceRef];
          source = "no-space";
          console.log(`Found no-space verse match for ${noSpaceRef}`);
        }
        
        // Try splitting and reformatting (book name + chapter:verse)
        else {
          const match = reference.match(/([a-zA-Z\s]+)\s*(\d+:\d+)/);
          if (match) {
            const [, book, chapterVerse] = match;
            const reformattedRef = `${book.trim()} ${chapterVerse.trim()}`;
            
            if (bibleVerses[reformattedRef]) {
              verseText = bibleVerses[reformattedRef];
              source = "reformatted";
              console.log(`Found reformatted verse match for ${reformattedRef}`);
            }
          }
          
          // Last resort: fallback to predefined verses
          if (!verseText) {
            // Try exact and normalized in the fallback list
            if (BIBLE_VERSES[reference]) {
              verseText = BIBLE_VERSES[reference];
              isFallback = true; 
              source = "fallback-exact";
              console.log(`Using fallback verse for ${reference}`);
            }
            else if (BIBLE_VERSES[normalizedRef]) {
              verseText = BIBLE_VERSES[normalizedRef];
              isFallback = true;
              source = "fallback-normalized";
              console.log(`Using fallback verse for ${normalizedRef}`);
            }
          }
        }
      }
      
      // If still not found, use a loading placeholder
      if (!verseText) {
        console.log(`No verse text found for ${reference} (normalized: ${normalizedRef})`);
        source = "missing";
      }
    }
    
    return { 
      text: verseText || `Verse text not available for ${reference}`,
      isFallback,
      source
    };
  };
  
  // Check if this dream is the loading dream (just submitted)
  useEffect(() => {
    const loadingDreamId = typeof window !== 'undefined' ? 
      localStorage.getItem('loadingDreamId') : null;
    
    // Only poll for the "loading" dream
    if (loadingDreamId !== dream.id) return;
    
    console.log('This dream is loading:', dream.id);
    setIsLoading(true);
    
    let pollCount = 0;
    const maxPolls = 60; // Maximum 2 minutes of polling (60 * 2s = 120s)
    
    const interval = setInterval(async () => {
      try {
        pollCount++;
        console.log(`Polling attempt ${pollCount}/${maxPolls} for dream ${dream.id}`);
        
        // Stop polling after maximum attempts
        if (pollCount >= maxPolls) {
          console.log('Maximum polling attempts reached, stopping');
          setIsLoading(false);
          localStorage.removeItem('loadingDreamId');
          clearInterval(interval);
          return;
        }
        
        // If dream already has analysis locally, stop polling
        if (dream.dream_summary || dream.analysis_summary || 
            (dream.supporting_points && dream.supporting_points.length > 0)) {
          console.log('Dream analysis complete locally:', dream.id);
          setIsLoading(false);
          localStorage.removeItem('loadingDreamId');
          clearInterval(interval);
          return;
        }
        
        // Check dream status via API
        const response = await fetch(`/api/dream-entries?id=${dream.id}`, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          }
        });
        
        if (!response.ok) {
          console.error(`API error: ${response.status}`);
          return;
        }
        
        const data = await response.json();
        
        if (data && data.dreams && data.dreams.length > 0) {
          const updatedDream = data.dreams[0];
          
          // When analysis arrives, update state and stop polling
          if (updatedDream.dream_summary || updatedDream.analysis_summary || 
             (updatedDream.supporting_points && updatedDream.supporting_points.length > 0)) {
            console.log('Dream analysis detected via API, updating state');
            setDream(updatedDream);
            setIsLoading(false);
            localStorage.removeItem('loadingDreamId');
            clearInterval(interval);
            
            // Trigger a page refresh to ensure all components update
            if (typeof window !== 'undefined') {
              window.location.reload();
            }
          }
        }
      } catch (err) {
        console.error('Error checking dream status:', err);
        // Continue polling on errors, but count it as an attempt
      }
    }, 2000);
    
    // Always clear on unmount
    return () => {
      console.log('Clearing polling interval for dream:', dream.id);
      clearInterval(interval);
    };
  }, [dream.id]); // Removed other dependencies to prevent re-creating interval
  
  // Calculate and store the maximum height of tab content
  // Fetch Bible verses when the dialog opens
  useEffect(() => {
    if (isOpen && dream.id && dream.bible_refs && dream.bible_refs.length > 0) {
      console.log("🔍 Fetching Bible verses for dream:", dream.id);
      console.log("References needed:", dream.bible_refs);
      
      const fetchBibleVerses = async () => {
        try {
          console.log(`🌐 Making API call to /api/bible-verses/lookup?dreamId=${dream.id}`);
          const response = await fetch(`/api/bible-verses/lookup?dreamId=${dream.id}`);
          
          console.log(`📊 API response status:`, response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log("📚 Fetched Bible verses:", data);
            console.log("Available reference count:", Object.keys(data).length);
            
            // Log details about which verses we have
            if (dream.bible_refs) {
              console.log("Checking response for each needed reference:");
              dream.bible_refs.forEach(ref => {
                const normalizedRef = normalizeReference(ref);
                const hasExact = !!data[ref];
                const hasNormalized = !!data[normalizedRef];
                
                console.log(`  ${ref}: exact=${hasExact}, normalized=${hasNormalized}, value=${
                  hasExact ? data[ref].substring(0, 20) + "..." : 
                  (hasNormalized ? data[normalizedRef].substring(0, 20) + "..." : "not found")
                }`);
              });
            }
            
            // Important: Create a new object to trigger re-render
            const verseData = { ...data };
            setBibleVerses(verseData);
            
            // Verify if we got verse text for all references
            if (dream.bible_refs) {
              const matchSummary = {
                total: dream.bible_refs.length,
                found: 0,
                missing: 0
              };
              
              dream.bible_refs.forEach((ref) => {
                const found = data[ref] ? true : false;
                console.log(`Verse text for ${ref}: ${found ? 'Found' : 'Missing'}`);
                
                if (found) {
                  matchSummary.found++;
                } else {
                  matchSummary.missing++;
                }
              });
              
              console.log("📊 Bible verse match summary:", matchSummary);
            }
          } else {
            console.error("API error response:", await response.text());
          }
        } catch (error) {
          console.error("Error fetching Bible verses:", error);
        }
      };
      
      fetchBibleVerses();
    }
  }, [isOpen, dream.id, dream.bible_refs]);

  // Calculate modal height
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        const analysisHeight = analysisContentRef.current?.offsetHeight || 0;
        const originalHeight = originalContentRef.current?.offsetHeight || 0;
        const maxHeight = Math.max(analysisHeight, originalHeight);
        setModalHeight(maxHeight);
      }, 100);
    }
  }, [isOpen, dream]);

  // Handle image generation
  const handleGenerateImage = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent opening the dialog
    
    if (isGeneratingImage || empty) return;
    
    setIsGeneratingImage(true);
    
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dreamId: dream.id,
          dreamContent: dream.original_text,
          title: dream.title
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate image');
      }
      
      const data = await response.json();
      
      if (data.success && data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
        setShowImage(true);
      } else {
        throw new Error(data.error || 'Failed to generate image');
      }
      
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };
  
  // Handle card click to show dialog
  const handleCardClick = () => {
    // Always open dialog, even for placeholder/example dreams
    setIsOpen(true);
  };
  
  // Handle delete dream
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteDream = async () => {
    if (empty) return; // Don't allow deleting example dreams
    
    setIsDeleting(true);
    
    try {
      console.log('Attempting to delete dream:', dream.id);
      const response = await fetch(`/api/dream-entries?id=${dream.id}`, {
        method: 'DELETE',
      });
      
      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        // Get the error details from the response
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Delete API error:', errorData);
        throw new Error(errorData.error || `Failed to delete dream (status: ${response.status})`);
      }
      
      const result = await response.json();
      console.log('Delete successful:', result);
      
      // Close the dialog and refresh the page
      setIsOpen(false);
      router.refresh();
      
    } catch (error) {
      console.error('Error deleting dream:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete this dream. Please try again.';
      alert(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to format Bible citations in parentheses with tooltips
  const formatBibleCitations = (text: string | undefined, refs?: string[]) => {
    if (!text || !refs || refs.length === 0) return text;
    
    // Add debug logging
    console.log("Formatting citations in text:", text.substring(0, 50) + "...");
    console.log("Available references:", refs);
    console.log("Available verse texts count:", Object.keys(bibleVerses).length);
    console.log("Bible verses keys:", Object.keys(bibleVerses));
    
    // Create JSX elements with formatted citations and tooltips
    return (
      <TooltipProvider delayDuration={200} skipDelayDuration={0}>
        {text.split(/(\([^)]*\))/).map((part, index) => {
          // Check if this part contains a Bible reference
          const refMatch = part.match(/\(([\w\s]+\d+:\d+)\)/);
          
          if (refMatch) {
            const reference = refMatch[1];
            const isValidRef = refs.includes(reference);
            
            console.log(`Found reference in text: ${reference}, is in refs: ${isValidRef}, has verse text: ${bibleVerses[reference] ? 'Yes' : 'No'}`);
            
            // Get the verse text using our utility function
            const { text: verseText, isFallback, source } = getVerseText(reference);
            console.log(`Verse for reference ${reference}: source=${source}, isFallback=${isFallback}`);
            
            // Only create tooltip if this is a valid reference and we found a verse
            if (isValidRef) {
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <span className="cursor-help">{part}</span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-[300px] text-xs">
                      <div>{verseText}</div>
                      {isFallback && (
                        <div className="text-[10px] italic text-muted-foreground mt-1">
                          Note: Using standard verse text
                        </div>
                      )}
                      {source === "missing" && (
                        <div className="text-[10px] italic text-red-500 mt-1">
                          Warning: No verse text found
                        </div>
                      )}
                      {source === "missing-range" && (
                        <div className="text-[10px] italic text-red-500 mt-1">
                          Warning: No verse text found for this range
                        </div>
                      )}
                      {source.startsWith("expanded") && (
                        <div className="text-[10px] italic text-blue-500 mt-1">
                          Note: Combined from individual verses
                        </div>
                      )}
                      {source.includes("range") && !source.includes("missing") && (
                        <div className="text-[10px] italic text-green-500 mt-1">
                          {reference}
                        </div>
                      )}
                      {(process.env.NODE_ENV === 'development' || process.env.DEBUG) && (
                        <div className="text-[8px] opacity-50 mt-1 border-t pt-1">
                          Debug: src={source}, ref={reference}
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              );
            }
          }
          
          // If no match or not a valid reference, return the part as is
          
          return <span key={index}>{part}</span>;
        })}
      </TooltipProvider>
    );
  };

  // Render loading skeleton if in loading state
  if (isLoading) {
    return (
      <Card className="overflow-hidden transition-all h-full">
        <CardHeader className="p-3 pb-1">
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-[150px]" />
            <Skeleton className="h-3 w-[60px]" />
          </div>
        </CardHeader>
        
        <CardContent className="p-3 pt-1 space-y-2">
          {/* Summary Skeleton */}
          <div>
            <Skeleton className="h-3 w-full mb-1" />
            <Skeleton className="h-3 w-[80%]" />
          </div>
          
          {/* Tags Skeleton */}
          <div className="flex flex-wrap gap-1">
            <Skeleton className="h-4 w-12 rounded-full" />
            <Skeleton className="h-4 w-14 rounded-full" />
            <Skeleton className="h-4 w-10 rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Generate a shareable text for social sharing
  const getShareableText = () => {
    const title = dream.title || "My Dream";
    const summary = dream.dream_summary || "";
    return `${title}: ${summary.substring(0, 100)}${summary.length > 100 ? '...' : ''}`;
  };
  
  const getShareUrl = () => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://dreamlink.app';
    return `${baseUrl}/shared/dream/${dream.id}`;
  };
  
  return (
    <>
      <Card 
        className={cn(
          "overflow-hidden transition-all h-full cursor-pointer hover:shadow-md will-change-transform",
          searchTerms.length > 0 && "ring-1 ring-primary"
        )}
        onClick={handleCardClick}
      >
        <CardHeader className="p-3 pb-1">
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-sm leading-5 flex-1 min-w-0">
              <div className="break-words">
                {searchTerms.length > 0 
                  ? highlightMatches(dream.title || "", searchTerms) 
                  : dream.title
                }
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center text-xs text-muted-foreground flex-shrink-0">
                <CalendarIcon className="h-3 w-3 mr-1" />
                <span className="whitespace-nowrap">{formattedDate}</span>
              </div>
              {!empty && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage}
                        className="opacity-60 hover:opacity-100 transition-opacity disabled:opacity-30"
                        aria-label="Generate cover image"
                      >
                        {isGeneratingImage ? (
                          <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                        ) : (
                          <StarIcon 
                            className="h-4 w-4 text-yellow-500 hover:text-yellow-600" 
                            filled={!!generatedImageUrl}
                          />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">
                        {generatedImageUrl ? 'Regenerate cover image' : 'Generate cover image'}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-3 pt-1 space-y-2 relative overflow-hidden">
          {/* Generated Image Overlay */}
          {generatedImageUrl && showImage && preferences.showCoverImages && (
            <div 
              className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 ease-in-out ${
                showImage ? 'translate-x-0' : 'translate-x-full'
              }`}
              style={{ backgroundImage: `url(${generatedImageUrl})` }}
            >
              <div className="absolute inset-0 bg-black/20" />
              <div className="absolute top-2 right-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowImage(false);
                  }}
                  className="bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-colors"
                  aria-label="Hide image"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <h3 className="text-white text-sm font-medium truncate">
                  {dream.title}
                </h3>
                <p className="text-white/80 text-xs truncate">
                  {formattedDate}
                </p>
              </div>
            </div>
          )}
          
          {/* Original Content */}
          <div className={`transition-transform duration-500 ease-in-out ${
            showImage && preferences.showCoverImages ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'
          }`}>
            {/* Summary */}
          {(dream.personalized_summary || dream.dream_summary) && (
            <div>
              <p className="text-xs text-muted-foreground leading-4 break-words">
                {searchTerms.length > 0 
                  ? highlightMatches(dream.personalized_summary || dream.dream_summary || "", searchTerms)
                  : (dream.personalized_summary || dream.dream_summary)
                }
              </p>
            </div>
          )}
          
          {/* Tags */}
          {dream.tags && dream.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {dream.tags.slice(0, 6).map((tag, index) => {
                // Check if tag matches any search term
                const isTagMatch = searchTerms.some(term => 
                  term && tag.toLowerCase().includes(term.toLowerCase())
                );
                
                return (
                  <Badge key={index} variant="secondary" className={cn(
                    "text-xs px-2 py-0.5 break-words",
                    isTagMatch && "bg-primary/10"
                  )}>
                    {isTagMatch
                      ? highlightMatches(tag, searchTerms)
                      : tag
                    }
                  </Badge>
                );
              })}
            </div>
          )}
          
            {/* Original text preview (shown only when there's a search match and no summary) */}
            {searchTerms.length > 0 && !dream.personalized_summary && !dream.dream_summary && (
              <div className="text-xs text-muted-foreground">
                {highlightMatches(dream.original_text, searchTerms)}
              </div>
            )}
            
            {/* Bible References - removed from card view */}
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{dream.title}</DialogTitle>
            <div className="flex items-center text-xs text-muted-foreground">
              <CalendarIcon className="h-3 w-3 mr-1" />
              {dateObj.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </DialogHeader>
          
          <Tabs 
            defaultValue="analysis" 
            className="w-full"
            value={activeTab}
            onValueChange={(value: string) => setActiveTab(value)}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="analysis" className="flex items-center gap-1"><PuzzleIcon className="h-3 w-3" />Analysis</TabsTrigger>
              <TabsTrigger value="original">Original Dream</TabsTrigger>
            </TabsList>
            
            <div style={{ minHeight: modalHeight ? `${modalHeight}px` : 'auto' }}>
              <TabsContent value="analysis" className="space-y-4 p-1">
                <div ref={analysisContentRef}>
                  {/* Summary section removed as requested */}
                  
                  {dream.formatted_analysis ? (
                    <div className="text-sm text-muted-foreground">
                      {formatBibleCitations(dream.formatted_analysis, dream.bible_refs)}
                    </div>
                  ) : dream.analysis_summary ? (
                    <div className="text-sm text-muted-foreground">
                      {formatBibleCitations(dream.analysis_summary, dream.bible_refs)}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {dream.topic_sentence && (
                        <div className="text-sm text-muted-foreground font-medium">
                          {dream.topic_sentence}
                        </div>
                      )}
                      {dream.supporting_points && dream.supporting_points.length > 0 && (
                        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                          {dream.supporting_points.map((point, index) => (
                            <li key={index}>{formatBibleCitations(point, dream.bible_refs)}</li>
                          ))}
                        </ul>
                      )}
                      {dream.conclusion_sentence && (
                        <div className="text-sm text-muted-foreground mt-2">
                          {dream.conclusion_sentence}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="original" className="space-y-4 p-1">
                <div ref={originalContentRef} className="text-sm whitespace-pre-wrap">
                  {searchTerms.length > 0 
                    ? highlightMatches(dream.original_text, searchTerms)
                    : dream.original_text
                  }
                </div>
              </TabsContent>
            </div>
          </Tabs>
          
          {/* Social Share Row */}
          <div className="flex justify-end items-center mb-4">
            <div className="text-xs text-muted-foreground mr-2">Share:</div>
            <div className="flex items-center space-x-2">
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl())}`} target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#3b5998" className="rounded-full">
                  <path d="M18 2h-12c-2.21 0-4 1.79-4 4v12c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4v-12c0-2.21-1.79-4-4-4zm0 4v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v7h-3v-7h-2v-3h2v-2.5c0-1.93 1.57-3.5 3.5-3.5h2.5z"/>
                </svg>
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(getShareableText())}`} target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2" className="rounded-full">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05-.78-.83-1.9-1.36-3.16-1.36-2.35 0-4.27 1.92-4.27 4.29 0 .34.03.67.11.98-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21-.36.1-.74.15-1.13.15-.27 0-.54-.03-.8-.08.54 1.69 2.11 2.95 4 2.98-1.46 1.16-3.31 1.84-5.33 1.84-.34 0-.68-.02-1.02-.06 1.9 1.22 4.16 1.93 6.58 1.93 7.88 0 12.21-6.54 12.21-12.21 0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href={`viber://forward?text=${encodeURIComponent(getShareableText() + " " + getShareUrl())}`} target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#7360f2" className="rounded-full">
                  <path d="M12 1c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.238 7.525c2.246.235 3.455 1.512 3.667 3.824.039.433-.28.857-.75.857-.458 0-.85-.34-.885-.797-.149-1.604-.85-2.354-2.092-2.521-.389-.053-.695-.368-.695-.76 0-.415.366-.776.755-.603zm.31-1.97c3.252.306 5.212 2.374 5.499 5.666.029.337-.252.665-.585.665-.327 0-.596-.265-.626-.601-.211-2.609-1.69-4.153-4.209-4.405-.335-.033-.591-.321-.591-.656 0-.355.327-.673.682-.622.377-.04.422-.053.422-.053s-.045.013-.422.053c-.051-.006-.091-.029-.137-.045.437.065-.01.044-.059.044-.345 0-.627-.291-.627-.64 0-.35.282-.642.626-.642.168 0 .32.066.435.174.032-.016.119-.062.119-.062s-.086.045-.119.062v-.001zm.536-1.56c4.23.283 6.766 2.862 7.081 7.215.015.21-.31.437-.491.437-.261 0-.49-.213-.506-.47-.267-3.705-2.276-5.761-5.871-6.003-.348-.023-.611-.306-.611-.658 0-.336.273-.625.602-.625.188.001.362.081.486.214.047-.021.103-.045.103-.045s-.056.023-.103.045v.001zm9.022 12.114c-.597-.893-1.13-1.878-1.676-2.84-.741-1.309-1.929-.303-2.454.3-.536.616-1.032.674-1.362.27-.981-1.195-1.615-2.071-2.38-3.634 0 0-.3-.61-.873-1.641l-.014-.029c-.3-.61-.273-.913.045-1.289.309-.37 1.464-1.591.9-3.178-.535-1.505-2.565-5.802-3.618-5.148-1.061.658-1.357 1.41-1.352 2.11.005.7.194 1.339.374 1.862.172.5.316.958.316 1.363 0 .255-.043.49-.118.695-.127.347-.322.582-.508.808-.199.244-.38.458-.536.798-.151.333-.211.704-.211 1.102 0 1.008.619 2.674 1.125 3.589.399.731.81 1.359 1.246 1.887.859 1.044 1.893 1.893 2.834 2.507 1.451.948 3.082 1.608 4.999 1.608 1.072 0 1.96-.244 2.674-.732.366-.249.666-.559.916-.914.229-.328.401-.702.489-1.102.088-.4.096-.8.033-1.196-.065-.416-.176-.821-.291-1.211-.104-.35-.237-.695-.237-1.067 0-.39.124-.876.675-1.591.088-.115.999-1.179 1.271-1.499.272-.32.743-1.111.25-1.888z"/>
                </svg>
              </a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(getShareUrl())}&text=${encodeURIComponent(getShareableText())}`} target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0088cc" className="rounded-full">
                  <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.041 16.737c-.26 0-.215-.198-.306-.396l-.762-2.512 5.859-3.671-6.659 3.939-2.833-.726c-.613-.151-.613-.586.306-.879l11.08-4.581c.504-.302.909.151.706.879l-1.867 8.823c-.151.528-.628.654-1.01.4l-2.833-2.08-1.365 1.376c-.151.152-.306.228-.316.328z"/>
                </svg>
              </a>
              <a
                href={`sms:?body=${encodeURIComponent(`${getShareableText()} ${getShareUrl()}`)}`}
                className="opacity-50 hover:opacity-100 transition-opacity"
                aria-label="Share via SMS"
              >
                <MessageSquareIcon className="h-6 w-6 text-gray-600" />
              </a>
            </div>
          </div>

          {/* Footer with tags and biblical references */}
          <div className="pt-4 border-t">
            <div className="flex justify-between items-start">
              <div className="flex flex-wrap gap-2">
                {dream.tags && dream.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {dream.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                {dream.bible_refs && dream.bible_refs.length > 0 && isMounted && (
                  <div className="flex flex-wrap gap-1">
                    <TooltipProvider delayDuration={200} skipDelayDuration={0}>
                      {dream.bible_refs.map((ref, index) => {
                        // Get verse text using our utility function
                        const { text: verseText, isFallback, source } = getVerseText(ref);
                        console.log(`Badge verse for reference ${ref}: source=${source}, isFallback=${isFallback}`);
                        
                        console.log(`Badge reference: ${ref}, has verse text: ${verseText !== 'Verse content loading...' ? 'Yes' : 'No'}`);
                        
                        return (
                          <Tooltip key={index}>
                            <TooltipTrigger asChild>
                              <Badge variant="outline" className="text-xs flex items-center gap-1">
                                <BookIcon className="h-2 w-2" />
                                {ref}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-[300px] text-xs">
                                <div>{verseText}</div>
                                {isFallback && (
                                  <div className="text-[10px] italic text-muted-foreground mt-1">
                                    Note: Using standard verse text
                                  </div>
                                )}
                                {source === "missing" && (
                                  <div className="text-[10px] italic text-red-500 mt-1">
                                    Warning: No verse text found
                                  </div>
                                )}
                                {source === "missing-range" && (
                                  <div className="text-[10px] italic text-red-500 mt-1">
                                    Warning: No verse text found for this range
                                  </div>
                                )}
                                {source.startsWith("expanded") && (
                                  <div className="text-[10px] italic text-blue-500 mt-1">
                                    Note: Combined from individual verses
                                  </div>
                                )}
                                {source.includes("range") && !source.includes("missing") && (
                                  <div className="text-[10px] italic text-green-500 mt-1">
                                    {ref}
                                  </div>
                                )}
                                {(process.env.NODE_ENV === 'development' || process.env.DEBUG) && (
                                  <div className="text-[8px] opacity-50 mt-1 border-t pt-1">
                                    Debug: src={source}, ref={ref}
                                  </div>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        );
                      })}
                    </TooltipProvider>
                  </div>
                )}
              </div>
              
              {/* Delete Button with Confirmation */}
              {!empty && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2Icon className="h-4 w-4 mr-1" />
                      <span className="text-xs">Delete</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure you want to delete this dream?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete your dream and all associated analysis.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDeleteDream}
                        className="bg-red-500 hover:bg-red-600"
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete Dream"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}