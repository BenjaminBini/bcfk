#!/usr/bin/env node
/**
 * Test Runner Script for Absence System E2E Tests
 *
 * This script helps run absence system tests with proper setup
 * and provides feedback on test results
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const TEST_TYPES = {
  all: 'tests/',
  smoke: 'tests/smoke.spec.js',
  absence: 'tests/absence-system.spec.js',
  api: 'tests/absence-api.spec.js'
};

const SERVER_CHECK_URL = 'http://localhost:5173';
const SERVER_CHECK_TIMEOUT = 30000;

/**
 * Check if development server is running
 */
async function checkServerRunning() {
  try {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(SERVER_CHECK_URL, { timeout: 5000 });
    return response.ok;
  } catch (error) {
    return false;
  }
}

/**
 * Wait for server to be ready
 */
async function waitForServer() {
  console.log('🔍 Checking if development server is running...');

  const startTime = Date.now();
  while (Date.now() - startTime < SERVER_CHECK_TIMEOUT) {
    if (await checkServerRunning()) {
      console.log('✅ Development server is ready');
      return true;
    }
    console.log('⏳ Waiting for server...');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  return false;
}

/**
 * Run Playwright tests
 */
function runTests(testType = 'all', options = {}) {
  return new Promise((resolve, reject) => {
    const testPath = TEST_TYPES[testType] || TEST_TYPES.all;

    const args = ['test', testPath];

    // Add options
    if (options.debug) args.push('--debug');
    if (options.headed) args.push('--headed');
    if (options.ui) args.push('--ui');
    if (options.reporter) args.push('--reporter', options.reporter);

    console.log(`🧪 Running tests: npx playwright ${args.join(' ')}`);

    const child = spawn('npx', ['playwright', ...args], {
      stdio: 'inherit',
      shell: true
    });

    child.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Tests completed successfully');
        resolve();
      } else {
        console.log(`❌ Tests failed with exit code ${code}`);
        reject(new Error(`Tests failed with exit code ${code}`));
      }
    });

    child.on('error', (error) => {
      console.error('❌ Error running tests:', error);
      reject(error);
    });
  });
}

/**
 * Display help information
 */
function displayHelp() {
  console.log(`
🧪 Absence System E2E Test Runner

Usage: node run-absence-tests.js [test-type] [options]

Test Types:
  smoke     - Quick smoke tests to verify basic functionality
  absence   - Full absence system functionality tests
  api       - API integration tests
  all       - All tests (default)

Options:
  --debug   - Run tests in debug mode
  --headed  - Run tests in headed mode (visible browser)
  --ui      - Run tests in UI mode
  --help    - Show this help

Examples:
  node run-absence-tests.js smoke
  node run-absence-tests.js absence --headed
  node run-absence-tests.js all --debug

Prerequisites:
  1. Start development server: npm run dev
  2. Ensure server is running at http://localhost:5173

Test Files:
  - tests/smoke.spec.js           - Basic functionality checks
  - tests/absence-system.spec.js  - Complete absence workflow tests
  - tests/absence-api.spec.js     - API integration tests
  - tests/helpers/test-helpers.js - Test utilities and helpers
`);
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);

  // Check for help
  if (args.includes('--help')) {
    displayHelp();
    return;
  }

  // Parse arguments
  const testType = args.find(arg => !arg.startsWith('--')) || 'all';
  const options = {
    debug: args.includes('--debug'),
    headed: args.includes('--headed'),
    ui: args.includes('--ui'),
    reporter: args.includes('--reporter') ? args[args.indexOf('--reporter') + 1] : null
  };

  console.log('🚀 Starting Absence System E2E Tests');
  console.log('=' .repeat(50));

  // Check if test files exist
  const testPath = TEST_TYPES[testType];
  if (!testPath) {
    console.error(`❌ Unknown test type: ${testType}`);
    console.log('Available types:', Object.keys(TEST_TYPES).join(', '));
    process.exit(1);
  }

  const fullTestPath = path.join(__dirname, testPath);
  if (!fs.existsSync(fullTestPath)) {
    console.error(`❌ Test file not found: ${fullTestPath}`);
    process.exit(1);
  }

  try {
    // Check server availability
    const serverReady = await waitForServer();
    if (!serverReady) {
      console.error('❌ Development server is not running or not accessible');
      console.log('Please start the server with: npm run dev');
      process.exit(1);
    }

    // Run tests
    await runTests(testType, options);

    console.log('=' .repeat(50));
    console.log('🎉 All tests completed successfully!');

    if (!options.ui && !options.debug) {
      console.log('📊 View detailed results: npm run test:report');
    }

  } catch (error) {
    console.error('💥 Test execution failed:', error.message);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n🛑 Test execution interrupted');
  process.exit(1);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Test execution terminated');
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('💥 Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { runTests, waitForServer, checkServerRunning };