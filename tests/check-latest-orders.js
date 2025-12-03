const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function checkLatestOrders() {
  try {
    console.log('🔍 Checking Latest Orders and Assignments...\n');

    // Login as admin to see all orders
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });

    const token = adminLogin.data.token;

    // Get all orders
    const ordersResponse = await axios.get(`${API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`📦 Total Orders: ${ordersResponse.data.length}\n`);

    // Show last 5 orders with assignment status
    const latestOrders = ordersResponse.data.slice(-5).reverse();

    latestOrders.forEach((order, index) => {
      console.log(`${index + 1}. Order #${order.id}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Delivery Status: ${order.deliveryStatus || 'Not assigned'}`);
      console.log(`   Assigned to Partner: ${order.deliveryPartnerId || 'None'}`);
      console.log(`   Created: ${new Date(order.createdAt).toLocaleString()}`);
      console.log('');
    });

    // Check delivery partners
    const partnersResponse = await axios.get(`${API_BASE}/api/delivery-partners`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`👥 Delivery Partners: ${partnersResponse.data.length}`);
    partnersResponse.data.forEach(partner => {
      console.log(`   - ${partner.user.name} (ID: ${partner.id}): ${partner.isAvailable ? 'Available' : 'Unavailable'}, Rating: ${partner.rating}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

checkLatestOrders();