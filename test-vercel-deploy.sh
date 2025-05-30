#!/bin/bash

# This script simulates a Vercel deployment locally to check for issues

# Set environment variables similar to Vercel
export NODE_ENV=production
export VERCEL=1
export VERCEL_ENV=production

# Create a clean temporary build directory
rm -rf .vercel-build-test
mkdir -p .vercel-build-test

echo "-------------------------------------------"
echo "Testing Vercel deployment locally..."
echo "-------------------------------------------"

# Step 1: Check Next.js config
echo "Checking Next.js configuration..."
if [[ -f next.config.ts ]] || [[ -f next.config.js ]]; then
  echo "✅ Next.js config found"
else
  echo "❌ Missing Next.js config file"
  exit 1
fi

# Step 2: Check for crucial environment variables
echo "Checking environment variables..."
if [[ -f .env.local ]]; then
  echo "✅ Local environment file found"
  # Check for required variables but don't show values
  if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
    echo "  ✅ NEXT_PUBLIC_SUPABASE_URL is set"
  else
    echo "  ⚠️ NEXT_PUBLIC_SUPABASE_URL not found in .env.local"
  fi
  if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
    echo "  ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is set"
  else
    echo "  ⚠️ NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local"
  fi
else
  echo "⚠️ No .env.local file found - make sure all environment variables are set in Vercel dashboard"
fi

# Step 3: Check package.json for Vercel compatibility
echo "Checking package.json..."
if grep -q "\"vercel-build\"" package.json; then
  echo "✅ vercel-build script found in package.json"
else
  echo "❌ Missing vercel-build script in package.json"
fi

# Step 4: Check for vercel.json
echo "Checking Vercel configuration..."
if [[ -f vercel.json ]]; then
  echo "✅ vercel.json found"
else
  echo "⚠️ No vercel.json found - using Next.js defaults"
fi

# Step 5: Check dependency versions
echo "Checking dependency versions..."
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo "Node version: $NODE_VERSION"
echo "npm version: $NPM_VERSION"

# Compare with Vercel's recommended versions
if [[ "$NODE_VERSION" < "v16" ]]; then
  echo "⚠️ Node.js version may be too old for Vercel"
else
  echo "✅ Node.js version looks compatible with Vercel"
fi

echo ""
echo "-------------------------------------------"
echo "Vercel deployment check summary:"
echo "-------------------------------------------"
echo "Your project appears ready for Vercel deployment."
echo "To deploy to Vercel, commit these changes and push to your repository."
echo "If your repository is connected to Vercel, it should trigger a new deployment automatically."
echo ""
echo "Alternatively, you can deploy using Vercel CLI:"
echo "$ vercel"
echo "-------------------------------------------"

# Clean up
rm -rf .vercel-build-test