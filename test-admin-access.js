// Test Admin Access Script
// Run this in your browser console after logging in

const testAdminAccess = async () => {
  console.log('🔍 Testing Admin Access...\n');
  
  // Step 1: Check for auth token
  const authToken = localStorage.getItem('auth_token');
  
  if (!authToken) {
    console.error('❌ NOT LOGGED IN! No auth_token found in localStorage.');
    console.log('📝 Available localStorage keys:', Object.keys(localStorage));
    return;
  }
  
  console.log('✅ Auth token found in localStorage');
  
  // Parse token
  let token;
  try {
    const parsed = JSON.parse(authToken);
    token = parsed?.access_token || authToken;
  } catch {
    token = authToken;
  }
  
  console.log('🔑 Token (first 50 chars):', token.substring(0, 50) + '...\n');
  
  // Step 2: Test current user endpoint
  console.log('📡 Testing /users/me endpoint...');
  try {
    const userResponse = await fetch('http://localhost:3001/api/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const userData = await userResponse.json();
    console.log('👤 User Response Status:', userResponse.status);
    console.log('👤 User Data:', userData);
    
    if (userResponse.ok) {
      console.log('✅ User authentication WORKS');
      console.log('📋 User Role:', userData.user?.role || 'not specified');
    } else {
      console.error('❌ User authentication FAILED');
      return;
    }
  } catch (error) {
    console.error('❌ Error fetching user:', error);
    return;
  }
  
  console.log('\n' + '='.repeat(50) + '\n');
  
  // Step 3: Test admin endpoints
  const adminEndpoints = [
    '/admin/dashboard/stats',
    '/admin/dashboard/charts?period=7d',
    '/admin/dashboard/top-users?metric=balance_xp&limit=5',
    '/admin/dashboard/activity?limit=10'
  ];
  
  for (const endpoint of adminEndpoints) {
    console.log(`📡 Testing ${endpoint}...`);
    try {
      const response = await fetch(`http://localhost:3001/api/v1${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      console.log(`   Status: ${response.status}`);
      
      if (response.ok) {
        console.log('   ✅ SUCCESS - Data received:', Object.keys(data.data || data));
      } else {
        console.log('   ❌ FAILED - Error:', data.error?.message || data.message);
      }
    } catch (error) {
      console.error('   ❌ ERROR:', error.message);
    }
    console.log('');
  }
  
  console.log('='.repeat(50));
  console.log('🏁 Test Complete!');
};

// Run the test
testAdminAccess();

