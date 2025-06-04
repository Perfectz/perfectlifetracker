/**
 * backend/scripts/load-test.js
 * Load testing script for backend API performance validation
 */
const autocannon = require('autocannon');
const fs = require('fs');
const path = require('path');

// Performance budgets for load testing
const LOAD_TEST_BUDGETS = {
  minRPS: 100,        // Minimum requests per second
  targetRPS: 500,     // Target requests per second
  maxLatency: 200,    // Maximum average latency (ms)
  maxP99Latency: 500, // Maximum 99th percentile latency (ms)
  minThroughput: 1024 * 1024, // Minimum throughput (1MB/s)
};

// API endpoints to test
const ENDPOINTS_TO_TEST = [
  {
    name: 'Health Check',
    url: 'http://localhost:3001/api/health',
    method: 'GET',
    expectedRPS: 1000,
  },
  {
    name: 'Get Tasks',
    url: 'http://localhost:3001/api/tasks',
    method: 'GET',
    expectedRPS: 500,
    headers: {
      'Authorization': 'Bearer mock-token'
    }
  },
  {
    name: 'Create Task',
    url: 'http://localhost:3001/api/tasks',
    method: 'POST',
    expectedRPS: 200,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer mock-token'
    },
    body: JSON.stringify({
      title: 'Load Test Task',
      description: 'Task created during load testing',
      priority: 'medium'
    })
  },
  {
    name: 'Search Tasks',
    url: 'http://localhost:3001/api/tasks/search?q=test',
    method: 'GET',
    expectedRPS: 300,
    headers: {
      'Authorization': 'Bearer mock-token'
    }
  }
];

async function runLoadTest(endpoint) {
  console.log(`\n🔥 Running load test for ${endpoint.name}...`);
  
  const options = {
    url: endpoint.url,
    method: endpoint.method,
    headers: endpoint.headers || {},
    body: endpoint.body,
    connections: 50,     // Number of concurrent connections
    duration: 30,        // Test duration in seconds
    pipelining: 1,       // Number of pipelined requests
    bailout: 10,         // Number of errors before bailing out
    timeout: 10,         // Request timeout in seconds
  };
  
  try {
    const result = await autocannon(options);
    
    // Extract key metrics
    const metrics = {
      name: endpoint.name,
      url: endpoint.url,
      duration: result.duration,
      requests: {
        total: result.requests.total,
        average: result.requests.average,
        mean: result.requests.mean,
        stddev: result.requests.stddev,
        min: result.requests.min,
        max: result.requests.max,
      },
      latency: {
        average: result.latency.average,
        mean: result.latency.mean,
        stddev: result.latency.stddev,
        min: result.latency.min,
        max: result.latency.max,
        p99: result.latency.p99,
        p95: result.latency.p95,
        p90: result.latency.p90,
      },
      throughput: {
        average: result.throughput.average,
        mean: result.throughput.mean,
        stddev: result.throughput.stddev,
        min: result.throughput.min,
        max: result.throughput.max,
      },
      errors: result.errors,
      timeouts: result.timeouts,
      non2xx: result.non2xx,
    };
    
    // Calculate RPS
    const rps = result.requests.total / (result.duration / 1000);
    metrics.rps = rps;
    
    // Validate against budgets
    const validation = {
      passed: true,
      failures: [],
    };
    
    if (rps < LOAD_TEST_BUDGETS.minRPS) {
      validation.passed = false;
      validation.failures.push(`RPS too low: ${rps.toFixed(2)} < ${LOAD_TEST_BUDGETS.minRPS}`);
    }
    
    if (result.latency.average > LOAD_TEST_BUDGETS.maxLatency) {
      validation.passed = false;
      validation.failures.push(`Average latency too high: ${result.latency.average}ms > ${LOAD_TEST_BUDGETS.maxLatency}ms`);
    }
    
    if (result.latency.p99 > LOAD_TEST_BUDGETS.maxP99Latency) {
      validation.passed = false;
      validation.failures.push(`P99 latency too high: ${result.latency.p99}ms > ${LOAD_TEST_BUDGETS.maxP99Latency}ms`);
    }
    
    if (result.throughput.average < LOAD_TEST_BUDGETS.minThroughput) {
      validation.passed = false;
      validation.failures.push(`Throughput too low: ${result.throughput.average} < ${LOAD_TEST_BUDGETS.minThroughput}`);
    }
    
    if (result.errors > 0) {
      validation.passed = false;
      validation.failures.push(`Errors detected: ${result.errors}`);
    }
    
    // Log results
    console.log(`📊 ${endpoint.name} Results:`);
    console.log(`   RPS: ${rps.toFixed(2)}`);
    console.log(`   Total Requests: ${result.requests.total}`);
    console.log(`   Average Latency: ${result.latency.average}ms`);
    console.log(`   P99 Latency: ${result.latency.p99}ms`);
    console.log(`   Throughput: ${(result.throughput.average / 1024 / 1024).toFixed(2)} MB/s`);
    console.log(`   Errors: ${result.errors}`);
    console.log(`   Timeouts: ${result.timeouts}`);
    
    if (!validation.passed) {
      console.log(`❌ Budget failures: ${validation.failures.join(', ')}`);
    } else {
      console.log(`✅ All budgets passed!`);
    }
    
    return {
      ...metrics,
      validation,
      rawResult: result,
    };
    
  } catch (error) {
    console.error(`❌ Load test failed for ${endpoint.name}:`, error.message);
    return {
      name: endpoint.name,
      url: endpoint.url,
      error: error.message,
      validation: {
        passed: false,
        failures: [`Test execution failed: ${error.message}`],
      },
    };
  }
}

