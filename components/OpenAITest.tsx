'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export function OpenAITest() {
  const [dream, setDream] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testOpenAI = async () => {
    if (!dream.trim()) {
      setError('Please enter a dream to analyze');
      return;
    }

    console.log("🔍 Starting OpenAI test with dream text:", dream.substring(0, 50) + "...");
    setLoading(true);
    setError('');
    
    try {
      console.log("🔍 Sending request to Edge Function API");
      const startTime = Date.now();
      
      const response = await fetch('/api/openai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dream }),
      });

      const elapsedTime = Date.now() - startTime;
      console.log(`✅ API response received in ${elapsedTime}ms with status: ${response.status}`);

      if (!response.ok) {
        console.error(`❌ API error with status ${response.status}`);
        const errorData = await response.json();
        console.error("❌ Error details:", errorData);
        throw new Error(errorData.error || 'Failed to analyze dream');
      }

      console.log("🔍 Parsing JSON response");
      const data = await response.json();
      console.log("✅ Response parsed successfully:", data);
      
      setResult(data);
      console.log("✅ UI updated with analysis result");
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error('❌ Error testing OpenAI:', err);
      setError(err.message || 'Failed to analyze dream');
    } finally {
      setLoading(false);
      console.log("✅ Test operation completed");
    }
  };

  return (
    <div className="space-y-4 p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold">Test OpenAI Edge Function</h2>
      
      <Textarea
        placeholder="Enter a dream to analyze..."
        value={dream}
        onChange={(e) => setDream(e.target.value)}
        className="min-h-32"
      />
      
      <Button 
        onClick={testOpenAI}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Analyzing...' : 'Analyze Dream'}
      </Button>
      
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <h3 className="text-red-700 font-bold">Error:</h3>
          <p className="text-red-600">{error}</p>
        </Card>
      )}
      
      {result && (
        <div className="space-y-4">
          <Card className="p-4 space-y-3">
            <h3 className="font-bold">Topic Sentence:</h3>
            <p>{result.topicSentence}</p>
            
            <h3 className="font-bold">Supporting Points:</h3>
            <ul className="list-disc pl-6">
              {result.supportingPoints?.map((point: string, i: number) => (
                <li key={i}>{point}</li>
              ))}
            </ul>
            
            <h3 className="font-bold">Conclusion:</h3>
            <p>{result.conclusionSentence}</p>
            
            <div className="pt-2 border-t">
              <h3 className="font-bold">Full Analysis:</h3>
              <p className="whitespace-pre-wrap">{result.analysis}</p>
            </div>
          </Card>
          
          <details className="border p-2 rounded">
            <summary className="font-semibold cursor-pointer">Debug Information</summary>
            <div className="mt-2 p-2 bg-gray-100 rounded overflow-auto max-h-60">
              <h4 className="font-mono text-xs mb-1">Raw Response Object:</h4>
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}
    </div>
  );
}