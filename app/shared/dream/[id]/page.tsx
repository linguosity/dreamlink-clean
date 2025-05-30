'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamic import to avoid SSR errors
const SocialShare = dynamic(() => import('@/components/SocialShare'), { ssr: false });

export default function SharedDreamPage() {
  const params = useParams();
  const dreamId = params.id as string;
  const [dream, setDream] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dream data
    const fetchDream = async () => {
      try {
        const response = await fetch(`/api/dream-entries?id=${dreamId}`, {
          method: 'GET',
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch dream');
        }
        
        const data = await response.json();
        setDream(data);
      } catch (error) {
        console.error('Error fetching dream:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDream();
  }, [dreamId]);

  if (loading) {
    return (
      <div className="container py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Loading dream...</h1>
        </div>
      </div>
    );
  }

  if (!dream) {
    return (
      <div className="container py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Dream not found</h1>
          <p>Sorry, we couldn't find the dream you're looking for.</p>
          <Link href="/">
            <Button className="mt-4">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  const getShareableText = () => {
    const title = dream.title || "My Dream";
    const summary = dream.dream_summary || "";
    return `${title}: ${summary.substring(0, 100)}${summary.length > 100 ? '...' : ''}`;
  };

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-2">{dream.title}</h1>
          
          {dream.dream_summary && (
            <div className="mb-4">
              <h2 className="text-lg font-medium mb-2">Dream Summary</h2>
              <p className="text-muted-foreground">{dream.dream_summary}</p>
            </div>
          )}
          
          {dream.analysis_summary && (
            <div className="mb-4">
              <h2 className="text-lg font-medium mb-2">Analysis</h2>
              <p className="text-muted-foreground">{dream.analysis_summary}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <Link href="/">
              <Button variant="outline">Go to Dreamlink</Button>
            </Link>
            
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">Share:</span>
              <SocialShare 
                url={typeof window !== 'undefined' ? window.location.href : ''}
                title={getShareableText()}
                size={24}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}