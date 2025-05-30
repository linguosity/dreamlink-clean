import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// API endpoint to fetch Bible verse text
// This will allow frontend to get verse text from the database instead of hardcoding

export async function GET(request: Request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  
  // Get reference from URL query parameter
  const reference = url.searchParams.get('reference');
  
  if (!reference) {
    return NextResponse.json(
      { error: "Bible reference is required" },
      { status: 400 }
    );
  }
  
  try {
    // Parse reference into components
    const refParts = reference.match(/([a-zA-Z\s]+)\s+(\d+):(\d+)/);
    
    if (!refParts) {
      return NextResponse.json(
        { error: "Invalid reference format. Expected format: Book Chapter:Verse (e.g., Genesis 1:1)" },
        { status: 400 }
      );
    }
    
    const [, book, chapter, verse] = refParts;
    
    // Query the bible_citations table to find the verse text
    const { data, error } = await supabase
      .from("bible_citations")
      .select("full_text")
      .eq("bible_book", book.trim())
      .eq("chapter", parseInt(chapter, 10))
      .eq("verse", parseInt(verse, 10))
      .limit(1);
      
    if (error) {
      console.error("Error fetching Bible verse:", error);
      return NextResponse.json(
        { error: "Failed to fetch Bible verse" },
        { status: 500 }
      );
    }
    
    // If verse found, return it
    if (data && data.length > 0 && data[0].full_text) {
      return NextResponse.json({
        reference,
        text: data[0].full_text
      });
    }
    
    // Fallback for verses not in the database
    // This matches the hardcoded verses from the frontend
    const BIBLE_VERSES: Record<string, string> = {
      "Genesis 1:1": "In the beginning God created the heaven and the earth.",
      "Psalm 23:1": "The Lord is my shepherd; I shall not want.",
      "Psalm 23:2": "He maketh me to lie down in green pastures: he leadeth me beside the still waters.",
      "Matthew 5:3": "Blessed are the poor in spirit: for theirs is the kingdom of heaven.",
      "John 3:16": "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.",
      "John 8:12": "Then spake Jesus again unto them, saying, I am the light of the world: he that followeth me shall not walk in darkness, but shall have the light of life.",
      "Exodus 14:21": "And Moses stretched out his hand over the sea; and the LORD caused the sea to go back by a strong east wind all that night, and made the sea dry land, and the waters were divided.",
      "1 Kings 6:19": "And the oracle he prepared in the house within, to set there the ark of the covenant of the LORD."
    };
    
    // Return hardcoded verse if available
    if (BIBLE_VERSES[reference]) {
      return NextResponse.json({
        reference,
        text: BIBLE_VERSES[reference]
      });
    }
    
    // No verse found
    return NextResponse.json({
      reference,
      text: "Verse text not available"
    });
    
  } catch (error) {
    console.error("Error processing Bible verse request:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}