module.exports = {
  e2e: {
    baseUrl: 'http://localhost:3000',
    pageLoadTimeout: 120000,
    defaultCommandTimeout: 10000,
    retries: {
      runMode: 2,
      openMode: 1
    }
  },
}; 