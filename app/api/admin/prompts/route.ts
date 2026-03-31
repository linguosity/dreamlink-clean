import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/supabase/admin";
import { promptCreateSchema, promptRevertSchema } from "@/schema/adminPrompts";

// ---------- helpers ----------

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }), user: null };
  }

  const { data: profile } = await supabase
    .from("profile")
    .select("is_admin")
    .eq("user_id", user.id)
    .single();

  if (!profile?.is_admin) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }), user: null };
  }

  return { error: null, user };
}

// ---------- GET — fetch active prompt + version history ----------

export async function GET() {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const admin = getAdminClient();

  // Active prompt
  const { data: active, error: activeErr } = await admin
    .from("dream_prompts")
    .select("*")
    .eq("is_active", true)
    .single();

  if (activeErr) {
    console.error("Error fetching active prompt:", activeErr);
    return NextResponse.json({ error: "Failed to fetch active prompt" }, { status: 500 });
  }

  // Version history (most recent first, limit 20)
  const { data: history, error: historyErr } = await admin
    .from("dream_prompts")
    .select("id, version, notes, created_at, is_active")
    .order("version", { ascending: false })
    .limit(20);

  if (historyErr) {
    console.error("Error fetching prompt history:", historyErr);
  }

  return NextResponse.json({ active, history: history || [] });
}

// ---------- POST �$ save a new prompt version ----------

export async function POST(request: Request) {
  const { error: authError, user } = await requireAdmin();
  if (authError) return authError;

  const body = await request.json();
  const parsed = promptCreateSchema.safeParse(body);

  if (!parsed.success) {
    const firstError = parsed.error.errors[0]?.message || "Invalid input";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const {
    system_message,
    main_instructions,
    format_instructions,
    forbidden_phrases,
    reading_level_radiant_clarity,
    reading_level_celestial_insight,
    reading_level_prophetic_wisdom,
    reading_level_divine_revelation,
    notes,
  } = parsed.data;

  const admin = getAdminClient();

  // Get the latest version number
  const { data: latest } = await admin
    .from("dream_prompts")
    .select("version")
    .order("version", { ascending: false })
    .limit(1)
    .single();

  const nextVersion = (latest?.version || 0) + 1;

  // Deactivate current active prompt
  await admin
    .from("dream_prompts")
    .update({ is_active: false })
    .eq("is_active", true);

  // Insert new version as active
  const { data: newPrompt, error: insertErr } = await admin
    .from("dream_prompts")
    .insert({
      version: nextVersion,
      is_active: true,
      system_message,
      main_instructions,
      format_instructions,
      forbidden_phrases: forbidden_phrases || [],
      reading_level_radiant_clarity: reading_level_radiant_clarity || "",
      reading_level_celestial_insight: reading_level_celestial_insight || "",
      reading_level_prophetic_wisdom: reading_level_prophetic_wisdom || "",
      reading_level_divine_revelation: reading_level_divine_revelation || "",
      created_by: user!.id,
      notes: notes || `Version ${nextVersion}`,
    })
    .select()
    .single();

  if (insertErr) {
    console.error("Error saving prompt:", insertErr);
    return NextResponse.json({ error: "Failed to save prompt" }, { status: 500 });
  }

  return NextResponse.json({ prompt: newPrompt });
}

// ---------- PUT — revert to a specific version ----------

export async function PUT(request: Request) {
  const { error: authError } = await requireAdmin();
  if (authError) return authError;

  const putBody = await request.json();
  const putParsed = promptRevertSchema.safeParse(putBody);

  if (!putParsed.success) {
    const firstError = putParsed.error.errors[0]?.message || "Invalid input";
    return NextResponse.json({ error: firstError }, { status: 400 });
  }

  const { version_id } = putParsed.data;

  const admin = getAdminClient();

  // Deactivate current
  await admin
    .from("dream_prompts")
    .update({ is_active: false })
    .eq("is_active", true);

  // Activate selected version
  const { data: activated, error: activateErr } = await admin
    .from("dream_prompts")
    .update({ is_active: true })
    .eq("id", version_id)
    .select()
    .single();

  if (activateErr) {
    console.error("Error reverting prompt:", activateErr);
    return NextResponse.json({ error: "Failed to revert prompt" }, { status: 500 });
  }

  return NextResponse.json({ prompt: activated });
}
