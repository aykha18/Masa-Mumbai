const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function assignPendingOrders() {
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

    // Find orders that need assignment (status: 'Confirmed' or similar, no deliveryPartnerId)
    const pendingOrders = ordersResponse.data.filter(order =>
      !order.deliveryPartnerId &&
      ['Confirmed', 'Preparing', 'Ready for Pickup'].includes(order.status)
    );

    console.log('⏳ Pending orders for assignment:', pendingOrders.length);

    if (pendingOrders.length === 0) {
      console.log('✅ No pending orders to assign');
      return;
    }

    // Get available delivery partners
    const partnersResponse = await axios.get(`${API_BASE}/api/delivery-partners`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const availablePartner = partnersResponse.data.find(p => p.isAvailable && p.isActive);

    if (!availablePartner) {
      console.log('❌ No available delivery partners found');
      return;
    }

    console.log('🚚 Assigning to partner:', availablePartner.user.name);

    // Assign each pending order to the partner
    for (const order of pendingOrders) {
      try {
        // Update order status to assign to partner
        await axios.put(`${API_BASE}/api/orders/${order.id}`, {
          deliveryPartnerId: availablePartner.id,
          deliveryStatus: 'assigned',
          status: 'Preparing' // Update order status
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log(`✅ Assigned order ${order.id} to ${availablePartner.user.name}`);
      } catch (error) {
        console.error(`❌ Failed to assign order ${order.id}:`, error.response?.data?.message || error.message);
      }
    }

    console.log('🎉 Order assignment completed!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

assignPendingOrders();