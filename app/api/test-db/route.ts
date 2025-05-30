import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  try {
    // Fetch the most recent Bible citations
    const { data: citations, error: citationsError } = await supabase
      .from("bible_citations")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (citationsError) {
      console.error("Error fetching citations:", citationsError);
      return NextResponse.json({ error: "Failed to fetch Bible citations" }, { status: 500 });
    }

    // Fetch the most recent dream entries
    const { data: dreams, error: dreamsError } = await supabase
      .from("dream_entries")
      .select("id, bible_refs, created_at")
      .order("created_at", { ascending: false })
      .limit(5);

    if (dreamsError) {
      console.error("Error fetching dreams:", dreamsError);
      return NextResponse.json({ error: "Failed to fetch dreams" }, { status: 500 });
    }

    return NextResponse.json({
      citations,
      dreams
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}