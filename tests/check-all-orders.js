const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function checkAllOrders() {
  try {
    console.log('🔐 Logging in as admin...');

    // Login as admin
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });

    const token = adminLogin.data.token;
    console.log('✅ Admin login successful');

    // Get analytics stats (this shows total orders)
    const statsResponse = await axios.get(`${API_BASE}/api/analytics/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📊 Analytics Stats:');
    console.log('- Total Orders:', statsResponse.data.totalOrders);
    console.log('- Total Revenue:', statsResponse.data.totalRevenue);

    // Get daily trend to see recent orders
    const dailyTrendResponse = await axios.get(`${API_BASE}/api/analytics/daily-trend`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('\n📅 Recent Daily Orders:');
    dailyTrendResponse.data.slice(-5).forEach(day => {
      console.log(`${day.date}: ${day.orders} orders, ₹${day.revenue}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

checkAllOrders();