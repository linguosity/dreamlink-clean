"use client";

import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Send, ExpandIcon, AlertCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { useRouter } from "next/navigation";

interface CompactDreamInputProps {
  userId: string;
}

export default function CompactDreamInput({ userId }: CompactDreamInputProps) {
  const [dream, setDream] = useState("");
  const [expandedDream, setExpandedDream] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tipDismissed, setTipDismissed] = useState(false);
  const router = useRouter();

  // Check localStorage for persistent tip dismissal on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('dreamlink-tip-dismissed');
      if (dismissed === 'true') {
        setTipDismissed(true);
      }
    }
  }, []);

  // Handle permanent tip dismissal
  const handlePermanentDismiss = () => {
    setTipDismissed(true);
    if (typeof window !== 'undefined') {
      localStorage.setItem('dreamlink-tip-dismissed', 'true');
    }
  };

  // Handler for submitting from compact input
  const handleSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (!dream.trim()) return;
    
    await submitDream(dream);
    setDream("");
  };

  // Handler for submitting from expanded textarea
  const handleExpandedSubmit = async (event?: React.FormEvent) => {
    if (event) event.preventDefault();
    if (!expandedDream.trim()) return;
    
    await submitDream(expandedDream);
    setExpandedDream("");
    setDialogOpen(false);
  };

  // Common submission logic with retry for auth timing issues
  const submitDream = async (dreamText: string, retryCount = 0) => {
    setIsSubmitting(true);
    
    try {
      console.log(`Submitting dream to API (attempt ${retryCount + 1}) with user ID:`, userId);
      
      const response = await fetch("/api/dream-entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dream_text: dreamText,
          // Remove user_id from request body - let server determine auth
        }),
      });

      console.log("Dream submission response status:", response.status);
      
      // Get the response text first to ensure we can see the error even if it's not valid JSON
      const responseText = await response.text();
      
      let result;
      try {
        // Try to parse as JSON
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse API response as JSON:", responseText);
        throw new Error("Invalid API response format");
      }

      // Handle 401 auth errors with retry logic
      if (response.status === 401 && retryCount < 2) {
        console.log(`Auth error on attempt ${retryCount + 1}, retrying after delay...`);
        
        // Wait a bit for auth state to sync
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Recursive retry
        setIsSubmitting(false); // Reset loading state temporarily
        return await submitDream(dreamText, retryCount + 1);
      }

      if (!response.ok) {
        console.error("API error details:", result);
        
        // Special handling for auth errors
        if (response.status === 401) {
          throw new Error("Authentication error. Please try refreshing the page and logging in again.");
        }
        
        throw new Error(result.error || "Failed to submit dream");
      }
      
      // Store the loading dream ID in localStorage
      if (result.id) {
        localStorage.setItem('loadingDreamId', result.id);
        console.log('Set loading dream ID:', result.id);
      }

      // Refresh the page to show the new entry with loading state
      router.refresh();
    } catch (error: unknown) {
      const err = error instanceof Error ? error : new Error(String(error));
      console.error("Error submitting dream:", err);
      
      // More user-friendly error messages
      let userMessage = err.message;
      if (err.message.includes('401') || err.message.includes('Unauthorized')) {
        userMessage = "Please wait a moment and try again. If the issue persists, try refreshing the page.";
      }
      
      alert(`Failed to submit your dream: ${userMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-medium text-center">Record Your Dream</h2>
      
      {/* Compact input form */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="flex items-center gap-2 w-full px-4 sm:max-w-2xl sm:mx-auto sm:px-0">
          <Input
            placeholder="I dreamed that..."
            value={dream}
            onChange={(e) => setDream(e.target.value)}
            className="flex-1 min-w-0"
            maxLength={500}
            disabled={isSubmitting}
          />
          
          <Button
            type="submit"
            size="icon"
            disabled={!dream.trim() || isSubmitting}
            title={isSubmitting ? "Processing..." : "Submit dream"}
            className={isSubmitting ? "blur-[0.5px]" : ""}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                title="Expand for more details"
              >
                <ExpandIcon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Record Your Dream</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleExpandedSubmit} className="space-y-4 py-4">
              <Textarea
                placeholder="Describe your dream in detail... What happened? How did you feel? Include any symbols or recurring themes that stood out to you."
                value={expandedDream}
                onChange={(e) => setExpandedDream(e.target.value)}
                className="min-h-[200px]"
                maxLength={8000}
                disabled={isSubmitting}
              />
              
              <div className="text-xs text-muted-foreground text-right">
                {expandedDream.length}/8000 characters
              </div>
              
              {/* Gentle hint for short dreams in expanded form */}
              {expandedDream.trim().length > 0 && expandedDream.trim().length < 20 && !tipDismissed && (
                <div className="flex items-start gap-3 p-3 rounded-lg border border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/20">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 dark:text-blue-400">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="m9 12 2 2 4-4"/>
                    </svg>
                  </div>
                  <p className="flex-1 text-sm text-blue-600 dark:text-blue-300 leading-relaxed">
                    <span className="font-medium">Tip:</span> Adding more details will help generate a more insightful analysis.
                  </p>
                  <button
                    onClick={handlePermanentDismiss}
                    className="flex-shrink-0 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group"
                    aria-label="Dismiss tip permanently"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 group-hover:text-blue-600 dark:text-blue-500 dark:group-hover:text-blue-300">
                      <path d="m18 6-12 12"/>
                      <path d="m6 6 12 12"/>
                    </svg>
                  </button>
                </div>
              )}
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={!expandedDream.trim() || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Dream for Analysis"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
        
        {/* Gentle hint for short dreams */}
        {dream.trim().length > 0 && dream.trim().length < 20 && !tipDismissed && (
          <div className="max-w-2xl mx-auto px-4 sm:px-0">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-blue-100 bg-blue-50/50 dark:border-blue-900/30 dark:bg-blue-950/20">
              <div className="flex-shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 dark:text-blue-400">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="m9 12 2 2 4-4"/>
                </svg>
              </div>
              <p className="flex-1 text-sm text-blue-600 dark:text-blue-300 leading-relaxed">
                <span className="font-medium">Tip:</span> Adding more details will help generate a more insightful analysis.
              </p>
              <button
                onClick={handlePermanentDismiss}
                className="flex-shrink-0 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors group"
                aria-label="Dismiss tip permanently"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 group-hover:text-blue-600 dark:text-blue-500 dark:group-hover:text-blue-300">
                  <path d="m18 6-12 12"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </form>
      
      <p className="text-xs text-center text-muted-foreground max-w-md mx-auto">
        Record your dream for AI-powered analysis with biblical insights
      </p>
    </div>
  );
}