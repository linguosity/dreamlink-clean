// app/api/dream-entries/route.ts
//
// Technical explanation:
// This file defines the API route handler for managing dream entries. It
// supports GET, POST, and DELETE HTTP methods to interact with the Supabase
// database. For POST requests (new dream entries), it also triggers an
// asynchronous AI analysis of the dream content using a separate OpenAI
// analysis service.
//
// Analogy:
// This script acts like a central post office for all dream-related mail.
// - When you send a new dream (POST request), the post office receives it,
//   stores it in the main archive (Supabase), and also sends a copy to a
//   specialist (AI analysis service) for interpretation.
// - If you want to retrieve a dream (GET request), the post office fetches
//   it from the archive for you.
// - If you want to discard a dream (DELETE request), the post office removes
//   it from the archive.
// It handles all the backend logistics for your dream journal entries.

import { createClient } from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/supabase/admin";
import { NextResponse, NextRequest } from "next/server";
import crypto from 'crypto';
import { dreamEntryCreateSchema } from "@/schema/dreamEntry";

const DEBUG = process.env.NODE_ENV === 'development';

// Extend Vercel function timeout to 60s (requires Pro plan; Hobby is capped at 10s).
// The OpenAI call alone takes 5–15s, so this is required for analysis to complete.
export const maxDuration = 60;

import { POST as openAiHandler } from "@/app/api/openai-analysis/route";

// Simple in-memory analysis cache (LRU-style with TTL)
const analysisCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL_MS = 3600000; // 1 hour
const MAX_CACHE_SIZE = 100;

function getAnalysisCacheKey(dreamText: string, readingLevel?: string): string {
  return crypto.createHash('sha256').update(`${dreamText}:${readingLevel || 'default'}`).digest('hex');
}

