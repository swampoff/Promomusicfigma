#!/usr/bin/env node

/**
 * PROMO.MUSIC API TESTER
 * Node.js script для автоматического тестирования всех API endpoints
 * 
 * Usage:
 *   node test-api.mjs
 * 
 * Environment variables:
 *   PROJECT_ID - Supabase project ID
 *   AUTH_TOKEN - JWT токен авторизации
 */

import https from 'https';

// =====================================================
// CONFIGURATION
// =====================================================

const CONFIG = {
  projectId: process.env.PROJECT_ID || '',
  authToken: process.env.AUTH_TOKEN || '',
  apiBase: '',
  timeout: 10000, // 10 seconds
};

// Auto-generate API base URL
if (CONFIG.projectId) {
  CONFIG.apiBase = `https://${CONFIG.projectId}.supabase.co/functions/v1/make-server-84730125`;
}

// =====================================================
// COLORS FOR TERMINAL OUTPUT
// =====================================================

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
};

// =====================================================
// STATE
// =====================================================

let stats = {
  passed: 0,
  failed: 0,
  total: 0,
  startTime: Date.now(),
};

const testResults = [];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

function log(message, color = 'white') {
  console.log(colors[color] + message + colors.reset);
}

function logSection(title) {
  console.log('\n' + colors.bright + colors.cyan + '═'.repeat(60) + colors.reset);
  console.log(colors.bright + colors.cyan + title + colors.reset);
  console.log(colors.bright + colors.cyan + '═'.repeat(60) + colors.reset + '\n');
}

