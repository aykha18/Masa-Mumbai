const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function testPartnerDeliveries() {
  try {
    console.log('🚚 Testing Partner Deliveries...\n');

    // Test both partners
    const partners = [
      { email: 'Sunil@gmail.com', name: 'Sunil Kumar (Partner 2)' },
      { email: 'sunil@gmail.com', name: 'Sunil (Partner 1)' }
    ];

    for (const partner of partners) {
      console.log(`\n👤 Testing ${partner.name}...`);

      try {
        // Login as partner
        const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
          email: partner.email,
          password: 'aykha123'
        });

        const token = loginResponse.data.token;
        console.log(`✅ Logged in as ${loginResponse.data.user.name}`);

        // Get deliveries
        const deliveriesResponse = await axios.get(`${API_BASE}/api/delivery-partners/deliveries`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`📦 Deliveries found: ${deliveriesResponse.data.length}`);

        if (deliveriesResponse.data.length > 0) {
          console.log('📋 Delivery Details:');
          deliveriesResponse.data.forEach((delivery, index) => {
            console.log(`   ${index + 1}. Order #${delivery.id} - Status: ${delivery.deliveryStatus} - Total: ₹${delivery.total}`);
          });
        } else {
          console.log('❌ No deliveries assigned');
        }

      } catch (loginError) {
        console.log(`❌ Failed to login as ${partner.name}:`, loginError.response?.data?.message || loginError.message);
      }
    }

    // Also check all orders and their assignments
    console.log('\n📊 Checking All Recent Orders...');
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });

    const adminToken = adminLogin.data.token;
    const ordersResponse = await axios.get(`${API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log(`Total orders: ${ordersResponse.data.length}`);
    const recentOrders = ordersResponse.data.slice(-5);
    recentOrders.forEach(order => {
      console.log(`Order #${order.id}: Status=${order.status}, DeliveryStatus=${order.deliveryStatus || 'none'}, Partner=${order.deliveryPartnerId || 'none'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

testPartnerDeliveries();