export async function GET(request: Request) {
  const supabase = await createClient();
  
  try {
    // Get dream ID from URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Dream ID is required" },
        { status: 400 }
      );
    }
    
    // Get the dream entry
    const { data, error } = await supabase
      .from("dream_entries")
      .select("*")
      .eq("id", id);
      
    if (error) {
      console.error("Error fetching dream:", error);
      return NextResponse.json(
        { error: "Dream not found" },
        { status: 404 }
      );
    }
    
    // Return the dream in the expected format for the client
    return NextResponse.json({
      dreams: data || []
    });
  } catch (error) {
    console.error("Error processing GET request:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized: You must be logged in to delete a dream" },
      { status: 401 }
    );
  }
  
  try {
    // Get dream ID from URL
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: "Dream ID is required" },
        { status: 400 }
      );
    }
    
    // Verify ownership before deleting
    const { data: dream, error: fetchError } = await supabase
      .from("dream_entries")
      .select("user_id")
      .eq("id", id)
      .single();
      
    if (fetchError) {
      console.error("Error fetching dream:", fetchError);
      return NextResponse.json(
        { error: "Dream not found" },
        { status: 404 }
      );
    }
    
    // Check if the user owns this dream
    if (dream.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized: You can only delete your own dreams" },
        { status: 403 }
      );
    }
    
    // Delete related records in parallel (independent of each other)
    await Promise.all([
      supabase.from("bible_citations").delete().eq("dream_entry_id", id),
      supabase.from("chatgpt_interactions").delete().eq("dream_entry_id", id),
    ]);

    // Then delete the dream entry (depends on above due to FK constraints)
    const { error: deleteError } = await supabase
      .from("dream_entries")
      .delete()
      .eq("id", id);
      
    if (deleteError) {
      console.error("Error deleting dream:", deleteError);
      return NextResponse.json(
        { error: "Failed to delete dream" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: "Dream deleted successfully"
    });
  } catch (error) {
    console.error("Error processing delete request:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (DEBUG) console.log("API: Dream entry - POST request received");

  const supabase = await createClient();

  // Get current user with more detailed logging
  if (DEBUG) console.log("API: Dream entry - Checking authentication");
  const { data, error: authError } = await supabase.auth.getUser();
  const user = data?.user;

  if (DEBUG) console.log("API: Dream entry - Auth result:", user ? "User authenticated" : "No user found");
  if (DEBUG && user) {
    console.log("API: Dream entry - User ID:", user.id);
  }

  if (authError) {
    console.error("API: Dream entry - Auth error:", authError.message);
    return NextResponse.json(
      { error: `Unauthorized: Authentication error (${authError.message})` },
      { status: 401 }
    );
  }

  if (!user) {
    console.error("API: Dream entry - No user in session");

    // Also check session to see if there's more info
    const { data: sessionData } = await supabase.auth.getSession();
    if (DEBUG) console.log("API: Dream entry - Session check:", sessionData?.session ? "Has session" : "No session");
    
    return NextResponse.json(
      { error: "Unauthorized: You must be logged in to submit a dream" },
      { status: 401 }
    );
  }
  
  try {
    // Parse and validate request body with Zod
    const body = await request.json();
    const parsed = dreamEntryCreateSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { dream_text, reading_level } = parsed.data;
    
    // Generate a title - improve handling for short inputs
    let title: string;
    
    if (dream_text.length <= 10) {
      // For very short inputs, create a descriptive title
      title = `Dream: ${dream_text}`;
    } else if (dream_text.length <= 50) {
      // For medium length, use the full text as title
      title = dream_text;
    } else {
      // For long text, truncate at a word boundary if possible
      const truncated = dream_text.substring(0, 50);
      const lastSpace = truncated.lastIndexOf(' ');
      if (lastSpace > 30) {
        title = truncated.substring(0, lastSpace) + "...";
      } else {
        title = truncated + "...";
      }
    }
    
    // Insert dream into database using admin client to bypass RLS.
    // Auth is already verified above via getUser(), and the regular
    // server client can fail if the session cookie JWT isn't properly
    // forwarded to the database RLS context.
    const adminSupabaseForInsert = getAdminClient();
    const { data: dreamData, error: dreamInsertError } = await adminSupabaseForInsert
      .from("dream_entries")
      .insert({
        user_id: user.id,
        original_text: dream_text,
        title
      })
      .select()
      .single();
    
    if (DEBUG) console.log("Dream insert response:", { data: dreamData, error: dreamInsertError });

    if (dreamInsertError) {
      console.error("Error saving dream:", dreamInsertError);
      
      // Return detailed error for debugging
      return NextResponse.json(
        { 
          error: "Failed to save dream entry", 
          details: dreamInsertError,
          request: {
            user_id: user.id,
            title: title,
            text_length: dream_text.length
          }
        },
        { status: 500 }
      );
    }

    // Begin analysis in background - ensure ID exists
    if (!dreamData || !dreamData.id) {
      console.error("Dream saved but no ID returned");
      return NextResponse.json(
        { error: "Dream saved but no ID was returned" },
        { status: 500 }
      );
    }
    
    const dreamId = dreamData.id;

    // ── Synchronous analysis ────────────────────────────────
    // Run the OpenAI analysis inline so the response includes
    // the full result.  This avoids the after() timeout problem
    // on Vercel Hobby (10 s cap).  A single OpenAI call typically
    // finishes in 3-8 s.
    // ────────────────────────────────────────────────────────

    // Admin client for DB writes (bypasses RLS) — singleton
    const adminSupabase = getAdminClient();

    let analysisResult: any = null;

    try {
      // ── 0. Check analysis cache ──────────────────────────────
      const cacheKey = getAnalysisCacheKey(dream_text, reading_level);
      const cached = analysisCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        if (DEBUG) console.log('✅ Analysis cache hit');
        analysisResult = cached.result;
      } else {
        // ── 1. Call OpenAI (single call) ──────────────────────
        const analysisRequest = new NextRequest(
          "http://internal-routing/api/openai-analysis",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              dream: dream_text,
              topic: "dream interpretation",
              readingLevel: reading_level || undefined,
            }),
          }
        );

        const analysisResponse = await openAiHandler(analysisRequest);

        if (!analysisResponse.ok) {
          throw new Error(`OpenAI returned ${analysisResponse.status}`);
        }

        analysisResult = JSON.parse(await analysisResponse.text());
        if (DEBUG) console.log("✅ Analysis complete:", Object.keys(analysisResult).join(", "));

        // ── Store in cache ──────────────────────────────────────
        // Evict oldest if at capacity
        if (analysisCache.size >= MAX_CACHE_SIZE) {
          const oldestKey = analysisCache.keys().next().value;
          if (oldestKey) analysisCache.delete(oldestKey);
        }
        analysisCache.set(cacheKey, { result: analysisResult, timestamp: Date.now() });
      }

      // ── 2. Build the DB update payload ────────────────────
      const {
        analysis,
        topicSentence,
        supportingPoints = [],
        conclusionSentence,
        personalizedSummary,
        dreamTitle,
        biblicalReferences = [],
        tags = [],
      } = analysisResult;

      const formattedAnalysis =
        analysis ||
        `${topicSentence} ${supportingPoints.join(" ")} ${conclusionSentence}`;
      const dreamSummary = analysis
        ? analysis.split(".").slice(0, 2).join(".") + "."
        : "";

      const bibleRefs = biblicalReferences
        .filter((r: any) => r?.citation)
        .map((r: any) => r.citation.trim());

      const updateData: any = {
        dream_summary: dreamSummary,
        analysis_summary: analysis,
        topic_sentence: topicSentence,
        supporting_points: supportingPoints,
        conclusion_sentence: conclusionSentence,
        formatted_analysis: formattedAnalysis,
        personalized_summary: personalizedSummary || null,
        tags: tags.length > 0 ? tags : ["spiritual insight", "dream analysis"],
        bible_refs: bibleRefs,
        raw_analysis: analysisResult,
      };

      if (dreamTitle?.trim()) {
        updateData.title = dreamTitle;
      }

      // ── 3-5. Run DB operations in parallel ────────────────
      // Prepare bible citations data upfront for parallel execution
      const citations = biblicalReferences.length > 0
        ? biblicalReferences
            .map((ref: any, index: number) => {
              if (!ref?.citation || !ref?.book || !ref?.chapter || !ref?.verse) return null;
              return {
                dream_entry_id: dreamId,
                bible_book: ref.book.trim(),
                chapter: ref.chapter,
                verse: ref.verse,
                end_verse: ref.endVerse || null,
                full_text: ref.verseText || `Verse text not available`,
                citation_order: index + 1,
              };
            })
            .filter(Boolean)
        : [];

      // Execute all three DB operations in parallel
      const results = await Promise.all([
        // 1. Update dream_entries with analysis data
        adminSupabase
          .from("dream_entries")
          .update(updateData)
          .eq("id", dreamId)
          .then(({ error: updateError }) => {
            if (updateError) {
              console.error("Error updating dream with analysis:", updateError);
            }
            return { success: !updateError, error: updateError };
          }),

        // 2. Insert into chatgpt_interactions
        adminSupabase
          .from("chatgpt_interactions")
          .insert({
            dream_entry_id: dreamId,
            prompt: `Analyze dream: ${dream_text}`,
            response: JSON.stringify(analysisResult),
            model: "gpt-4o-mini",
            temperature: 0.7,
          })
          .then(({ error: chatgptError }) => {
            if (chatgptError) {
              console.error("Error storing ChatGPT interaction:", chatgptError);
            }
            return { success: !chatgptError, error: chatgptError };
          }),

        // 3. Insert into bible_citations (if there are citations)
        citations.length > 0
          ? adminSupabase
              .from("bible_citations")
              .insert(citations)
              .then(({ error: bibleError }) => {
                if (bibleError) {
                  console.error("Error saving Bible citations:", bibleError);
                }
                return { success: !bibleError, error: bibleError };
              })
          : Promise.resolve({ success: true, error: null }),
      ]);

      // Log results (all operations attempted, errors logged individually above)
      const operationNames = [
        "dream_entries update",
        "chatgpt_interactions insert",
        "bible_citations insert",
      ];
      results.forEach((result, index) => {
        if (result.success) {
          if (DEBUG) console.log(`✅ ${operationNames[index]} succeeded`);
        } else {
          console.warn(`⚠️ ${operationNames[index]} failed: ${result.error?.message}`);
        }
      });

      // ── 6. Image gen is triggered client-side via /api/dream-image ─
      // (after() was killed by Vercel Hobby 10s timeout, so the client
      //  fires a separate request to /api/dream-image instead)
    } catch (analysisError) {
      console.error("Analysis failed:", analysisError);
      // Mark the dream so the UI knows analysis failed
      await adminSupabase
        .from("dream_entries")
        .update({
          dream_summary: "Analysis could not be completed at this time.",
        })
        .eq("id", dreamId);
    }

    // Return dream ID + analysis result so the client can render immediately
    return NextResponse.json({
      success: true,
      message: analysisResult
        ? "Dream recorded and analyzed"
        : "Dream recorded but analysis failed",
      id: dreamId,
      analysis: analysisResult,
    });
    
  } catch (error) {
    console.error("Error processing dream submission:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
