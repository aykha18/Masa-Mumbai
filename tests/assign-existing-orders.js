const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function assignExistingOrders() {
  try {
    console.log('🔐 Logging in as admin...');

    // Login as admin
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });

    const token = adminLogin.data.token;
    console.log('✅ Admin login successful');

    // Get analytics stats to see total orders
    const statsResponse = await axios.get(`${API_BASE}/api/analytics/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log(`📦 Total orders in system: ${statsResponse.data.totalOrders}`);

    // Since we can't directly query all orders, let's try to trigger reassignment
    // by creating a dummy order and then deleting it, which should trigger the assignment logic
    // Actually, let me try a different approach - let's check if there's a way to manually assign

    // For now, let's create a simple order to test if auto-assignment works
    console.log('🧪 Testing auto-assignment with a new order...');

    // First, let's get available delivery slots
    const slotsResponse = await axios.get(`${API_BASE}/api/delivery-slots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (slotsResponse.data.length === 0) {
      console.log('❌ No delivery slots available');
      return;
    }

    const testSlot = slotsResponse.data[0];
    console.log(`📅 Using delivery slot: ${testSlot.name}`);

    // Create a test order as admin
    const testOrder = {
      deliverySlotId: testSlot.id,
      addressId: null, // This will fail, but let's see
      paymentMethod: 'cod'
    };

    try {
      const orderResponse = await axios.post(`${API_BASE}/api/orders`, testOrder, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Test order created, auto-assignment should have triggered');
    } catch (error) {
      console.log('Expected error (no cart):', error.response?.data?.message);
    }

    // Now check if the delivery partner has any deliveries
    const partnersResponse = await axios.get(`${API_BASE}/api/delivery-partners`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('👥 Delivery partners:');
    partnersResponse.data.forEach(partner => {
      console.log(`- ${partner.user.name}: ${partner.totalDeliveries} deliveries`);
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

assignExistingOrders();