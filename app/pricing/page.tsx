import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Check, ArrowLeft } from "lucide-react";
import AuthNavigation from "@/components/AuthNavigation";

const plans = [
  {
    name: "Seeker",
    price: "Free",
    period: "forever",
    description: "Begin your spiritual journey with essential dream insights",
    credits: 5,
    features: [
      "5 AI dream analyses per month",
      "Basic biblical interpretations",
      "Simple reading level",
      "Dream journal storage",
      "Mobile responsive design"
    ],
    cta: "Start Free",
    popular: false,
    color: "bg-gray-50 dark:bg-gray-900"
  },
  {
    name: "Visionary", 
    price: "$9",
    period: "month",
    description: "Unlock deeper spiritual insights with enhanced AI analysis",
    credits: 50,
    features: [
      "50 AI dream analyses per month",
      "Advanced biblical cross-references",
      "All reading levels available",
      "Dream pattern recognition",
      "Export dream journals",
      "Priority analysis processing",
      "Email support"
    ],
    cta: "Upgrade to Visionary",
    popular: true,
    color: "bg-primary/5 dark:bg-primary/10 border-primary/20"
  },
  {
    name: "Prophet",
    price: "$29", 
    period: "month",
    description: "Unlimited access to divine wisdom and premium features",
    credits: "Unlimited",
    features: [
      "Unlimited AI dream analyses",
      "Deep theological interpretations", 
      "Scholarly reading level",
      "Advanced dream symbolism",
      "Custom biblical study guides",
      "Dream sharing capabilities",
      "Priority customer support",
      "Early access to new features",
      "API access for integrations"
    ],
    cta: "Become a Prophet",
    popular: false,
    color: "bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20"
  }
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed opacity-30 blur-[3px]"
          style={{ backgroundImage: "url('/images/background.jpg')" }}
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-16">
        {/* Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/sign-up" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Sign Up
            </Link>
            <div className="flex-1 max-w-md mx-4">
              <AuthNavigation variant="compact" />
            </div>
            <div className="w-20" /> {/* Spacer for balance */}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 text-xs font-medium">
            Choose Your Path
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            Unlock Divine Insights
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Choose the subscription tier that aligns with your spiritual journey. 
            Each plan offers deeper access to AI-powered biblical dream interpretation.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name}
              className={`
                relative p-8 transition-all duration-300 hover:shadow-2xl hover:scale-105
                ${plan.color}
                ${plan.popular ? 'ring-2 ring-primary shadow-xl transform scale-105' : 'hover:shadow-lg'}
              `}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1">
                  Most Popular
                </Badge>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  {plan.description}
                </p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period !== "forever" && (
                    <span className="text-muted-foreground">/{plan.period}</span>
                  )}
                </div>

                <div className="mb-6 p-4 bg-background/50 rounded-lg">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Monthly Dream Analyses
                  </p>
                  <p className="text-2xl font-bold text-primary">
                    {typeof plan.credits === 'number' ? plan.credits : plan.credits}
                  </p>
                </div>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button 
                className={`
                  w-full py-3 text-base font-medium transition-all duration-200
                  ${plan.popular 
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl' 
                    : 'bg-background hover:bg-muted text-foreground border border-border hover:border-primary'
                  }
                `}
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="text-center mt-16 p-8 bg-muted/30 rounded-2xl">
          <h3 className="text-2xl font-semibold mb-4">
            Start Your Spiritual Journey Today
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Join thousands of believers discovering God's messages through their dreams. 
            Begin with our free tier and upgrade as your spiritual insights deepen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Create Free Account
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h3>
          <div className="space-y-6">
            <div className="p-6 bg-muted/20 rounded-lg">
              <h4 className="font-semibold mb-2">Can I change my plan anytime?</h4>
              <p className="text-sm text-muted-foreground">
                Yes, you can upgrade or downgrade your subscription at any time. 
                Changes take effect at the next billing cycle.
              </p>
            </div>
            <div className="p-6 bg-muted/20 rounded-lg">
              <h4 className="font-semibold mb-2">What happens to unused credits?</h4>
              <p className="text-sm text-muted-foreground">
                Unused credits reset each month and don't roll over. 
                We recommend choosing a plan that matches your regular usage.
              </p>
            </div>
            <div className="p-6 bg-muted/20 rounded-lg">
              <h4 className="font-semibold mb-2">Is there a free trial for paid plans?</h4>
              <p className="text-sm text-muted-foreground">
                Our Seeker plan is permanently free with 5 monthly analyses. 
                You can upgrade anytime to access additional features.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}