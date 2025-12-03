const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function testAutoAssignment() {
  try {
    console.log('🔐 Testing auto-assignment...');

    // Login as admin to create a test order
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });

    const token = adminLogin.data.token;
    console.log('✅ Admin login successful');

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

    // Create a test cart first (since orders require cart)
    console.log('🛒 Creating test cart...');

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

    // Now create order
    console.log('📦 Creating test order...');
    const orderResponse = await axios.post(`${API_BASE}/api/orders`, {
      deliverySlotId: testSlot.id,
      addressId: null, // Will fail, but let's see
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

    if (orderResponse.data.deliveryPartnerId) {
      console.log('🎉 Auto-assignment worked!');
    } else {
      console.log('❌ Auto-assignment failed - no partner assigned');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

testAutoAssignment();