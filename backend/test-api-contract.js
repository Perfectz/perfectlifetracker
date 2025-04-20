// API Contract Test for Health Endpoint
const http = require('http');
const assert = require('assert');

console.log('Running API contract test for /health endpoint...');

// Test health endpoint
const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/health',
  method: 'GET',
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  
  // Assert status code is 200
  assert.strictEqual(res.statusCode, 200, 'Status code should be 200');
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(`RESPONSE: ${data}`);
    
    try {
      const json = JSON.parse(data);
      
      // Assert response has status property
      assert.strictEqual(typeof json.status, 'string', 'Response should have a "status" property of type string');
      
      // Assert status is 'ok'
      assert.strictEqual(json.status, 'ok', 'Status should be "ok"');
      
      // Assert no unexpected properties
      const keys = Object.keys(json);
      assert.strictEqual(keys.length, 1, 'Response should have exactly 1 property');
      
      console.log('✅ All contract tests passed!');
    } catch (error) {
      console.error('❌ Error in contract test:', error.message);
      process.exit(1);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ Error making request:', error.message);
  process.exit(1);
});

req.end(); 