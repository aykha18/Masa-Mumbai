const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function testOrderCreation() {
  try {
    console.log('🛒 Testing Order Creation with Auto-Assignment...\n');

    // Login as admin
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });
    const token = adminLogin.data.token;
    console.log('✅ Admin logged in');

    // Add product to cart
    console.log('📦 Adding product to cart...');
    await axios.post(`${API_BASE}/api/cart`, {
      productId: 5, // Mackerel
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Get delivery slots
    const slotsResponse = await axios.get(`${API_BASE}/api/delivery-slots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (slotsResponse.data.length === 0) {
      console.log('❌ No delivery slots available');
      return;
    }

    // Create address
    console.log('📍 Creating delivery address...');
    const addressResponse = await axios.post(`${API_BASE}/api/addresses`, {
      type: 'home',
      name: 'Test Home',
      fullName: 'Admin User',
      phone: '9876543210',
      street: 'Test Street',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    // Create order
    console.log('📋 Creating order (watch backend logs for assignment)...');
    const orderResponse = await axios.post(`${API_BASE}/api/orders`, {
      deliverySlotId: slotsResponse.data[0].id,
      addressId: addressResponse.data.id,
      paymentMethod: 'cod'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Order created successfully!');
    console.log(`📋 Order ID: ${orderResponse.data.id}`);
    console.log(`📊 Status: ${orderResponse.data.status}`);
    console.log(`🚚 Delivery Status: ${orderResponse.data.deliveryStatus || 'Not assigned'}`);
    console.log(`👤 Assigned Partner: ${orderResponse.data.deliveryPartnerId || 'None'}`);

    // Wait a moment for async assignment
    console.log('\n⏳ Waiting 3 seconds for async assignment...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Check final status
    console.log('🔍 Checking final assignment status...');
    const ordersResponse = await axios.get(`${API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const latestOrder = ordersResponse.data[0]; // Most recent
    console.log(`📋 Final Order ID: ${latestOrder.id}`);
    console.log(`📊 Final Status: ${latestOrder.status}`);
    console.log(`🚚 Final Delivery Status: ${latestOrder.deliveryStatus || 'Not assigned'}`);
    console.log(`👤 Final Assigned Partner: ${latestOrder.deliveryPartnerId || 'None'}`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

testOrderCreation();