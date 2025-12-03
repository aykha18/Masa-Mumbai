const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function checkAllOrdersAdmin() {
  try {
    console.log('🔐 Logging in as admin...');

    // Login as admin
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });

    const token = adminLogin.data.token;
    console.log('✅ Admin login successful');

    // Get analytics stats
    const statsResponse = await axios.get(`${API_BASE}/api/analytics/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`📊 Total orders: ${statsResponse.data.totalOrders}`);

    // Get delivery partners
    const partnersResponse = await axios.get(`${API_BASE}/api/delivery-partners`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`👥 Delivery partners: ${partnersResponse.data.length}`);
    partnersResponse.data.forEach(partner => {
      console.log(`- ${partner.user.name} (ID: ${partner.id}): Available=${partner.isAvailable}, Deliveries=${partner.totalDeliveries}`);
    });

    // Try to get a sample order to see structure
    // Since we can't get all orders, let's check if there are any orders assigned to Sunil's partner
    console.log('\n🔍 Checking if Sunil has deliveries...');

    // Login as Sunil and check deliveries
    const sunilLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'sunil@gmail.com',
      password: 'aykha123'
    });

    const sunilToken = sunilLogin.data.token;

    const deliveriesResponse = await axios.get(`${API_BASE}/api/delivery-partners/deliveries`, {
      headers: { Authorization: `Bearer ${sunilToken}` }
    });

    console.log(`📦 Sunil's deliveries: ${deliveriesResponse.data.length}`);

    if (deliveriesResponse.data.length > 0) {
      console.log('✅ Sunil has deliveries!');
      deliveriesResponse.data.forEach((order, index) => {
        console.log(`${index + 1}. Order ${order.id}: ${order.status}`);
      });
    } else {
      console.log('❌ Sunil has no deliveries');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

checkAllOrdersAdmin();