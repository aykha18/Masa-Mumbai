const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function testCompleteFlow() {
  try {
    console.log('🚀 Testing Complete Delivery Partner Flow...\n');

    // 1. Login as delivery partner
    console.log('1️⃣ Login as Delivery Partner...');
    const partnerLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'sunil@gmail.com',
      password: 'aykha123'
    });
    console.log('✅ Partner logged in:', partnerLogin.data.user.name);

    // 2. Check current deliveries
    console.log('\n2️⃣ Check Current Deliveries...');
    const token = partnerLogin.data.token;
    const deliveriesResponse = await axios.get(`${API_BASE}/api/delivery-partners/deliveries`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`📦 Current deliveries: ${deliveriesResponse.data.length}`);

    // 3. Create a new order (as admin)
    console.log('\n3️⃣ Create New Order (should auto-assign)...');
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.token;

    // Create address for admin
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
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    // Get delivery slots
    const slotsResponse = await axios.get(`${API_BASE}/api/delivery-slots`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (slotsResponse.data.length === 0) {
      console.log('❌ No delivery slots available');
      return;
    }

    // Add product to cart
    await axios.post(`${API_BASE}/api/cart`, {
      productId: 5, // Mackerel
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    // Create order
    const orderResponse = await axios.post(`${API_BASE}/api/orders`, {
      deliverySlotId: slotsResponse.data[0].id,
      addressId: addressResponse.data.id,
      paymentMethod: 'cod'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('📦 Order created, waiting for auto-assignment...');

    // Wait for assignment
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Check if order was assigned
    console.log('\n4️⃣ Check Auto-Assignment Result...');
    const updatedDeliveries = await axios.get(`${API_BASE}/api/delivery-partners/deliveries`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const newDelivery = updatedDeliveries.data.find(d => d.id === orderResponse.data.id);

    if (newDelivery && newDelivery.deliveryPartnerId) {
      console.log('🎉 SUCCESS: Order auto-assigned to delivery partner!');
      console.log(`📋 Order ID: ${newDelivery.id}`);
      console.log(`🚚 Status: ${newDelivery.deliveryStatus}`);
      console.log(`👤 Partner: ${newDelivery.deliveryPartnerId}`);
    } else {
      console.log('❌ FAILED: Order not assigned');
    }

    // 5. Test delivery actions
    if (newDelivery && newDelivery.deliveryStatus === 'assigned') {
      console.log('\n5️⃣ Test Delivery Actions...');

      // Accept delivery
      await axios.post(`${API_BASE}/api/delivery-partners/deliveries/${newDelivery.id}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Delivery accepted');

      // Mark as picked up
      await axios.put(`${API_BASE}/api/delivery-partners/deliveries/${newDelivery.id}/status`, {
        status: 'picked_up'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Delivery picked up');

      // Mark as delivered
      await axios.put(`${API_BASE}/api/delivery-partners/deliveries/${newDelivery.id}/status`, {
        status: 'delivered',
        notes: 'Delivered successfully'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('✅ Delivery completed');
    }

    console.log('\n🎊 COMPLETE DELIVERY PARTNER SYSTEM TEST PASSED!');

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

testCompleteFlow();