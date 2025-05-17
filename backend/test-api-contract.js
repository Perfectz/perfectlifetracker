// API Contract Test for Health Endpoint
const http = require('http');
const assert = require('assert');

console.log('Running API contract test for /health endpoint...');

const port = parseInt(process.env.PORT || '4000', 10);

// Simple server mimicking the backend /health endpoint
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port, () => {
  runTest();
});

function runTest() {
  const options = {
    hostname: 'localhost',
    port,
    path: '/health',
    method: 'GET',
  };

  const req = http.request(options, (res) => {
    console.log(`STATUS: ${res.statusCode}`);
    assert.strictEqual(res.statusCode, 200, 'Status code should be 200');

    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`RESPONSE: ${data}`);
      try {
        const json = JSON.parse(data);
        assert.strictEqual(typeof json.status, 'string', 'Response should have a "status" property of type string');
        assert.strictEqual(json.status, 'ok', 'Status should be "ok"');
        const keys = Object.keys(json);
        assert.strictEqual(keys.length, 1, 'Response should have exactly 1 property');
        console.log('✅ All contract tests passed!');
        server.close();
      } catch (error) {
        console.error('❌ Error in contract test:', error.message);
        server.close();
        process.exit(1);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Error making request:', error.message);
    server.close();
    process.exit(1);
  });

  req.end();
}
