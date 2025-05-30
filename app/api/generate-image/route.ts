import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/utils/supabase/server";

export const runtime = "edge";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    console.log("🎨 Image generation API: Request received");
    
    const { dreamId, dreamContent, title } = await request.json();
    
    if (!dreamId || !dreamContent) {
      return NextResponse.json({ error: "Dream ID and content are required" }, { status: 400 });
    }

    // Create a prompt for image generation based on the dream content
    const imagePrompt = `Create a beautiful, artistic representation of this dream: "${dreamContent}". Style: dreamy, surreal, spiritual, with soft colors and ethereal lighting. Avoid text or words in the image.`;

    console.log(`🎨 Generating image for dream: ${dreamId}`);
    console.log(`🎨 Prompt: ${imagePrompt.substring(0, 100)}...`);

    // Get user ID for the request
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Generate image using the corrected OpenAI API format
    const response = await openai.images.generate({
      model: "gpt-image-1",
      prompt: imagePrompt.trim(),
      n: 1,
      size: "1024x1024",
      user: `user-${user.id}`
    });

    if (!response.data || response.data.length === 0) {
      console.error("❌ No image data received from OpenAI");
      return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
    }

    const imageUrl = response.data[0].url;
    console.log(`🎨 Image generated successfully: ${imageUrl}`);

    // Update the dream entry with the generated image URL
    
    const { error: updateError } = await supabase
      .from('dream_entries')
      .update({ image_url: imageUrl })
      .eq('id', dreamId);

    if (updateError) {
      console.error("❌ Error updating dream with image URL:", updateError);
      return NextResponse.json({ error: "Failed to save image URL" }, { status: 500 });
    }

    console.log(`🎨 Dream entry updated with image URL`);

    return NextResponse.json({
      success: true,
      imageUrl: imageUrl,
      dreamId: dreamId
    });

  } catch (error) {
    console.error("❌ Error in image generation API:", error);
    return NextResponse.json({ 
      error: "Failed to generate image", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}