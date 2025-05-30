// app/page.tsx
//
// Technical explanation:
// Main page component (landing page after login). This component is responsible
// for fetching and displaying the user's dream entries. It includes
// functionality for adding new dreams (CompactDreamInput) and viewing existing
// ones in a gallery format (AnimatedDreamGrid).
//
// Analogy:
// This page is like the main living room of the "Dreamlink house." It's where
// you first land after entering, see your collected dream items displayed
// (dream gallery), and have a convenient spot to jot down new dream experiences
// (dream input).

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import CompactDreamInput from "@/components/CompactDreamInput";
import AnimatedDreamGrid from "@/components/AnimatedDreamGrid";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export default async function MainPage() {
  console.log("Home page - Initializing...");
  const supabase = await createClient();

  // Check if user is logged in (more secure method)
  console.log("Home page - Fetching user from auth...");
  const { data, error: userError } = await supabase.auth.getUser();
  const user = data?.user;
  
  console.log("Home page - Auth check:", user ? "User authenticated" : "No user found");
  if (user) {
    console.log("Home page - User ID:", user.id);
  }
  
  // Also check session for more information
  const { data: sessionData } = await supabase.auth.getSession();
  console.log("Home page - Session check:", sessionData?.session ? "Has session" : "No session");
  
  if (userError) {
    console.error("Authentication error:", userError.message);
    // Don't redirect if it's a JWT error - the middleware should handle it
    // Only redirect for other types of errors
    if (!userError.message.includes('JWT') && !userError.message.includes('token')) {
      return redirect("/sign-in");
    }
  }
  
  if (!user) {
    console.error("No user in session - redirecting to sign in");
    
    // Add a small delay to ensure cookies are properly processed
    // This can help with issues related to cookie propagation
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return redirect("/sign-in");
  }

  console.log("Home page - Fetching dream entries for user:", user.id);
  
  // Fetch dream entries for the logged in user
  const { data: dreams, error } = await supabase
    .from("dream_entries")
    .select("*")
    .eq("user_id", user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error("Error fetching dreams:", error.message);
  } else {
    console.log(`Home page - Retrieved ${dreams?.length || 0} dream entries`);
  }

  return (
    <div className="container py-6 sm:py-10 relative">
      {/*<div className="absolute inset-0 bg-fixed bg-cover bg-center -z-10" style={{ backgroundImage: "url('/images/background.jpg')" }}></div>*/}
      <div className="absolute inset-0 -z-10"></div>
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10 relative z-10 px-4 sm:px-0">
        {/* Dream Input Section */}
        <CompactDreamInput userId={user.id} />
        
        {/* Animated Dream Grid */}
        <div className="mt-8 sm:mt-12">
          <h2 className="text-lg font-semibold mb-4">Your Dream Gallery</h2>
          <AnimatedDreamGrid dreams={dreams || []} />
        </div>
        
        {/* Footer Section */}
        <footer className="border-t pt-8 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-gray-100">Dreamlink</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                AI-powered dream journaling with biblical insights and dream pattern analysis.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-gray-100">Quick Links</h3>
              <ul className="space-y-3">
                <li><Link href="/account" className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline transition-colors">Account</Link></li>
                <li><Link href="/settings" className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline transition-colors">Settings</Link></li>
                <li><Link href="/help" className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline transition-colors">Help</Link></li>
                <li><Link href="/about" className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline transition-colors">About</Link></li>
                <li><Link href="/privacy" className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white hover:underline transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-3 text-gray-900 dark:text-gray-100">Connect</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                Have questions or feedback?
              </p>
              <div className="space-y-4">
                <Link href="/contact">
                  <Button variant="outline" size="sm" className="bg-white text-gray-900 hover:bg-gray-100">Contact Us</Button>
                </Link>
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Share:</h4>
                  {/* Social share buttons rendered client-side */}
                  <div className="flex items-center space-x-2">
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(defaultUrl)}`} target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#3b5998" className="rounded-full">
                        <path d="M18 2h-12c-2.21 0-4 1.79-4 4v12c0 2.21 1.79 4 4 4h12c2.21 0 4-1.79 4-4v-12c0-2.21-1.79-4-4-4zm0 4v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v7h-3v-7h-2v-3h2v-2.5c0-1.93 1.57-3.5 3.5-3.5h2.5z"/>
                      </svg>
                    </a>
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(defaultUrl)}&text=${encodeURIComponent("Track your dreams with Dreamlink - AI-powered dream journaling")}`} target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#1DA1F2" className="rounded-full">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05-.78-.83-1.9-1.36-3.16-1.36-2.35 0-4.27 1.92-4.27 4.29 0 .34.03.67.11.98-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21-.36.1-.74.15-1.13.15-.27 0-.54-.03-.8-.08.54 1.69 2.11 2.95 4 2.98-1.46 1.16-3.31 1.84-5.33 1.84-.34 0-.68-.02-1.02-.06 1.9 1.22 4.16 1.93 6.58 1.93 7.88 0 12.21-6.54 12.21-12.21 0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                      </svg>
                    </a>
                    <a href={`viber://forward?text=${encodeURIComponent("Track your dreams with Dreamlink - AI-powered dream journaling " + defaultUrl)}`} target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#7360f2" className="rounded-full">
                        <path d="M12 1c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2.238 7.525c2.246.235 3.455 1.512 3.667 3.824.039.433-.28.857-.75.857-.458 0-.85-.34-.885-.797-.149-1.604-.85-2.354-2.092-2.521-.389-.053-.695-.368-.695-.76 0-.415.366-.776.755-.603zm.31-1.97c3.252.306 5.212 2.374 5.499 5.666.029.337-.252.665-.585.665-.327 0-.596-.265-.626-.601-.211-2.609-1.69-4.153-4.209-4.405-.335-.033-.591-.321-.591-.656 0-.355.327-.673.682-.622.377-.04.422-.053.422-.053s-.045.013-.422.053c-.051-.006-.091-.029-.137-.045.437.065-.01.044-.059.044-.345 0-.627-.291-.627-.64 0-.35.282-.642.626-.642.168 0 .32.066.435.174.032-.016.119-.062.119-.062s-.086.045-.119.062v-.001zm.536-1.56c4.23.283 6.766 2.862 7.081 7.215.015.21-.31.437-.491.437-.261 0-.49-.213-.506-.47-.267-3.705-2.276-5.761-5.871-6.003-.348-.023-.611-.306-.611-.658 0-.336.273-.625.602-.625.188.001.362.081.486.214.047-.021.103-.045.103-.045s-.056.023-.103.045v.001zm9.022 12.114c-.597-.893-1.13-1.878-1.676-2.84-.741-1.309-1.929-.303-2.454.3-.536.616-1.032.674-1.362.27-.981-1.195-1.615-2.071-2.38-3.634 0 0-.3-.61-.873-1.641l-.014-.029c-.3-.61-.273-.913.045-1.289.309-.37 1.464-1.591.9-3.178-.535-1.505-2.565-5.802-3.618-5.148-1.061.658-1.357 1.41-1.352 2.11.005.7.194 1.339.374 1.862.172.5.316.958.316 1.363 0 .255-.043.49-.118.695-.127.347-.322.582-.508.808-.199.244-.38.458-.536.798-.151.333-.211.704-.211 1.102 0 1.008.619 2.674 1.125 3.589.399.731.81 1.359 1.246 1.887.859 1.044 1.893 1.893 2.834 2.507 1.451.948 3.082 1.608 4.999 1.608 1.072 0 1.96-.244 2.674-.732.366-.249.666-.559.916-.914.229-.328.401-.702.489-1.102.088-.4.096-.8.033-1.196-.065-.416-.176-.821-.291-1.211-.104-.35-.237-.695-.237-1.067 0-.39.124-.876.675-1.591.088-.115.999-1.179 1.271-1.499.272-.32.743-1.111.25-1.888z"/>
                      </svg>
                    </a>
                    <a href={`https://t.me/share/url?url=${encodeURIComponent(defaultUrl)}&text=${encodeURIComponent("Track your dreams with Dreamlink - AI-powered dream journaling")}`} target="_blank" rel="noopener noreferrer" className="opacity-50 hover:opacity-100 transition-opacity">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#0088cc" className="rounded-full">
                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-1.041 16.737c-.26 0-.215-.198-.306-.396l-.762-2.512 5.859-3.671-6.659 3.939-2.833-.726c-.613-.151-.613-.586.306-.879l11.08-4.581c.504-.302.909.151.706.879l-1.867 8.823c-.151.528-.628.654-1.01.4l-2.833-2.08-1.365 1.376c-.151.152-.306.228-.316.328z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center text-xs text-gray-600 dark:text-gray-400 mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            &copy; {new Date().getFullYear()} Dreamlink. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}