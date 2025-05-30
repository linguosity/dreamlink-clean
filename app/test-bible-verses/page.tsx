"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestBibleVersesPage() {
  const [dreamText, setDreamText] = useState("I was walking beside a clear river on a sunlit path. The water was sparkling and I felt peaceful as the light guided my way. There was a mountain in the distance and I felt drawn to it.");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Call OpenAI directly to test verse handling
      const openaiResponse = await fetch("/api/openai-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          dream: dreamText,
          topic: "dream interpretation"
        })
      });

      if (!openaiResponse.ok) {
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const data = await openaiResponse.json();
      setResponse(data);
    } catch (err) {
      console.error("Error testing Bible verses:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Test Bible Verse Handling</h1>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Dream Text</label>
        <Textarea 
          value={dreamText}
          onChange={(e) => setDreamText(e.target.value)}
          className="min-h-[150px]"
          placeholder="Enter a dream description..."
        />
      </div>
      
      <Button 
        onClick={handleSubmit}
        disabled={isSubmitting || !dreamText.trim()}
        className="mb-8"
      >
        {isSubmitting ? "Analyzing..." : "Test Bible Verse Handling"}
      </Button>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {response && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>OpenAI Response</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="font-semibold mb-2">Topic Sentence:</h3>
              <p className="mb-4">{response.topicSentence}</p>
              
              <h3 className="font-semibold mb-2">Supporting Points:</h3>
              <ul className="list-disc pl-6 mb-4">
                {response.supportingPoints?.map((point: string, i: number) => (
                  <li key={i}>{point}</li>
                ))}
              </ul>
              
              <h3 className="font-semibold mb-2">Conclusion:</h3>
              <p>{response.conclusionSentence}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Bible References with Verse Text</CardTitle>
            </CardHeader>
            <CardContent>
              {response.biblicalReferences && response.biblicalReferences.length > 0 ? (
                <ul className="space-y-4">
                  {response.biblicalReferences.map((ref: any, index: number) => (
                    <li key={index} className="border-b pb-2">
                      <div className="font-semibold">{ref.citation}</div>
                      <div className="text-sm italic">"{ref.verseText}"</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No biblical references with verse text found in the response.</p>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Raw Response Data</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-xs">
                {JSON.stringify(response, null, 2)}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}