const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function testAdminLogin() {
  try {
    console.log('🔐 Testing Admin Login...');

    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });

    console.log('✅ Admin Login successful!');
    console.log('👤 User:', loginResponse.data.user.name);
    console.log('🎭 Role:', loginResponse.data.user.role);
    console.log('🔑 Token:', loginResponse.data.token.substring(0, 20) + '...');

    const token = loginResponse.data.token;

    // Test admin endpoints
    console.log('\n📊 Testing Admin Endpoints...');

    // Test delivery partners endpoint
    const partnersResponse = await axios.get(`${API_BASE}/api/delivery-partners`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Delivery partners endpoint works!');
    console.log('👥 Number of delivery partners:', partnersResponse.data.length);

    // Test orders endpoint
    const ordersResponse = await axios.get(`${API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Orders endpoint works!');
    console.log('📦 Number of orders:', ordersResponse.data.length);

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Data:', error.response.data);
    }
  }
}

testAdminLogin();