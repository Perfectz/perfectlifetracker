const http = require('http');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Step 1: Build the frontend
console.log('🔨 Building the frontend...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build successful');
} catch (error) {
  console.error('❌ Build failed', error);
  process.exit(1);
}

// Step 2: Check if dist directory exists
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  console.error('❌ dist directory does not exist');
  process.exit(1);
}

// Step 3: Check if index.html exists
const indexPath = path.join(distDir, 'index.html');
if (!fs.existsSync(indexPath)) {
  console.error('❌ index.html does not exist in dist directory');
  process.exit(1);
}

// Check bundle files
const files = fs.readdirSync(distDir);
const bundleFiles = files.filter(file => file.startsWith('bundle') && file.endsWith('.js'));
if (bundleFiles.length === 0) {
  console.error('❌ No bundle.js file found in dist directory');
  process.exit(1);
}
console.log(`✅ Found bundle file: ${bundleFiles[0]}`);

// Step 4: Check the App component code for "Hello World"
const appContent = fs.readFileSync(path.join(__dirname, 'src', 'App.tsx'), 'utf8');
if (appContent.includes('Hello World')) {
  console.log('✅ App component includes "Hello World"');
} else {
  console.error('❌ App component does not include "Hello World"');
  process.exit(1);
}

// Step 5: Start the test server
console.log('🚀 Starting test server...');
const server = require('./test-server');

// Step 6: Make HTTP requests to test endpoints
setTimeout(() => {
  console.log('\n🧪 Testing endpoints...');
  
  // Test root endpoint
  http.get('http://localhost:8080/', (res) => {
    console.log(`🔍 / - Status: ${res.statusCode}`);
    console.log(`🔍 / - Headers: ${JSON.stringify(res.headers)}`);
    
    // Verify security headers
    const hasSecurityHeaders = 
      res.headers['x-content-type-options'] === 'nosniff' && 
      res.headers['x-frame-options'] === 'SAMEORIGIN' && 
      res.headers['x-xss-protection'] === '1; mode=block' && 
      res.headers['content-security-policy'] !== undefined;
    
    console.log(`🔐 Security Headers: ${hasSecurityHeaders ? '✅ Present' : '❌ Missing'}`);
    
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      // Check if index.html has a root div
      const hasRootDiv = data.includes('<div id="root"></div>');
      console.log(`🌿 Root Div: ${hasRootDiv ? '✅ Present' : '❌ Missing'}`);
      
      // Test health endpoint
      http.get('http://localhost:8080/health', (res) => {
        console.log(`🔍 /health - Status: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          const isHealthy = data.includes('OK');
          console.log(`❤️ Health: ${isHealthy ? '✅ OK' : '❌ Not OK'}`);
          
          console.log('\n✅ All tests completed');
          process.exit(0);
        });
      }).on('error', (err) => {
        console.error('❌ Health test error:', err.message);
        process.exit(1);
      });
    });
  }).on('error', (err) => {
    console.error('❌ Root test error:', err.message);
    process.exit(1);
  });
}, 1000); 