async function runAllLoadTests() {
  console.log('🚀 Starting Load Tests...\n');
  
  const allResults = [];
  
  for (const endpoint of ENDPOINTS_TO_TEST) {
    const result = await runLoadTest(endpoint);
    allResults.push(result);
    
    // Wait between tests to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 5000));
  }
  
  // Generate summary report
  const summary = {
    timestamp: new Date().toISOString(),
    totalEndpoints: allResults.length,
    passedEndpoints: allResults.filter(r => r.validation.passed).length,
    failedEndpoints: allResults.filter(r => !r.validation.passed).length,
    results: allResults,
    aggregateMetrics: {
      totalRequests: allResults.reduce((sum, r) => sum + (r.requests?.total || 0), 0),
      averageRPS: allResults.reduce((sum, r) => sum + (r.rps || 0), 0) / allResults.length,
      averageLatency: allResults.reduce((sum, r) => sum + (r.latency?.average || 0), 0) / allResults.length,
    },
  };
  
  // Save detailed report
  const reportPath = path.join(__dirname, '..', 'load-test-reports', 'detailed-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(allResults, null, 2));
  
  // Save summary
  const summaryPath = path.join(__dirname, '..', 'load-test-reports', 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log('\n📈 Load Test Summary:');
  console.log(`   Total Endpoints: ${summary.totalEndpoints}`);
  console.log(`   Passed: ${summary.passedEndpoints}`);
  console.log(`   Failed: ${summary.failedEndpoints}`);
  console.log(`   Total Requests: ${summary.aggregateMetrics.totalRequests}`);
  console.log(`   Average RPS: ${summary.aggregateMetrics.averageRPS.toFixed(2)}`);
  console.log(`   Average Latency: ${summary.aggregateMetrics.averageLatency.toFixed(2)}ms`);
  
  if (summary.failedEndpoints > 0) {
    console.log('\n❌ Failed Endpoints:');
    allResults.filter(r => !r.validation.passed).forEach(result => {
      console.log(`   ${result.name}: ${result.validation.failures.join(', ')}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All load tests passed!');
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllLoadTests().catch(error => {
    console.error('❌ Load tests failed:', error);
    process.exit(1);
  });
}

module.exports = { runLoadTest, runAllLoadTests }; 