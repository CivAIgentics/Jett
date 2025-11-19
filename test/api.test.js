/**
 * Simple API Test Suite for Jett
 * Run with: npm test
 */

import http from 'http';

const BASE_URL = 'http://localhost:3000';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let testsPassed = 0;
let testsFailed = 0;

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ statusCode: res.statusCode, headers: res.headers, body: jsonBody });
        } catch (e) {
          resolve({ statusCode: res.statusCode, headers: res.headers, body: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

function assert(condition, message) {
  if (condition) {
    console.log(`${colors.green}✓${colors.reset} ${message}`);
    testsPassed++;
  } else {
    console.log(`${colors.red}✗${colors.reset} ${message}`);
    testsFailed++;
  }
}

async function testHealthEndpoint() {
  console.log(`\n${colors.blue}Testing Health Endpoint${colors.reset}`);
  try {
    const response = await makeRequest('/api/health');
    assert(response.statusCode === 200, 'Health endpoint returns 200 OK');
    assert(response.body.status === 'healthy', 'Health status is "healthy"');
    assert(response.body.service === 'Jett', 'Service name is correct');
    assert(response.body.timestamp !== undefined, 'Timestamp is present');
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Health endpoint failed: ${error.message}`);
    testsFailed++;
  }
}

async function testConfigEndpoint() {
  console.log(`\n${colors.blue}Testing Config Endpoint${colors.reset}`);
  try {
    const response = await makeRequest('/api/config');
    assert(response.statusCode === 200, 'Config endpoint returns 200 OK');
    assert(response.body.appName !== undefined, 'App name is present');
    assert(response.body.anamPersonaId !== undefined, 'ANAM Persona ID is present');
    assert(response.body.features !== undefined, 'Features object is present');
  } catch (error) {
    console.log(`${colors.red}✗${colors.reset} Config endpoint failed: ${error.message}`);
    testsFailed++;
  }
}

async function testElevenLabsSession() {
  console.log(`\n${colors.blue}Testing ElevenLabs Session${colors.reset}`);
  try {
    const response = await makeRequest('/api/conversation/start', 'POST');
    if (response.statusCode === 500) {
      console.log(`${colors.yellow}⚠${colors.reset} ElevenLabs check API key`);
      return;
    }
    assert(response.statusCode === 200, 'Session endpoint returns 200 OK');
    assert(response.body.success === true, 'Success flag is true');
  } catch (error) {
    console.log(`${colors.yellow}⚠${colors.reset} ElevenLabs test skipped`);
  }
}

async function testAnamSession() {
  console.log(`\n${colors.blue}Testing ANAM Session${colors.reset}`);
  try {
    const response = await makeRequest('/api/anam/session', 'POST');
    if (response.statusCode === 500) {
      console.log(`${colors.yellow}⚠${colors.reset} ANAM check API key`);
      return;
    }
    assert(response.statusCode === 200, 'ANAM session endpoint returns 200 OK');
  } catch (error) {
    console.log(`${colors.yellow}⚠${colors.reset} ANAM test skipped`);
  }
}

async function runTests() {
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.blue}  Jett API Test Suite${colors.reset}`);
  console.log(`${colors.blue}═══════════════════════════════════════${colors.reset}\n`);
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  await testHealthEndpoint();
  await testConfigEndpoint();
  await testElevenLabsSession();
  await testAnamSession();
  
  console.log(`\n${colors.blue}═══════════════════════════════════════${colors.reset}`);
  console.log(`${colors.green}Passed:${colors.reset} ${testsPassed}`);
  console.log(`${colors.red}Failed:${colors.reset} ${testsFailed}\n`);
  
  if (testsFailed > 0) process.exit(1);
}

runTests().catch((error) => {
  console.error(`${colors.red}Error:${colors.reset}`, error);
  process.exit(1);
});
