#!/bin/bash

# Set environment to production
export NODE_ENV=production

# Clean node_modules
echo "Cleaning node_modules..."
rm -rf node_modules package-lock.json

# Install dependencies with clean state
echo "Installing dependencies..."
npm install

# Verify Next.js is installed
if [ -d "node_modules/next" ]; then
  echo "✅ Next.js installed successfully"
else
  echo "❌ Next.js installation failed, installing explicitly..."
  npm install next@15.1.7 --save
fi

# Build the application
echo "Building the application..."
npm run build