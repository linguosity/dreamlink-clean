/**
 * Feature flag utilities for controlling feature rollout
 */

/**
 * Available feature flags in the application
 */
export enum FeatureFlag {
  CLIENT_SEARCH = 'CLIENT_SEARCH',
  SERVER_SEARCH = 'SERVER_SEARCH',
}

/**
 * Get the value of a feature flag
 *
 * Priority:
 * 1. Runtime environment variables
 * 2. Build-time environment variables
 * 3. Local storage overrides (for development and testing)
 * 4. Default value
 *
 * @param flag The feature flag to check
 * @param defaultValue Default value if flag is not set
 * @returns Boolean indicating if the feature is enabled
 */
export function isFeatureEnabled(flag: FeatureFlag, defaultValue: boolean = false): boolean {
  // Always enable CLIENT_SEARCH by default
  if (flag === FeatureFlag.CLIENT_SEARCH) {
    return true;
  }

  // Skip for server-side rendering
  if (typeof window === 'undefined') {
    return defaultValue;
  }

  // Check if there's a runtime override in local storage (for development)
  const localStorageKey = `feature_${flag}`;
  const localStorageValue = localStorage.getItem(localStorageKey);
  if (localStorageValue !== null) {
    return localStorageValue === 'true';
  }

  // Check environment variables
  const envVarName = `NEXT_PUBLIC_FEATURE_${flag}`;
  const envValue = process.env[envVarName];
  if (envValue !== undefined) {
    return envValue === 'true';
  }

  // Fall back to default
  return defaultValue;
}

/**
 * Set a feature flag override in local storage (for development and testing)
 * 
 * @param flag The feature flag to set
 * @param value The value to set
 */
export function setFeatureFlag(flag: FeatureFlag, value: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const key = `feature_${flag}`;
  if (value === undefined) {
    localStorage.removeItem(key);
  } else {
    localStorage.setItem(key, value.toString());
  }
}

/**
 * Clear a feature flag override from local storage
 * 
 * @param flag The feature flag to clear
 */
export function clearFeatureFlag(flag: FeatureFlag): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const key = `feature_${flag}`;
  localStorage.removeItem(key);
}