const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function testFrontendLogin() {
  try {
    console.log('🔐 Testing Frontend Login Simulation...');

    // Test with admin credentials
    const res = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });

    console.log('✅ Login successful!');
    console.log('👤 User:', res.data.user.name);
    console.log('🎭 Role:', res.data.user.role);
    console.log('🔑 Token length:', res.data.token.length);

  } catch (error) {
    console.error('❌ Login failed:', error.response?.data?.message || error.message);
    console.error('📊 Status:', error.response?.status);
    console.error('📄 Full response:', error.response?.data);
  }
}

testFrontendLogin();