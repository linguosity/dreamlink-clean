'use client';

import { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { FeatureFlag, isFeatureEnabled, setFeatureFlag } from '@/utils/feature-flags';

export function SearchFeatureToggle() {
  const [enabled, setEnabled] = useState(false);
  
  // Initialize state from feature flag
  useEffect(() => {
    setEnabled(isFeatureEnabled(FeatureFlag.CLIENT_SEARCH));
  }, []);
  
  // Handle toggle
  const handleToggle = (checked: boolean) => {
    setEnabled(checked);
    setFeatureFlag(FeatureFlag.CLIENT_SEARCH, checked);
    
    // Instead of a full page reload, dispatch a custom event that context providers can listen for
    const event = new CustomEvent('featureFlagChanged', {
      detail: { flag: FeatureFlag.CLIENT_SEARCH, enabled: checked }
    });
    window.dispatchEvent(event);
  };
  
  return (
    <div className="flex items-center space-x-2">
      <Switch 
        id="search-feature" 
        checked={enabled} 
        onCheckedChange={handleToggle} 
      />
      <Label htmlFor="search-feature">Multi-keyword Search</Label>
    </div>
  );
}