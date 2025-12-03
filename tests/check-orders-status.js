const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function checkOrdersStatus() {
  try {
    console.log('🔐 Logging in as admin...');

    // Login as admin
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });

    const token = adminLogin.data.token;
    console.log('✅ Admin login successful');

    // Get all orders
    const ordersResponse = await axios.get(`${API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📦 Total orders:', ordersResponse.data.length);

    ordersResponse.data.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order.id}: Status=${order.status}, DeliveryPartner=${order.deliveryPartnerId || 'None'}, DeliveryStatus=${order.deliveryStatus || 'None'}`);
    });

    // Count pending orders
    const pendingOrders = ordersResponse.data.filter(order =>
      !order.deliveryPartnerId &&
      ['Confirmed', 'Preparing', 'Ready for Pickup', 'Guest Order'].includes(order.status)
    );

    console.log(`⏳ Orders needing assignment: ${pendingOrders.length}`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

checkOrdersStatus();