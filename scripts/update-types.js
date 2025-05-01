#!/usr/bin/env node
/**
 * This script checks frontend dependencies and installs TypeScript types where missing
 * Usage: node scripts/update-types.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Common libraries that typically need @types packages
const typicalTypePackages = [
  'lodash',
  'react-query',
  'axios',
  'jest',
  'date-fns'
];

// Get frontend package.json
try {
  const packageJsonPath = path.resolve(__dirname, '../frontend/package.json');
  const packageData = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  
  const allDependencies = {
    ...packageData.dependencies || {},
    ...packageData.devDependencies || {}
  };
  
  const missingTypes = [];
  
  // Check each typical type package
  for (const pkg of typicalTypePackages) {
    // If we have the package but not its types
    if (allDependencies[pkg] && !allDependencies[`@types/${pkg}`]) {
      missingTypes.push(pkg);
    }
  }
  
  if (missingTypes.length > 0) {
    console.log(`Installing missing TypeScript types for: ${missingTypes.join(', ')}`);
    
    try {
      const typesPackages = missingTypes.map(pkg => `@types/${pkg}`).join(' ');
      execSync(`cd "${path.resolve(__dirname, '../frontend')}" && npm install --save-dev ${typesPackages}`, 
        { stdio: 'inherit' });
      console.log('Successfully installed missing TypeScript types');
    } catch (error) {
      console.error('Error installing TypeScript types:', error.message);
      process.exit(1);
    }
  } else {
    console.log('No missing TypeScript types found');
  }
  
} catch (error) {
  console.error('Error reading package.json:', error.message);
  process.exit(1);
} 