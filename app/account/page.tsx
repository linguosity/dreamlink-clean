"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Subscription {
  tier: string;
  features: string[];
  price?: string;
  current: boolean;
}

const subscriptionTiers: Record<string, Subscription> = {
  free: {
    tier: "Free",
    features: [
      "Daily dream journal",
      "Basic dream analysis",
      "Limited bible references"
    ],
    current: false
  },
  premium: {
    tier: "Premium",
    features: [
      "Everything in Free",
      "Advanced dream analysis",
      "Unlimited bible references",
      "Dream patterns tracking"
    ],
    price: "$4.99/month",
    current: false
  },
  pro: {
    tier: "Pro",
    features: [
      "Everything in Premium",
      "AI-powered dream insights",
      "Dream symbol dictionary",
      "Export and backup features"
    ],
    price: "$9.99/month",
    current: false
  }
};

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSubscription, setCurrentSubscription] = useState<string>("free");
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function fetchUserData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // Fetch subscription data from your database
          const { data: profileData } = await supabase
            .from('profiles')
            .select('subscription_tier')
            .eq('id', user.id)
            .single();
          
          const tier = profileData?.subscription_tier || "free";
          setCurrentSubscription(tier);
          
          // Update subscription tiers with current status
          const tiers = Object.entries(subscriptionTiers).map(([key, sub]) => ({
            ...sub,
            current: key === tier
          }));
          
          setSubscriptions(tiers);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserData();
  }, [supabase]);

  if (loading) {
    return (
      <div className="container py-10">
        <div className="flex flex-col space-y-4 max-w-3xl mx-auto">
          <div className="h-8 w-64 bg-muted rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-muted rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container flex items-center justify-center py-20">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="mb-6">You need to be signed in to view your account information.</p>
          <Link href="/sign-in">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Account</h1>
        
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Account Information</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{user.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Current Plan</span>
                  <Badge variant={currentSubscription === "free" ? "outline" : "default"}>
                    {currentSubscription.charAt(0).toUpperCase() + currentSubscription.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subscriptions.map((sub) => (
            <Card key={sub.tier} className={sub.current ? "border-primary" : ""}>
              <CardHeader>
                <CardTitle>{sub.tier}</CardTitle>
                {sub.price && <CardDescription>{sub.price}</CardDescription>}
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {sub.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {sub.current ? (
                  <Button disabled className="w-full">Current Plan</Button>
                ) : (
                  <Button variant="outline" className="w-full">
                    {sub.tier === "Free" ? "Downgrade" : "Upgrade"}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}