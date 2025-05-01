const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    pageLoadTimeout: 120000,
    defaultCommandTimeout: 10000,
    retries: {
      runMode: 2,
      openMode: 1
    },
    setupNodeEvents(on, config) {
      // e2e testing node events setup goes here
      return config;
    }
  },
  component: {
    devServer: {
      framework: 'react',
      bundler: 'webpack',
    },
    setupNodeEvents(on, config) {
      // component testing node events setup goes here
      return config;
    }
  }
}); 