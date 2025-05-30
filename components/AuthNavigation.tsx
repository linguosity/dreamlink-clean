'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Sparkles, Crown, Star } from 'lucide-react';

interface AuthNavigationProps {
  variant?: 'compact' | 'full';
}

export default function AuthNavigation({ variant = 'compact' }: AuthNavigationProps) {
  const pathname = usePathname();
  const [hovered, setHovered] = useState<string | null>(null);

  const navItems = [
    {
      href: '/sign-in',
      label: 'Sign In',
      description: 'Access your dream journal',
      icon: Star,
      active: pathname === '/sign-in'
    },
    {
      href: '/sign-up', 
      label: 'Sign Up',
      description: 'Start your spiritual journey',
      icon: Sparkles,
      active: pathname === '/sign-up'
    },
    {
      href: '/pricing',
      label: 'Pricing',
      description: 'Choose your plan',
      icon: Crown,
      active: pathname === '/pricing',
      badge: 'Plans'
    }
  ];

  if (variant === 'compact') {
    return (
      <Card className="p-1 bg-muted/50 backdrop-blur-sm">
        <div className="flex rounded-md">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex-1 relative px-4 py-2 rounded-md transition-all duration-200 text-center
                  ${item.active 
                    ? 'bg-background text-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                  }
                `}
                onMouseEnter={() => setHovered(item.href)}
                onMouseLeave={() => setHovered(null)}
              >
                <div className="flex items-center justify-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                {hovered === item.href && (
                  <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-popover text-popover-foreground rounded-md shadow-lg border z-10">
                    <p className="text-xs">{item.description}</p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-r from-background/80 to-muted/20 backdrop-blur-sm border-border/50">
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-semibold text-center">Choose Your Path</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  group relative p-4 rounded-lg border transition-all duration-300 hover:scale-105
                  ${item.active 
                    ? 'bg-primary/10 border-primary/50 shadow-md' 
                    : 'bg-background/50 border-border hover:border-primary/30 hover:shadow-lg'
                  }
                `}
              >
                <div className="flex items-center space-x-3">
                  <div className={`
                    p-2 rounded-full transition-colors
                    ${item.active ? 'bg-primary/20' : 'bg-muted group-hover:bg-primary/10'}
                  `}>
                    <Icon className={`h-5 w-5 ${item.active ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{item.label}</h4>
                      {item.badge && (
                        <Badge variant="outline" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Card>
  );
}