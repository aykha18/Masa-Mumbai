const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function testDeliveryAssignment() {
  try {
    console.log('🔐 Testing delivery assignment...');

    // Login as admin
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });

    const token = adminLogin.data.token;
    console.log('✅ Admin login successful');

    // Create a test address for admin
    console.log('📍 Creating test address...');
    const addressResponse = await axios.post(`${API_BASE}/api/addresses`, {
      type: 'home',
      name: 'Home',
      fullName: 'Admin User',
      phone: '9876543210',
      street: 'Test Street',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Address created');

    // Get available delivery slots
    const slotsResponse = await axios.get(`${API_BASE}/api/delivery-slots`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (slotsResponse.data.length === 0) {
      console.log('❌ No delivery slots available');
      return;
    }

    const testSlot = slotsResponse.data[0];
    console.log(`📅 Using delivery slot: ${testSlot.name}`);

    // Get available products
    const productsResponse = await axios.get(`${API_BASE}/api/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (productsResponse.data.products.length === 0) {
      console.log('❌ No products available');
      return;
    }

    const testProduct = productsResponse.data.products[0];
    console.log(`🛒 Adding product to cart: ${testProduct.name}`);

    // Add to cart
    await axios.post(`${API_BASE}/api/cart`, {
      productId: testProduct.id,
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Product added to cart');

    // Now create order - this should trigger auto-assignment
    console.log('📦 Creating test order (should trigger auto-assignment)...');
    const orderResponse = await axios.post(`${API_BASE}/api/orders`, {
      deliverySlotId: testSlot.id,
      addressId: addressResponse.data.id,
      paymentMethod: 'cod'
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Order created successfully');
    console.log('Order details:', {
      id: orderResponse.data.id,
      status: orderResponse.data.status,
      deliveryStatus: orderResponse.data.deliveryStatus,
      deliveryPartnerId: orderResponse.data.deliveryPartnerId
    });

    // Wait a moment for async assignment to complete
    console.log('⏳ Waiting for auto-assignment to complete...');
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check the order again
    const updatedOrderResponse = await axios.get(`${API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const latestOrder = updatedOrderResponse.data.find(o => o.id === orderResponse.data.id);

    console.log('Updated order details:', {
      id: latestOrder.id,
      status: latestOrder.status,
      deliveryStatus: latestOrder.deliveryStatus,
      deliveryPartnerId: latestOrder.deliveryPartnerId
    });

    if (latestOrder.deliveryPartnerId) {
      console.log('🎉 Auto-assignment worked!');
    } else {
      console.log('❌ Auto-assignment failed - no partner assigned');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

testDeliveryAssignment();