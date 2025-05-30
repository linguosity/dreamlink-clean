import { createClient } from "@/utils/supabase/server";
import { NextResponse, NextRequest } from "next/server";
import { FeatureFlag, isFeatureEnabled } from "@/utils/feature-flags";

/**
 * API route for searching dream entries
 * This is a stub for future implementation of server-side search
 */
export async function GET(request: NextRequest) {
  // Get the Supabase client
  const supabase = await createClient();
  
  // Check if server search is enabled
  const isServerSearchEnabled = process.env.NEXT_PUBLIC_FEATURE_SERVER_SEARCH === 'true';
  
  if (!isServerSearchEnabled) {
    return NextResponse.json(
      { error: "Server-side search is not enabled" },
      { status: 404 }
    );
  }
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return NextResponse.json(
      { error: "Unauthorized: You must be logged in to search dreams" },
      { status: 401 }
    );
  }
  
  try {
    // Get search parameters
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const cursor = url.searchParams.get('cursor') || undefined;
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    
    // If no query, return an error
    if (!query) {
      return NextResponse.json(
        { error: "Query parameter 'q' is required" },
        { status: 400 }
      );
    }
    
    // Define the base query
    let dreamQuery = supabase
      .from("dream_entries")
      .select("*")
      .eq("user_id", user.id)
      // When we implement full-text search, we'll use this:
      // .textSearch('search_vector', query, { type: 'websearch' })
      // For now, use a simple ILIKE query
      .or(`original_text.ilike.%${query}%, title.ilike.%${query}%, dream_summary.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    // Add cursor pagination if provided
    if (cursor) {
      dreamQuery = dreamQuery.gt('id', cursor);
    }
    
    // Execute the query
    const { data: dreams, error } = await dreamQuery;
    
    // Handle errors
    if (error) {
      console.error("Error searching dreams:", error);
      return NextResponse.json(
        { error: "Failed to search dreams" },
        { status: 500 }
      );
    }
    
    // Return the search results
    return NextResponse.json({
      results: dreams || [],
      nextCursor: dreams && dreams.length === limit ? dreams[dreams.length - 1].id : null
    });
    
  } catch (error) {
    console.error("Error processing search request:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}