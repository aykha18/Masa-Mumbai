const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function checkPartnerDeliveries() {
  try {
    console.log('🔐 Testing delivery partner deliveries...');

    // Login as delivery partner
    const partnerLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'sunil@gmail.com',
      password: 'aykha123'
    });

    console.log('✅ Delivery partner login successful');
    const token = partnerLogin.data.token;

    // Get deliveries
    const deliveriesResponse = await axios.get(`${API_BASE}/api/delivery-partners/deliveries`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`📦 Deliveries found: ${deliveriesResponse.data.length}`);

    deliveriesResponse.data.forEach((order, index) => {
      console.log(`${index + 1}. Order ${order.id}: Status=${order.status}, DeliveryStatus=${order.deliveryStatus}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

checkPartnerDeliveries();