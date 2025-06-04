/**
 * frontend/scripts/lighthouse-test.js
 * Lighthouse performance testing script for automated auditing
 */
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

// Performance budgets
const PERFORMANCE_BUDGETS = {
  performance: 90,
  accessibility: 90,
  'best-practices': 90,
  seo: 90,
  pwa: 80,
  // Core Web Vitals
  'first-contentful-paint': 2000,
  'largest-contentful-paint': 3000,
  'cumulative-layout-shift': 0.1,
  'first-input-delay': 100,
};

// Pages to test
const PAGES_TO_TEST = [
  { name: 'HomePage', url: 'http://localhost:3000/' },
  { name: 'LoginPage', url: 'http://localhost:3000/login' },
  { name: 'DashboardPage', url: 'http://localhost:3000/dashboard' },
];

async function runLighthouseTest(url, name) {
  console.log(`\n🔍 Running Lighthouse audit for ${name}...`);
  
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  
  const options = {
    logLevel: 'info',
    output: 'json',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo', 'pwa'],
    port: chrome.port,
  };
  
  try {
    const runnerResult = await lighthouse(url, options);
    
    // Extract scores
    const scores = {
      performance: Math.round(runnerResult.lhr.categories.performance.score * 100),
      accessibility: Math.round(runnerResult.lhr.categories.accessibility.score * 100),
      'best-practices': Math.round(runnerResult.lhr.categories['best-practices'].score * 100),
      seo: Math.round(runnerResult.lhr.categories.seo.score * 100),
      pwa: Math.round(runnerResult.lhr.categories.pwa.score * 100),
    };
    
    // Extract Core Web Vitals
    const audits = runnerResult.lhr.audits;
    const webVitals = {
      'first-contentful-paint': audits['first-contentful-paint']?.numericValue || 0,
      'largest-contentful-paint': audits['largest-contentful-paint']?.numericValue || 0,
      'cumulative-layout-shift': audits['cumulative-layout-shift']?.numericValue || 0,
      'first-input-delay': audits['max-potential-fid']?.numericValue || 0,
    };
    
    // Validate against budgets
    const results = {
      name,
      url,
      scores,
      webVitals,
      passed: true,
      failures: [],
    };
    
    // Check category scores
    Object.keys(scores).forEach(category => {
      if (scores[category] < PERFORMANCE_BUDGETS[category]) {
        results.passed = false;
        results.failures.push(`${category}: ${scores[category]} < ${PERFORMANCE_BUDGETS[category]}`);
      }
    });
    
    // Check Core Web Vitals
    Object.keys(webVitals).forEach(metric => {
      if (webVitals[metric] > PERFORMANCE_BUDGETS[metric]) {
        results.passed = false;
        results.failures.push(`${metric}: ${webVitals[metric]} > ${PERFORMANCE_BUDGETS[metric]}`);
      }
    });
    
    // Save detailed report
    const reportPath = path.join(__dirname, '..', 'lighthouse-reports', `${name}-report.json`);
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(runnerResult.lhr, null, 2));
    
    console.log(`📊 ${name} Results:`);
    console.log(`   Performance: ${scores.performance}/100`);
    console.log(`   Accessibility: ${scores.accessibility}/100`);
    console.log(`   Best Practices: ${scores['best-practices']}/100`);
    console.log(`   SEO: ${scores.seo}/100`);
    console.log(`   PWA: ${scores.pwa}/100`);
    console.log(`   FCP: ${webVitals['first-contentful-paint']}ms`);
    console.log(`   LCP: ${webVitals['largest-contentful-paint']}ms`);
    console.log(`   CLS: ${webVitals['cumulative-layout-shift']}`);
    console.log(`   FID: ${webVitals['first-input-delay']}ms`);
    
    if (!results.passed) {
      console.log(`❌ Budget failures: ${results.failures.join(', ')}`);
    } else {
      console.log(`✅ All budgets passed!`);
    }
    
    return results;
    
  } finally {
    await chrome.kill();
  }
}

async function runAllTests() {
  console.log('🚀 Starting Lighthouse Performance Tests...\n');
  
  const allResults = [];
  
  for (const page of PAGES_TO_TEST) {
    try {
      const result = await runLighthouseTest(page.url, page.name);
      allResults.push(result);
    } catch (error) {
      console.error(`❌ Error testing ${page.name}:`, error.message);
      allResults.push({
        name: page.name,
        url: page.url,
        passed: false,
        error: error.message,
      });
    }
  }
  
  // Generate summary report
  const summary = {
    timestamp: new Date().toISOString(),
    totalPages: allResults.length,
    passedPages: allResults.filter(r => r.passed).length,
    failedPages: allResults.filter(r => !r.passed).length,
    results: allResults,
  };
  
  // Save summary
  const summaryPath = path.join(__dirname, '..', 'lighthouse-reports', 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
  
  console.log('\n📈 Performance Test Summary:');
  console.log(`   Total Pages: ${summary.totalPages}`);
  console.log(`   Passed: ${summary.passedPages}`);
  console.log(`   Failed: ${summary.failedPages}`);
  
  if (summary.failedPages > 0) {
    console.log('\n❌ Failed Pages:');
    allResults.filter(r => !r.passed).forEach(result => {
      console.log(`   ${result.name}: ${result.failures?.join(', ') || result.error}`);
    });
    process.exit(1);
  } else {
    console.log('\n✅ All performance tests passed!');
  }
}

// Run tests if called directly
if (require.main === module) {
  runAllTests().catch(error => {
    console.error('❌ Lighthouse tests failed:', error);
    process.exit(1);
  });
}

module.exports = { runLighthouseTest, runAllTests }; 