#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Generate version based on timestamp and git commit (if available)
const getVersion = () => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  const time = Date.now().toString().slice(-4);
  
  // Try to get git commit hash
  try {
    const { execSync } = require('child_process');
    const hash = execSync('git rev-parse --short HEAD').toString().trim();
    return `${date}-${hash}`;
  } catch {
    // If git is not available, use timestamp
    return `${date}-${time}`;
  }
};

// Update version.json
const versionPath = path.join(__dirname, '..', 'public', 'version.json');
const newVersion = getVersion();

const versionData = {
  version: newVersion,
  timestamp: new Date().toISOString(),
};

fs.writeFileSync(versionPath, JSON.stringify(versionData, null, 2));
console.log(`Version updated to: ${newVersion}`);