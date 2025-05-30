import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const dreamId = url.searchParams.get('dreamId');
  
  if (!dreamId) {
    return NextResponse.json(
      { error: "Dream ID is required" },
      { status: 400 }
    );
  }
  
  try {
    // Helper function to expand verse ranges
    function expandVerseRange(reference: string): string[] {
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
    }
    
    // Get all Bible citations for the dream
    const { data: citations, error } = await supabase
      .from("bible_citations")
      .select("bible_book, chapter, verse, full_text")
      .eq("dream_entry_id", dreamId);
      
    if (error) {
      console.error("Error fetching Bible citations:", error);
      return NextResponse.json(
        { error: "Failed to fetch Bible citations" },
        { status: 500 }
      );
    }
    
    // Helper function to normalize Bible references
    const normalizeReference = (book: string, chapter: number, verse: number): string => {
      // Normalize book name by removing extra spaces
      const normalizedBook = book.trim().replace(/\s+/g, ' ');
      return `${normalizedBook} ${chapter}:${verse}`;
    };
    
    // Format citations into a lookup map for the frontend
    const verseLookup: Record<string, string> = {};
    
    // Get the bible_refs from the dream_entries table to ensure we're using the exact same references
    // that are stored in the dream entry
    const { data: dreamData } = await supabase
      .from("dream_entries")
      .select("bible_refs")
      .eq("id", dreamId)
      .single();
      
    const dreamRefs = dreamData?.bible_refs || [];
    console.log(`Bible refs from dream_entries: ${dreamRefs.join(", ")}`);
    
    // Add debug logging
    console.log(`Retrieved ${citations.length} citations for dream ${dreamId}`);
    
    // Create an array to capture all verses for debugging
    const verseMapping = [];
    
    // First, create a map of normalized references to citation objects for easier lookup
    const citationMap = new Map();
    citations.forEach(citation => {
      const normalizedRef = normalizeReference(citation.bible_book, citation.chapter, citation.verse);
      citationMap.set(normalizedRef, citation);
    });
    
    // Process each reference from the dream_entries table first
    if (dreamRefs.length > 0) {
      dreamRefs.forEach((ref, index) => {
        // Try to find this reference in our citations
        const parsed = ref.match(/([a-zA-Z\s]+)\s+(\d+):(\d+)/);
        if (parsed) {
          const [, book, chapter, verse] = parsed;
          const normalizedRef = normalizeReference(book, parseInt(chapter), parseInt(verse));
          
          // Look up this reference in our citation map
          const citation = citationMap.get(normalizedRef);
          
          if (citation) {
            // Add the exact reference as it appears in the dream_entries table
            verseLookup[ref] = citation.full_text;
            
            // Store mapping details for debugging
            verseMapping.push({
              reference: ref,
              normalizedReference: normalizedRef,
              text: citation.full_text.substring(0, 50) + "...",
              found: true,
              source: "exact match",
              index
            });
            
            console.log(`✅ Found exact match for dream ref ${ref} -> ${citation.full_text.substring(0, 30)}...`);
          } else {
            console.log(`❌ Could not find exact match for dream ref ${ref}`);
            
            // Add to debugging
            verseMapping.push({
              reference: ref,
              normalizedReference: normalizedRef,
              found: false,
              source: "not found",
              index
            });
          }
        }
      });
    }
    
    // Add all citations to the lookup, using normalized references
    citations.forEach(citation => {
      const normalizedRef = normalizeReference(citation.bible_book, citation.chapter, citation.verse);
      
      // Add normalized reference
      verseLookup[normalizedRef] = citation.full_text;
      
      // If this citation wasn't already mapped from the dream_refs array
      if (!verseMapping.some(item => item.normalizedReference === normalizedRef)) {
        // Store mapping details for debugging
        verseMapping.push({
          reference: normalizedRef,
          normalizedReference: normalizedRef,
          text: citation.full_text.substring(0, 50) + "...",
          book: citation.bible_book,
          chapter: citation.chapter,
          verse: citation.verse,
          found: true,
          source: "normalized only"
        });
        
        console.log(`Mapped normalized ${normalizedRef} -> ${citation.full_text.substring(0, 30)}...`);
      }
    });
    
    // Print detailed mapping for debugging
    console.log("All verse mappings:", verseMapping);
    
    // Standard verses for fallbacks
    const BIBLE_VERSES: Record<string, string> = {
      "Genesis 1:1": "In the beginning God created the heaven and the earth.",
      "Psalm 23:1": "The Lord is my shepherd; I shall not want.",
      "Psalm 23:2": "He maketh me to lie down in green pastures: he leadeth me beside the still waters.",
      "Matthew 5:3": "Blessed are the poor in spirit: for theirs is the kingdom of heaven.",
      "John 3:16": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      "John 8:12": "Then spake Jesus again unto them, saying, I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.",
      "Exodus 14:21": "And Moses stretched out his hand over the sea; and the LORD caused the sea to go back by a strong east wind all that night, and made the sea dry land, and the waters were divided.",
      "1 Kings 6:19": "And the oracle he prepared in the house within, to set there the ark of the covenant of the LORD.",
      "Isaiah 45:3": "And I will give thee the treasures of darkness, and hidden riches of secret places, that thou mayest know that I, the LORD, which call thee by thy name, am the God of Israel.",
      "Philippians 4:19": "But my God shall supply all your need according to his riches in glory by Christ Jesus.",
      "Galatians 6:7": "Be not deceived; God is not mocked: for whatsoever a man soweth, that shall he also reap.",
      "Deuteronomy 8:10": "When thou hast eaten and art full, then thou shalt bless the LORD thy God for the good land which he hath given thee."
    };
    
    // Add fallbacks for any dream references that are missing
    dreamRefs.forEach(ref => {
      // First check if this is a verse range
      const isRange = ref.match(/^([a-zA-Z\s]+\s+\d+):(\d+)-(\d+)$/);
      
      if (isRange) {
        console.log(`Processing verse range: ${ref}`);
        
        // If we already have this range, skip it
        if (verseLookup[ref]) {
          console.log(`Range ${ref} already in verseLookup`);
          return;
        }
        
        // Check if we have a fallback for the range as a whole
        if (BIBLE_VERSES[ref]) {
          verseLookup[ref] = BIBLE_VERSES[ref];
          
          // Add to our mapping for debugging
          verseMapping.push({
            reference: ref,
            text: BIBLE_VERSES[ref].substring(0, 50) + "...",
            found: true,
            source: "fallback-range",
          });
          
          console.log(`📖 Using fallback verse text for range ${ref}`);
        } else {
          // Try to expand the range and look up each individual verse
          const expandedRefs = expandVerseRange(ref);
          const expandedTexts: string[] = [];
          
          // Try to find text for each verse in the range
          expandedRefs.forEach(expandedRef => {
            // Check if we have this individual verse in our citations
            if (verseLookup[expandedRef]) {
              expandedTexts.push(verseLookup[expandedRef]);
            } 
            // Check if we have a fallback for this individual verse
            else if (BIBLE_VERSES[expandedRef]) {
              expandedTexts.push(BIBLE_VERSES[expandedRef]);
            }
          });
          
          // If we found texts for at least some verses, combine them
          if (expandedTexts.length > 0) {
            // Create a combined text for the entire range
            const combinedText = expandedTexts.join(" ");
            verseLookup[ref] = combinedText;
            
            verseMapping.push({
              reference: ref,
              text: combinedText.substring(0, 50) + "...",
              found: true,
              source: "expanded-verses",
              expandedCount: expandedTexts.length,
              totalInRange: expandedRefs.length
            });
            
            console.log(`📖 Created combined text for ${ref} from ${expandedTexts.length}/${expandedRefs.length} verses`);
          } else {
            // No individual verses found either - use placeholder
            console.log(`⚠️ No verse text available for range: ${ref}`);
            verseLookup[ref] = `Verse text not available for ${ref}`;
            
            verseMapping.push({
              reference: ref,
              found: false,
              source: "missing-range",
            });
          }
        }
      } else {
        // Regular single verse reference
        
        // Skip if we already have this reference
        if (verseLookup[ref]) return;
        
        // Check if we have a fallback
        if (BIBLE_VERSES[ref]) {
          verseLookup[ref] = BIBLE_VERSES[ref];
          
          // Add to our mapping for debugging
          verseMapping.push({
            reference: ref,
            text: BIBLE_VERSES[ref].substring(0, 50) + "...",
            found: true,
            source: "fallback",
          });
          
          console.log(`📖 Using fallback verse text for ${ref} -> ${BIBLE_VERSES[ref].substring(0, 30)}...`);
        } else {
          // Last attempt - try to normalize the reference and check again
          const parsed = ref.match(/([a-zA-Z\s]+)\s+(\d+):(\d+)/);
          if (parsed) {
            const [, book, chapter, verse] = parsed;
            const normalizedRef = normalizeReference(book, parseInt(chapter), parseInt(verse));
            
            // Check if we have this normalized version in our fallbacks
            if (BIBLE_VERSES[normalizedRef]) {
              verseLookup[ref] = BIBLE_VERSES[normalizedRef];
              
              verseMapping.push({
                reference: ref,
                normalizedReference: normalizedRef,
                text: BIBLE_VERSES[normalizedRef].substring(0, 50) + "...",
                found: true,
                source: "fallback-normalized",
              });
              
              console.log(`📖 Using normalized fallback verse text for ${ref} -> ${BIBLE_VERSES[normalizedRef].substring(0, 30)}...`);
            } else {
              // We don't have this verse even in fallbacks
              console.log(`⚠️ No verse text available for reference: ${ref}`);
              
              // Use a placeholder that clearly indicates it's missing
              verseLookup[ref] = `Verse text not available for ${ref}`;
              
              verseMapping.push({
                reference: ref,
                found: false,
                source: "missing",
              });
            }
          }
        }
      }
    });
    
    // Create the final combined lookup, but ensure database values take precedence over fallbacks
    const combinedLookup = { ...verseLookup };
    
    // Debug the final lookup state
    console.log("Final verse lookup map size:", Object.keys(combinedLookup).length);
    
    // More compact logging for references
    const refKeys = Object.keys(combinedLookup);
    if (refKeys.length <= 10) {
      console.log("Final verse references available:", refKeys.join(", "));
    } else {
      console.log(`Final verse references available (${refKeys.length} total): ${refKeys.slice(0, 10).join(", ")}...`);
    }
    
    // Detailed logging for dream refs status
    console.log("Status for each dream reference:");
    dreamRefs.forEach(ref => {
      const status = verseLookup[ref] 
        ? (verseLookup[ref].includes("not available") ? "Missing" : "Found") 
        : "Missing";
      console.log(`  ${ref}: ${status}`);
    });
    
    // Add additional debug info to help diagnose issues
    if (dreamId) {
      const debugInfo = {
        versesRequestedFromDream: dreamRefs.length,
        versesFoundInDatabase: citations.length,
        versesFoundTotal: Object.keys(verseLookup).length,
        dbVersesExample: citations.length > 0 ? `${citations[0].bible_book} ${citations[0].chapter}:${citations[0].verse} => ${citations[0].full_text.substring(0, 50)}...` : "None",
        statsBySource: {
          exactMatch: verseMapping.filter(m => m.source === "exact match").length,
          normalizedOnly: verseMapping.filter(m => m.source === "normalized only").length,
          fallback: verseMapping.filter(m => m.source === "fallback").length,
          fallbackNormalized: verseMapping.filter(m => m.source === "fallback-normalized").length,
          missing: verseMapping.filter(m => m.source === "missing").length,
        },
        dreamRefsMatchStatus: dreamRefs.map(ref => ({
          ref,
          found: verseLookup[ref] ? true : false,
          source: verseMapping.find(m => m.reference === ref)?.source || "unknown"
        }))
      };
      console.log("Bible verse lookup debug info:", debugInfo);
    }
    
    return NextResponse.json(combinedLookup);
  } catch (error) {
    console.error("Error processing Bible verse lookup:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}