function formatTime(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function makeRequest(method, path, body = null, requireAuth = true) {
  return new Promise((resolve, reject) => {
    const url = new URL(CONFIG.apiBase + path);
    
    const options = {
      method,
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: CONFIG.timeout,
    };
    
    if (requireAuth && CONFIG.authToken) {
      options.headers['Authorization'] = `Bearer ${CONFIG.authToken}`;
    }
    
    if (body && (method === 'POST' || method === 'PUT')) {
      const bodyStr = JSON.stringify(body);
      options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    }
    
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: parsed,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: { error: 'Invalid JSON response', raw: data },
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (body && (method === 'POST' || method === 'PUT')) {
      req.write(JSON.stringify(body));
    }
    
    req.end();
  });
}

// =====================================================
// TEST RUNNER
// =====================================================

async function runTest(name, method, endpoint, body = null, options = {}) {
  const {
    requireAuth = true,
    expectStatus = 200,
    expectError = false,
    validateResponse = null,
  } = options;
  
  stats.total++;
  
  const testNum = stats.total.toString().padStart(3, '0');
  process.stdout.write(colors.dim + `[${testNum}] ` + colors.reset);
  process.stdout.write(colors.blue + method.padEnd(6) + colors.reset);
  process.stdout.write(colors.dim + endpoint + colors.reset);
  process.stdout.write(' ... ');
  
  const startTime = Date.now();
  
  try {
    const response = await makeRequest(method, endpoint, body, requireAuth);
    const endTime = Date.now();
    const time = endTime - startTime;
    
    const result = {
      name,
      method,
      endpoint,
      status: response.status,
      time,
      success: false,
      error: null,
      response: response.data,
    };
    
    // Check if status matches expectation
    const statusOk = response.status === expectStatus;
    
    // Check if expecting error
    const errorOk = expectError ? (response.data.error !== undefined) : true;
    
    // Custom validation
    let validationOk = true;
    if (validateResponse) {
      try {
        validationOk = validateResponse(response.data);
      } catch (e) {
        validationOk = false;
        result.error = `Validation failed: ${e.message}`;
      }
    }
    
    result.success = statusOk && errorOk && validationOk;
    
    if (result.success) {
      stats.passed++;
      console.log(colors.green + '✓ PASS' + colors.reset + colors.dim + ` (${formatTime(time)})` + colors.reset);
    } else {
      stats.failed++;
      console.log(colors.red + '✗ FAIL' + colors.reset + colors.dim + ` (${formatTime(time)})` + colors.reset);
      
      if (!statusOk) {
        console.log(colors.red + `  Expected status ${expectStatus}, got ${response.status}` + colors.reset);
      }
      
      if (!errorOk) {
        console.log(colors.red + `  Expected error in response` + colors.reset);
      }
      
      if (!validationOk && result.error) {
        console.log(colors.red + `  ${result.error}` + colors.reset);
      }
      
      if (response.data.error) {
        console.log(colors.yellow + `  Error: ${response.data.error}` + colors.reset);
      }
    }
    
    testResults.push(result);
    return result;
    
  } catch (error) {
    const endTime = Date.now();
    const time = endTime - startTime;
    
    stats.failed++;
    console.log(colors.red + '✗ ERROR' + colors.reset + colors.dim + ` (${formatTime(time)})` + colors.reset);
    console.log(colors.red + `  ${error.message}` + colors.reset);
    
    const result = {
      name,
      method,
      endpoint,
      status: 0,
      time,
      success: false,
      error: error.message,
      response: null,
    };
    
    testResults.push(result);
    return result;
  }
}

// =====================================================
// TEST SUITES
// =====================================================

async function testHealthCheck() {
  logSection('🏥 HEALTH CHECK');
  
  await runTest(
    'Server Health',
    'GET',
    '/health',
    null,
    {
      requireAuth: false,
      expectStatus: 200,
      validateResponse: (data) => data.status === 'ok',
    }
  );
}

async function testRadioAPI() {
  logSection('📻 RADIO API TESTS');
  
  // Analytics
  await runTest(
    'Radio Analytics Overview',
    'GET',
    '/api/radio/analytics/overview?period=month',
    null,
    {
      expectStatus: 200,
      validateResponse: (data) => data.success && data.data,
    }
  );
  
  await runTest(
    'Radio Revenue Chart',
    'GET',
    '/api/radio/analytics/revenue?period=week',
    null,
    { expectStatus: 200 }
  );
  
  // Finance
  await runTest(
    'Radio Balance',
    'GET',
    '/api/radio/finance/balance',
    null,
    {
      expectStatus: 200,
      validateResponse: (data) => data.success && typeof data.balance === 'number',
    }
  );
  
  await runTest(
    'Radio Transactions',
    'GET',
    '/api/radio/finance/transactions?limit=10&offset=0',
    null,
    { expectStatus: 200 }
  );
  
  // Withdrawal - Validation Tests (expect errors)
  await runTest(
    'Withdrawal: Amount below minimum (Zod validation)',
    'POST',
    '/api/radio/finance/withdrawal',
    {
      amount: 500, // Below 1000
      paymentMethod: 'bank_transfer',
    },
    {
      expectStatus: 400,
      expectError: true,
    }
  );
  
  await runTest(
    'Withdrawal: Invalid payment method (Zod validation)',
    'POST',
    '/api/radio/finance/withdrawal',
    {
      amount: 5000,
      paymentMethod: 'crypto', // Invalid enum
    },
    {
      expectStatus: 400,
      expectError: true,
    }
  );
  
  // Ad Slots
  await runTest(
    'Radio Ad Slots List',
    'GET',
    '/api/radio/ad-slots/list',
    null,
    { expectStatus: 200 }
  );
  
  await runTest(
    'Create Ad Slot: Invalid type (Zod validation)',
    'POST',
    '/api/radio/ad-slots/create',
    {
      slotType: 'slot_90sec', // Invalid
      timeSlot: 'morning',
      price: 3000,
      duration: 15,
    },
    {
      expectStatus: 400,
      expectError: true,
    }
  );
  
  // Rotation Packages
  await runTest(
    'Radio Rotation Packages',
    'GET',
    '/api/radio/rotation-packages/list',
    null,
    { expectStatus: 200 }
  );
  
  // Orders
  await runTest(
    'Radio Orders List',
    'GET',
    '/api/radio/orders/list',
    null,
    { expectStatus: 200 }
  );
}

async function testVenueAPI() {
  logSection('🏢 VENUE API TESTS');
  
  // Analytics
  await runTest(
    'Venue Analytics Overview',
    'GET',
    '/api/venue/analytics/overview?period=month',
    null,
    {
      expectStatus: 200,
      validateResponse: (data) => data.success && data.data,
    }
  );
  
  await runTest(
    'Venue Campaigns',
    'GET',
    '/api/venue/analytics/campaigns',
    null,
    { expectStatus: 200 }
  );
  
  await runTest(
    'Venue Spending Chart',
    'GET',
    '/api/venue/analytics/spending?period=month',
    null,
    { expectStatus: 200 }
  );
  
  await runTest(
    'Venue ROI Analytics',
    'GET',
    '/api/venue/analytics/roi',
    null,
    { expectStatus: 200 }
  );
  
  await runTest(
    'Venue Radio Comparison',
    'GET',
    '/api/venue/analytics/radio-compare',
    null,
    { expectStatus: 200 }
  );
  
  // Export - Validation Tests
  await runTest(
    'Export: Invalid format (Zod validation)',
    'POST',
    '/api/venue/analytics/export',
    {
      format: 'xml', // Invalid
      period: 'month',
    },
    {
      expectStatus: 400,
      expectError: true,
    }
  );
  
  await runTest(
    'Export: Valid PDF request',
    'POST',
    '/api/venue/analytics/export',
    {
      format: 'pdf',
      period: 'month',
      includeGraphs: true,
    },
    { expectStatus: 200 }
  );
  
  // Profile
  await runTest(
    'Venue Get Profile',
    'GET',
    '/api/venue/profile',
    null,
    { expectStatus: 200 }
  );
  
  await runTest(
    'Update Profile: Invalid URL (Zod validation)',
    'PUT',
    '/api/venue/profile',
    {
      venueName: 'Test Venue',
      website: 'not-a-url', // Invalid URL
    },
    {
      expectStatus: 400,
      expectError: true,
    }
  );
}

async function testElevenLabsAPI() {
  logSection('🎙️ ELEVENLABS API TESTS');
  
  await runTest(
    'Get Voices',
    'GET',
    '/api/elevenlabs/voices',
    null,
    {
      requireAuth: false,
      expectStatus: 200,
    }
  );
}

// =====================================================
// MAIN EXECUTION
// =====================================================

async function main() {
  console.clear();
  
  log('╔════════════════════════════════════════════════════════════╗', 'cyan');
  log('║                                                            ║', 'cyan');
  log('║           🧪 PROMO.MUSIC API TESTER v1.0                  ║', 'cyan');
  log('║                                                            ║', 'cyan');
  log('╚════════════════════════════════════════════════════════════╝', 'cyan');
  
  console.log('');
  
  // Check configuration
  if (!CONFIG.projectId) {
    log('❌ ERROR: PROJECT_ID not set!', 'red');
    log('   Set environment variable: export PROJECT_ID=your-project-id', 'yellow');
    process.exit(1);
  }
  
  if (!CONFIG.authToken) {
    log('⚠️  WARNING: AUTH_TOKEN not set!', 'yellow');
    log('   Some tests will fail. Get token from localStorage after login.', 'yellow');
    console.log('');
  }
  
  log('📋 Configuration:', 'cyan');
  log(`   API Base: ${CONFIG.apiBase}`, 'dim');
  log(`   Auth Token: ${CONFIG.authToken ? '***' + CONFIG.authToken.slice(-10) : 'Not set'}`, 'dim');
  log(`   Timeout: ${CONFIG.timeout}ms`, 'dim');
  
  // Run tests
  await testHealthCheck();
  await testRadioAPI();
  await testVenueAPI();
  await testElevenLabsAPI();
  
  // Final summary
  const totalTime = Date.now() - stats.startTime;
  
  logSection('📊 FINAL RESULTS');
  
  log(`Total Tests:    ${stats.total}`, 'white');
  log(`Passed:         ${stats.passed}`, stats.passed > 0 ? 'green' : 'dim');
  log(`Failed:         ${stats.failed}`, stats.failed > 0 ? 'red' : 'dim');
  log(`Total Time:     ${formatTime(totalTime)}`, 'cyan');
  
  const passRate = stats.total > 0 ? ((stats.passed / stats.total) * 100).toFixed(1) : 0;
  log(`Pass Rate:      ${passRate}%`, passRate >= 80 ? 'green' : 'red');
  
  console.log('');
  
  if (stats.failed === 0) {
    log('🎉 ALL TESTS PASSED!', 'green');
  } else {
    log(`⚠️  ${stats.failed} tests failed - check output above`, 'yellow');
  }
  
  console.log('');
  
  // Exit with appropriate code
  process.exit(stats.failed > 0 ? 1 : 0);
}

// Run
main().catch((error) => {
  log(`\n❌ FATAL ERROR: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
