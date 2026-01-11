console.log('🚀 ADMIN PANEL FULL TEST\n' + '='.repeat(60));

// Test all admin endpoints
const testAdminPanel = async () => {
  const token = JSON.parse(localStorage.getItem('auth_token'))?.access_token;
  
  if (!token) {
    console.error('❌ NOT LOGGED IN! Please login first.');
    return;
  }

  const BASE_URL = 'http://localhost:3001/api/v1';
  
  const endpoints = {
    '📊 Dashboard': {
      'Stats': '/admin/dashboard/stats',
      'Charts': '/admin/dashboard/charts?period=7d',
      'Top Users': '/admin/dashboard/top-users?metric=balance_xp&limit=5',
      'Activity': '/admin/dashboard/activity?limit=10'
    },
    '👥 Users': {
      'List': '/admin/users?page=1&limit=10'
    },
    '🔮 Predictions': {
      'List': '/admin/predictions?page=1&limit=10'
    },
    '✅ Resolutions': {
      'Queue': '/admin/resolutions/queue?page=1&limit=10&status=pending'
    },
    '🚩 Reports': {
      'List': '/admin/reports?page=1&limit=10&status=pending'
    },
    '🛡️ KYC': {
      'Requests': '/admin/kyc/requests?page=1&limit=10&status=pending'
    },
    '🎧 Support': {
      'Tickets': '/admin/support/tickets?page=1&limit=10&status=open'
    }
  };

  const results = {
    success: 0,
    failed: 0,
    total: 0,
    details: []
  };

  for (const [category, eps] of Object.entries(endpoints)) {
    console.log(`\n${category}`);
    console.log('-'.repeat(60));
    
    for (const [name, endpoint] of Object.entries(eps)) {
      results.total++;
      
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (response.ok) {
          console.log(`✅ ${name}: SUCCESS`);
          const keys = Object.keys(data);
          console.log(`   Keys: ${keys.join(', ')}`);
          
          // Show data count if available
          for (const key of keys) {
            if (Array.isArray(data[key])) {
              console.log(`   📦 ${key}: ${data[key].length} items`);
            } else if (typeof data[key] === 'object' && data[key] !== null) {
              const subKeys = Object.keys(data[key]);
              if (subKeys.length < 10) {
                console.log(`   📦 ${key}:`, subKeys.join(', '));
              }
            }
          }
          
          results.success++;
          results.details.push({ category, name, status: 'SUCCESS', keys });
        } else {
          console.log(`❌ ${name}: FAILED (${response.status})`);
          console.log(`   Error: ${data.error?.message || data.message || 'Unknown error'}`);
          results.failed++;
          results.details.push({ category, name, status: 'FAILED', error: data.error?.message });
        }
      } catch (error) {
        console.log(`❌ ${name}: ERROR`);
        console.log(`   ${error.message}`);
        results.failed++;
        results.details.push({ category, name, status: 'ERROR', error: error.message });
      }
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total Tests: ${results.total}`);
  console.log(`✅ Success: ${results.success} (${((results.success / results.total) * 100).toFixed(1)}%)`);
  console.log(`❌ Failed: ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%)`);
  
  if (results.success === results.total) {
    console.log('\n🎉🎉🎉 ALL TESTS PASSED! Admin Panel is fully functional! 🎉🎉🎉');
  } else if (results.success > results.total / 2) {
    console.log('\n✅ Most tests passed. Admin Panel is mostly functional.');
  } else {
    console.log('\n⚠️  Many tests failed. Please check the errors above.');
  }

  console.log('\n📋 Detailed Results:');
  console.table(results.details);

  return results;
};

// Run the test
testAdminPanel().then(() => {
  console.log('\n✨ Test complete! Check the admin panel at: http://localhost:3000/admin');
});

