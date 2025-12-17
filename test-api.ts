async function testPPMPAPI() {
  console.log('Testing PPMP API endpoints...');

  try {
    // First, get a session token by logging in
    const loginResponse = await fetch('http://localhost:3000/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'ppmp.preparer@test.com',
        password: 'password123'
      })
    });

    console.log('Login response status:', loginResponse.status);

    if (!loginResponse.ok) {
      console.log('Login failed, trying direct API test...');

      // Try to test the API directly (might fail due to auth)
      const ppmpListResponse = await fetch('http://localhost:3000/api/ppmp');
      console.log('PPMP list response status:', ppmpListResponse.status);

      if (ppmpListResponse.status === 401) {
        console.log('API requires authentication - this is expected');
      }

      // Test the stats endpoint
      const statsResponse = await fetch('http://localhost:3000/api/ppmp/stats');
      console.log('PPMP stats response status:', statsResponse.status);

      // Test the recent endpoint
      const recentResponse = await fetch('http://localhost:3000/api/ppmp/recent');
      console.log('PPMP recent response status:', recentResponse.status);

      console.log('API endpoints are responding (authentication required)');
    } else {
      console.log('Login successful!');
      const loginData = await loginResponse.json();
      console.log('Login data:', loginData);
    }

  } catch (error) {
    console.error('Error testing API:', error);
  }
}

testPPMPAPI();
