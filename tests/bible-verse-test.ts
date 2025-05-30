// Simple test script to verify Bible verse handling
// You can run this with: npx ts-node tests/bible-verse-test.ts

import { POST as openAiHandler } from "../app/api/openai-analysis/route";

async function testBibleVerseHandling() {
  // Sample dream text
  const dreamText = "I was walking beside a clear river on a sunlit path. The water was sparkling and I felt peaceful as the light guided my way. There was a mountain in the distance and I felt drawn to it.";

  console.log("Testing Bible verse handling with sample dream...");
  
  // Create a mock request
  const mockRequest = new Request("http://localhost:3000/api/openai-analysis", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      dream: dreamText,
      topic: "dream interpretation",
    }),
  });

  try {
    // Call the OpenAI handler directly
    const response = await openAiHandler(mockRequest);
    
    if (!response.ok) {
      console.error("Error response from OpenAI handler:", response.status);
      const errorText = await response.text();
      console.error("Error details:", errorText);
      return;
    }

    // Parse the response
    const responseData = await response.json();
    
    console.log("\n--- OpenAI RESPONSE ---");
    console.log("Topic Sentence:", responseData.topicSentence);
    console.log("\nSupporting Points:");
    responseData.supportingPoints.forEach((point: string, index: number) => {
      console.log(`  ${index + 1}. ${point}`);
    });
    console.log("\nConclusion:", responseData.conclusionSentence);
    
    console.log("\n--- BIBLE REFERENCES ---");
    if (responseData.biblicalReferences && responseData.biblicalReferences.length > 0) {
      responseData.biblicalReferences.forEach((ref: any, index: number) => {
        console.log(`Reference ${index + 1}:`);
        console.log(`  Citation: ${ref.citation}`);
        console.log(`  Verse Text: ${ref.verseText}`);
        console.log("");
      });
    } else {
      console.log("No biblical references with verse text found in the response!");
      console.log("Raw response keys:", Object.keys(responseData));
      
      // Extract references from supporting points as fallback
      const extractedRefs = responseData.supportingPoints
        .map((point: string) => {
          const match = point.match(/\(([^)]+)\)/);
          return match ? match[1] : null;
        })
        .filter(Boolean);
      
      console.log("References extracted from supporting points:", extractedRefs);
    }
    
    console.log("\nTest completed successfully!");
  } catch (error) {
    console.error("Error testing Bible verse handling:", error);
  }
}

// Run the test
testBibleVerseHandling();