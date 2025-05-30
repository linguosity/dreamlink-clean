"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/app/actions";
import { Settings, User as UserIcon, LogOut } from "lucide-react";

interface UserAvatarProps {
  size?: 'sm' | 'md' | 'lg';
}

export default function UserAvatar({ size = 'md' }: UserAvatarProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initials, setInitials] = useState("");
  const [subscription, setSubscription] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUserData() {
      try {
        // First check for user session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError.message);
          setLoading(false);
          return;
        }
        
        if (!sessionData.session) {
          console.log("No active session found");
          setLoading(false);
          return;
        }
        
        // Then get user details
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error("Error fetching user:", error.message);
          setLoading(false);
          return;
        }
        
        setUser(data.user);
        
        if (data.user) {
          // Set initials from email if no user metadata
          const email = data.user.email || "";
          const emailInitials = email.split('@')[0].substring(0, 2).toUpperCase();
          setInitials(emailInitials);
          
          try {
            // Fetch subscription data from profiles table
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('subscription_tier')
              .eq('id', data.user.id)
              .single();
            
            if (profileError) {
              console.log("Profile data not found, using default tier");
              setSubscription("free");
            } else {
              setSubscription(profileData?.subscription_tier || "free");
            }
          } catch (profileFetchError) {
            console.error("Error fetching profile:", profileFetchError);
            setSubscription("free");
          }
        }
      } catch (error) {
        console.error("Unexpected error in fetchUserData:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [supabase]);

  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base'
  };

  if (loading) {
    return (
      <div className={`rounded-full bg-secondary flex items-center justify-center ${sizeClasses[size]}`}>
        <div className="animate-pulse bg-muted h-4 w-4 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <Link href="/sign-in" className="text-sm font-medium">
        Sign In
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="focus:outline-none">
        <div className={`rounded-full bg-primary text-primary-foreground font-medium flex items-center justify-center ${sizeClasses[size]}`}>
          {user.user_metadata?.avatar_url ? (
            <img 
              src={user.user_metadata.avatar_url}
              alt="User avatar"
              className="rounded-full h-full w-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              {subscription === "premium" 
                ? "Premium Plan" 
                : subscription === "pro" 
                  ? "Pro Plan" 
                  : "Free Plan"}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href="/account">
          <DropdownMenuItem className="cursor-pointer">
            <UserIcon className="mr-2 h-4 w-4" />
            <span>Account</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <DropdownMenuItem 
            className="cursor-pointer text-destructive focus:text-destructive"
            asChild
          >
            <button type="submit" className="flex w-full items-center">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}