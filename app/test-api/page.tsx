// Test page to debug authentication/session timing issues
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createClient } from '@/utils/supabase/client';

export default function TestAPIPage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (test: string, result: any) => {
    setResults(prev => [...prev, {
      timestamp: new Date().toISOString(),
      test,
      result: typeof result === 'object' ? JSON.stringify(result, null, 2) : result
    }]);
  };

  const clearResults = () => setResults([]);

  const testClientAuth = async () => {
    try {
      const supabase = createClient();
      const { data: user, error } = await supabase.auth.getUser();
      const { data: session } = await supabase.auth.getSession();
      
      addResult('Client Auth Check', {
        success: !error,
        userId: user?.user?.id || 'none',
        hasSession: !!session?.session,
        sessionUserId: session?.session?.user?.id || 'none',
        error: error?.message || 'none'
      });
    } catch (err) {
      addResult('Client Auth Check', { error: String(err) });
    }
  };

  const testServerAuth = async () => {
    try {
      const response = await fetch('/api/debug', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      addResult('Server Auth Check', {
        status: response.status,
        ...data
      });
    } catch (err) {
      addResult('Server Auth Check', { error: String(err) });
    }
  };

  const testDreamSubmission = async () => {
    try {
      const testDream = `Test dream ${Date.now()}`;
      const response = await fetch('/api/dream-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dream_text: testDream
        })
      });
      
      const data = await response.json();
      addResult('Dream Submission Test', {
        status: response.status,
        success: response.ok,
        ...data
      });
    } catch (err) {
      addResult('Dream Submission Test', { error: String(err) });
    }
  };

  const testLoginFlowSimulation = async () => {
    setIsLoading(true);
    clearResults();
    
    addResult('Login Flow Simulation', 'Simulating post-login dream submission...');
    
    // Rapid succession to test timing issues (similar to post-login behavior)
    await testClientAuth();
    await testServerAuth();
    await testDreamSubmission();
    
    // Wait 1 second then try again (simulating user's second attempt)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    addResult('Second Attempt', 'Trying dream submission again after 1 second...');
    await testDreamSubmission();
    
    setIsLoading(false);
  };

  const runFullTest = async () => {
    setIsLoading(true);
    clearResults();

    // Test sequence with delays to see timing issues
    await testClientAuth();
    await new Promise(resolve => setTimeout(resolve, 200));
    
    await testServerAuth();
    await new Promise(resolve => setTimeout(resolve, 200));
    
    await testDreamSubmission();
    
    setIsLoading(false);
  };

  // Original test functions kept for backward compatibility
  const testOpenAI = async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/test-dream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dream_text: 'I dreamed about flying over mountains' })
      });
      
      const data = await response.json();
      addResult('OpenAI API Test', data);
    } catch (error) {
      addResult('OpenAI API Test', { error: 'Failed to call API', details: String(error) });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Authentication & Timing Debugger</CardTitle>
          <p className="text-sm text-muted-foreground">
            This tool helps debug the authentication timing issue where the first dream submission fails but the second succeeds.
            <br />
            <strong>Instructions:</strong> After logging in, immediately come to this page and run "Login Flow Simulation" to reproduce the issue.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            <Button onClick={testClientAuth} disabled={isLoading} size="sm">
              Test Client Auth
            </Button>
            <Button onClick={testServerAuth} disabled={isLoading} size="sm">
              Test Server Auth
            </Button>
            <Button onClick={testDreamSubmission} disabled={isLoading} size="sm">
              Test Dream API
            </Button>
            <Button onClick={testOpenAI} disabled={isLoading} size="sm" variant="outline">
              Test OpenAI API
            </Button>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Button onClick={runFullTest} disabled={isLoading} variant="outline">
              Run Sequential Test
            </Button>
            <Button onClick={testLoginFlowSimulation} disabled={isLoading} variant="default">
              🔍 Login Flow Simulation
            </Button>
            <Button onClick={clearResults} disabled={isLoading} variant="ghost" size="sm">
              Clear Results
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Test Results</h3>
              <div className="max-h-96 overflow-y-auto space-y-2">
                {results.length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    No results yet. Run a test to see authentication flow details.
                  </p>
                ) : (
                  results.map((result, index) => (
                    <Card key={index} className="text-xs">
                      <CardContent className="p-3">
                        <div className="font-mono">
                          <div className="text-blue-600 font-semibold text-xs">
                            [{new Date(result.timestamp).toLocaleTimeString()}] {result.test}
                          </div>
                          <pre className="mt-1 whitespace-pre-wrap text-gray-700 text-xs max-h-32 overflow-y-auto">
                            {result.result}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-sm">Expected Issue Pattern</h3>
              <Card>
                <CardContent className="p-3 text-xs space-y-2">
                  <div><strong>Expected behavior after fresh login:</strong></div>
                  <div>✅ Client Auth: Should show user ID</div>
                  <div>❌ Server Auth: May fail or show "no user"</div>
                  <div>❌ First Dream Submission: Returns 401 Unauthorized</div>
                  <div>✅ Second Dream Submission: Works correctly</div>
                  
                  <div className="mt-3 pt-2 border-t">
                    <strong>Possible causes:</strong>
                    <ul className="ml-4 list-disc text-xs space-y-1">
                      <li>Session cookies not propagated to server</li>
                      <li>Supabase client cache not synchronized</li>
                      <li>Middleware not updating auth state</li>
                      <li>Race condition in auth flow</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}