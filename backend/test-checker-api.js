// Test script to verify checker API endpoints
const axios = require('axios');

const DASHBOARD_API = 'http://localhost:5000/api/urls';

async function testIntegration() {
  console.log('🧪 Testing Checker API Integration\n');

  // Test 1: Get all domains
  console.log('📋 Test 1: GET /api/urls');
  try {
    const response = await axios.get(DASHBOARD_API);
    console.log('✅ SUCCESS - Got domains:');
    console.log(JSON.stringify(response.data, null, 2));
    
    if (response.data.length === 0) {
      console.log('⚠️  No domains found. Add some domains in the dashboard first.');
      return;
    }

    // Test 2: Update status to blocked
    const testDomain = response.data[0];
    console.log(`\n🔴 Test 2: POST /api/urls/update (blocked)`);
    console.log(`Testing with domain: ${testDomain.Domain}`);
    
    const blockedResponse = await axios.post(`${DASHBOARD_API}/update`, {
      id: testDomain.id,
      brand: testDomain.brand,
      Domain: testDomain.Domain,
      noto: testDomain.noto,
      scanResult: {
        status: 'blocked'
      }
    });
    console.log('✅ SUCCESS - Domain marked as blocked:');
    console.log(JSON.stringify(blockedResponse.data, null, 2));

    // Wait 2 seconds
    console.log('\n⏳ Waiting 2 seconds...');
    await sleep(2000);

    // Test 3: Update status to accessible
    console.log(`\n🟢 Test 3: POST /api/urls/update (accessible)`);
    const accessibleResponse = await axios.post(`${DASHBOARD_API}/update`, {
      id: testDomain.id,
      brand: testDomain.brand,
      Domain: testDomain.Domain,
      noto: testDomain.noto,
      scanResult: {
        status: 'accessible'
      }
    });
    console.log('✅ SUCCESS - Domain marked as accessible:');
    console.log(JSON.stringify(accessibleResponse.data, null, 2));

    console.log('\n🎉 All tests passed!');
    console.log('✅ Your checking system can now integrate with the dashboard');
    console.log('\n💡 Next steps:');
    console.log('1. Check the dashboard frontend - Nawala column should show updates');
    console.log('2. Implement your checking logic in your checker system');
    console.log('3. Use the example code in CHECKER_INTEGRATION.md');

  } catch (error) {
    console.error('❌ TEST FAILED:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure backend server is running (npm run dev)');
    console.log('2. Check if MongoDB is running');
    console.log('3. Verify domains exist in the dashboard');
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

testIntegration();
