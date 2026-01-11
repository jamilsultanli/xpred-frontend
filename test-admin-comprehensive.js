// Comprehensive Admin API Test Script
// Bu skript bütün admin endpointlərini test edir
// Browser console-da işə salın (F12)

const comprehensiveAdminTest = async () => {
  console.log('🚀 COMPREHENSIVE ADMIN API TEST');
  console.log('='.repeat(60));
  
  // Get token
  const authToken = localStorage.getItem('auth_token');
  if (!authToken) {
    console.error('❌ NOT LOGGED IN!');
    return;
  }
  
  let token;
  try {
    const parsed = JSON.parse(authToken);
    token = parsed?.access_token || authToken;
  } catch {
    token = authToken;
  }
  
  console.log('✅ Token found\n');
  
  // Test endpoints
  const tests = [
    {
      name: 'Dashboard Stats',
      endpoint: '/admin/dashboard/stats',
      expectedKeys: ['stats']
    },
    {
      name: 'Dashboard Charts',
      endpoint: '/admin/dashboard/charts?period=7d',
      expectedKeys: ['charts']
    },
    {
      name: 'Top Users',
      endpoint: '/admin/dashboard/top-users?metric=balance_xp&limit=5',
      expectedKeys: ['users']
    },
    {
      name: 'Recent Activity',
      endpoint: '/admin/dashboard/activity?limit=10',
      expectedKeys: ['activity']
    },
    {
      name: 'Users List',
      endpoint: '/admin/users?page=1&limit=10',
      expectedKeys: ['data', 'users', 'pagination']
    },
    {
      name: 'Predictions List',
      endpoint: '/admin/predictions?page=1&limit=10',
      expectedKeys: ['data', 'predictions', 'pagination']
    },
    {
      name: 'Resolution Queue',
      endpoint: '/admin/resolutions/queue?page=1&limit=10',
      expectedKeys: ['data', 'resolutions', 'pagination']
    },
    {
      name: 'Reports',
      endpoint: '/admin/reports?page=1&limit=10',
      expectedKeys: ['data', 'reports', 'pagination']
    },
    {
      name: 'KYC Requests',
      endpoint: '/admin/kyc/requests?page=1&limit=10',
      expectedKeys: ['data', 'requests', 'pagination']
    },
    {
      name: 'Support Tickets',
      endpoint: '/admin/support/tickets?page=1&limit=10',
      expectedKeys: ['data', 'tickets', 'pagination']
    }
  ];
  
  const results = {
    passed: 0,
    failed: 0,
    details: []
  };
  
  for (const test of tests) {
    console.log(`\n📡 Testing: ${test.name}`);
    console.log(`   Endpoint: ${test.endpoint}`);
    
    try {
      const response = await fetch(`http://localhost:3001/api/v1${test.endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (response.ok) {
        const dataKeys = Object.keys(data);
        const hasExpectedKey = test.expectedKeys.some(key => dataKeys.includes(key));
        
        if (hasExpectedKey) {
          console.log('   ✅ SUCCESS');
          console.log('   📊 Response keys:', dataKeys.join(', '));
          
          // Show data details
          test.expectedKeys.forEach(key => {
            if (data[key] !== undefined) {
              if (Array.isArray(data[key])) {
                console.log(`   📝 ${key}: ${data[key].length} items`);
              } else if (typeof data[key] === 'object') {
                console.log(`   📝 ${key}:`, Object.keys(data[key]).join(', '));
              } else {
                console.log(`   📝 ${key}:`, data[key]);
              }
            }
          });
          
          results.passed++;
          results.details.push({ test: test.name, status: 'PASS', data: dataKeys });
        } else {
          console.log('   ⚠️  UNEXPECTED STRUCTURE');
          console.log('   Expected keys:', test.expectedKeys);
          console.log('   Got keys:', dataKeys);
          results.failed++;
          results.details.push({ test: test.name, status: 'UNEXPECTED', data: dataKeys });
        }
      } else {
        console.log(`   ❌ FAILED - Status: ${response.status}`);
        console.log('   Error:', data.error?.message || data.message);
        results.failed++;
        results.details.push({ test: test.name, status: 'FAILED', error: data.error?.message || data.message });
      }
    } catch (error) {
      console.log('   ❌ ERROR:', error.message);
      results.failed++;
      results.details.push({ test: test.name, status: 'ERROR', error: error.message });
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`📈 Success Rate: ${((results.passed / tests.length) * 100).toFixed(1)}%`);
  console.log('\n🔍 Details:');
  
  results.details.forEach((detail, i) => {
    const icon = detail.status === 'PASS' ? '✅' : detail.status === 'UNEXPECTED' ? '⚠️' : '❌';
    console.log(`${i + 1}. ${icon} ${detail.test} - ${detail.status}`);
  });
  
  console.log('\n' + '='.repeat(60));
  console.log('🏁 TEST COMPLETE!');
  
  return results;
};

// Run the test
comprehensiveAdminTest();

