"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TestDBPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/test-db");
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="container max-w-4xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Database Test Page</h1>
      
      <Button onClick={fetchData} disabled={isLoading} className="mb-6">
        {isLoading ? "Loading..." : "Refresh Data"}
      </Button>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {data && (
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Recent Bible Citations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Reference</th>
                      <th className="px-4 py-2 text-left">Full Text</th>
                      <th className="px-4 py-2 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.citations.map((citation: any) => (
                      <tr key={citation.id} className="border-b">
                        <td className="px-4 py-2">
                          {citation.bible_book} {citation.chapter}:{citation.verse}
                        </td>
                        <td className="px-4 py-2">{citation.full_text}</td>
                        <td className="px-4 py-2">
                          {new Date(citation.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Dreams with Bible References</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-2 text-left">Dream ID</th>
                      <th className="px-4 py-2 text-left">Bible References</th>
                      <th className="px-4 py-2 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.dreams.map((dream: any) => (
                      <tr key={dream.id} className="border-b">
                        <td className="px-4 py-2">{dream.id}</td>
                        <td className="px-4 py-2">
                          {dream.bible_refs ? dream.bible_refs.join(", ") : "None"}
                        </td>
                        <td className="px-4 py-2">
                          {new Date(dream.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}