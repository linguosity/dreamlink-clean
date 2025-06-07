import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const BFL_API_URL = "https://api.us1.bfl.ai/v1/flux-pro-1.1";
const BFL_API_KEY = process.env.BFL_API_KEY;

export async function POST(request: NextRequest) {
  try {
    console.log("🎨 Image generation API: Request received");
    
    // Check if API key is configured
    if (!BFL_API_KEY) {
      return NextResponse.json(
        { error: "Image generation service not configured" },
        { status: 503 }
      );
    }

    // Get user and check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // TODO: Re-enable subscription check after testing
    /*
    // Check user's subscription tier
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_tier')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      return NextResponse.json(
        { error: "Failed to verify subscription" },
        { status: 500 }
      );
    }

    // Check if user has access to image generation
    const subscriptionTier = profile?.subscription_tier || 'free';
    if (subscriptionTier === 'free') {
      return NextResponse.json(
        { error: "Image generation is available for paid subscribers only" },
        { status: 403 }
      );
    }
    */

    // Get request body
    const body = await request.json();
    const { dreamId, dreamContent, title, width = 1024, height = 768 } = body;

    if (!dreamId || !dreamContent) {
      return NextResponse.json(
        { error: "Dream ID and content are required" },
        { status: 400 }
      );
    }

    // Create a prompt for image generation based on the dream content
    const imagePrompt = `${dreamContent} in the style of a sketched minimalist graphic illustration, flat vector image, simple thin line drawing`;

    console.log(`🎨 Generating image for dream: ${dreamId}`);
    console.log(`🎨 Prompt: ${imagePrompt.substring(0, 100)}...`);

    // Make request to BlackForestLab API
    const bflResponse = await fetch(BFL_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Key': BFL_API_KEY
      },
      body: JSON.stringify({
        prompt: imagePrompt.trim(),
        width,
        height,
        prompt_upsampling: true,
        safety_tolerance: 2,
        output_format: 'jpeg'
      })
    });

    if (!bflResponse.ok) {
      const error = await bflResponse.text();
      console.error("BFL API error:", error);
      return NextResponse.json(
        { error: "Failed to generate image" },
        { status: bflResponse.status }
      );
    }

    const result = await bflResponse.json();
    console.log("🎨 BFL API response:", result);

    // TODO: Uncomment after creating image_generations table
    /*
    // Store the generation request in database
    const { data: generation, error: insertError } = await supabase
      .from('image_generations')
      .insert({
        user_id: user.id,
        dream_id: dreamId,
        prompt: imagePrompt,
        status: 'pending',
        request_id: result.id,
        polling_url: result.polling_url || `https://api.us1.bfl.ai/v1/get_result?id=${result.id}`
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error storing generation request:", insertError);
    }
    */

    return NextResponse.json({
      success: true,
      requestId: result.id,
      pollingUrl: result.polling_url || `/api/generate-image/status?id=${result.id}`,
      dreamId: dreamId
    });
  } catch (error) {
    console.error("❌ Error in image generation API:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate image", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}

// Polling endpoint to check image generation status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('id');
    
    if (!requestId) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!BFL_API_KEY) {
      return NextResponse.json(
        { error: "Image generation service not configured" },
        { status: 503 }
      );
    }

    // Get user and check authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Poll the BFL API for status
    const pollingUrl = `https://api.us1.bfl.ai/v1/get_result?id=${requestId}`;
    const bflResponse = await fetch(pollingUrl, {
      headers: {
        'X-Key': BFL_API_KEY
      }
    });

    if (!bflResponse.ok) {
      const error = await bflResponse.text();
      console.error("BFL polling error:", error);
      return NextResponse.json(
        { error: "Failed to check image status" },
        { status: bflResponse.status }
      );
    }

    const result = await bflResponse.json();
    console.log("🎨 Polling result:", JSON.stringify(result, null, 2));
    
    // If the image is ready and we have a result (check both cases)
    if ((result.status === 'ready' || result.status === 'Ready') && result.result && result.result.sample) {
      const imageUrl = result.result.sample;
      
      // Update the dream entry with the generated image URL
      const { error: updateError } = await supabase
        .from('dream_entries')
        .update({ image_url: imageUrl })
        .eq('id', searchParams.get('dreamId'));

      if (updateError) {
        console.error("Error updating dream with image URL:", updateError);
      }

      // TODO: Uncomment after creating image_generations table
      /*
      // Update the image generation record
      await supabase
        .from('image_generations')
        .update({ 
          status: 'completed',
          image_url: imageUrl 
        })
        .eq('request_id', requestId);
      */
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Polling error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}