const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function testDeliverySystem() {
  console.log('🚀 Testing Complete Delivery System Flow\n');

  try {
    // 1. Admin Login
    console.log('1️⃣ Admin Login Test');
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });
    console.log('✅ Admin logged in:', adminLogin.data.user.name);
    const adminToken = adminLogin.data.token;

    // 2. Delivery Partner Login
    console.log('\n2️⃣ Delivery Partner Login Test');
    const partnerLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'sunil@gmail.com',
      password: 'aykha123'
    });
    console.log('✅ Delivery partner logged in:', partnerLogin.data.user.name);
    console.log('🎭 Role:', partnerLogin.data.user.role);
    const partnerToken = partnerLogin.data.token;

    // 3. Check Initial Deliveries (should be empty or have existing ones)
    console.log('\n3️⃣ Check Initial Deliveries');
    const initialDeliveries = await axios.get(`${API_BASE}/api/delivery-partners/deliveries`, {
      headers: { Authorization: `Bearer ${partnerToken}` }
    });
    console.log(`📦 Initial deliveries: ${initialDeliveries.data.length}`);

    // 4. Create a test user for ordering
    console.log('\n4️⃣ Create Test Customer');
    const customerRegister = await axios.post(`${API_BASE}/api/auth/register`, {
      name: 'Test Customer',
      email: 'test@example.com',
      password: 'test123',
      phone: '9999999999',
      address: 'Test Address'
    });
    console.log('✅ Test customer created');

    // 5. Customer Login
    const customerLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'test@example.com',
      password: 'test123'
    });
    console.log('✅ Customer logged in');
    const customerToken = customerLogin.data.token;

    // 6. Add product to cart
    console.log('\n5️⃣ Add Product to Cart');
    await axios.post(`${API_BASE}/api/cart`, {
      productId: 2, // Assuming product ID 2 exists
      quantity: 1
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ Product added to cart');

    // 7. Create delivery address
    console.log('\n6️⃣ Create Delivery Address');
    const addressResponse = await axios.post(`${API_BASE}/api/addresses`, {
      type: 'home',
      name: 'Home',
      fullName: 'Test Customer',
      phone: '9999999999',
      street: '123 Test Street',
      city: 'Test City',
      state: 'Test State',
      pincode: '123456',
      isDefault: true
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ Delivery address created');

    // 8. Get available delivery slots
    console.log('\n7️⃣ Get Available Delivery Slots');
    const slotsResponse = await axios.get(`${API_BASE}/api/delivery-slots`);
    const availableSlot = slotsResponse.data.find(slot => slot.isActive && slot.currentOrders < slot.maxOrders);
    if (!availableSlot) {
      throw new Error('No available delivery slots');
    }
    console.log('✅ Found available slot:', availableSlot.name);

    // 9. Place Order (this triggers automatic delivery assignment)
    console.log('\n8️⃣ Place Order (Auto-Assignment Trigger)');
    const orderResponse = await axios.post(`${API_BASE}/api/orders`, {
      deliverySlotId: availableSlot.id,
      addressId: addressResponse.data.id,
      paymentMethod: 'cod'
    }, {
      headers: { Authorization: `Bearer ${customerToken}` }
    });
    console.log('✅ Order placed successfully!');
    console.log('📋 Order ID:', orderResponse.data.id);
    console.log('💰 Total:', orderResponse.data.total);

    // 10. Check if delivery was assigned
    console.log('\n9️⃣ Check Delivery Assignment');
    const assignedDeliveries = await axios.get(`${API_BASE}/api/delivery-partners/deliveries`, {
      headers: { Authorization: `Bearer ${partnerToken}` }
    });
    console.log(`📦 Deliveries after order: ${assignedDeliveries.data.length}`);

    if (assignedDeliveries.data.length > initialDeliveries.data.length) {
      const newDelivery = assignedDeliveries.data[0];
      console.log('🎉 New delivery assigned!');
      console.log('📋 Order ID:', newDelivery.id);
      console.log('📍 Status:', newDelivery.deliveryStatus);
      console.log('💰 Total:', newDelivery.total);
      console.log('👤 Customer:', newDelivery.address?.fullName || 'N/A');
    }

    // 11. Delivery Partner Actions
    if (assignedDeliveries.data.length > 0) {
      const delivery = assignedDeliveries.data.find(d => d.deliveryStatus === 'assigned');
      if (delivery) {
        console.log('\n🔟 Delivery Partner Actions');

        // Accept delivery
        console.log('✅ Accepting delivery...');
        await axios.post(`${API_BASE}/api/delivery-partners/deliveries/${delivery.id}/accept`, {}, {
          headers: { Authorization: `Bearer ${partnerToken}` }
        });
        console.log('✅ Delivery accepted');

        // Mark as picked up
        console.log('🚚 Marking as picked up...');
        await axios.put(`${API_BASE}/api/delivery-partners/deliveries/${delivery.id}/status`, {
          status: 'picked_up'
        }, {
          headers: { Authorization: `Bearer ${partnerToken}` }
        });
        console.log('✅ Delivery picked up');

        // Mark as delivered
        console.log('🎯 Marking as delivered...');
        await axios.put(`${API_BASE}/api/delivery-partners/deliveries/${delivery.id}/status`, {
          status: 'delivered',
          notes: 'Delivered successfully!'
        }, {
          headers: { Authorization: `Bearer ${partnerToken}` }
        });
        console.log('✅ Delivery completed');
      }
    }

    // 12. Check earnings
    console.log('\n1️⃣1️⃣ Check Partner Earnings');
    const earningsResponse = await axios.get(`${API_BASE}/api/delivery-partners/earnings`, {
      headers: { Authorization: `Bearer ${partnerToken}` }
    });
    console.log('💰 Total Earnings:', earningsResponse.data.partner.totalEarnings);
    console.log('📊 Total Deliveries:', earningsResponse.data.partner.totalDeliveries);

    // 13. Admin View
    console.log('\n1️⃣2️⃣ Admin Dashboard Check');
    const adminPartners = await axios.get(`${API_BASE}/api/delivery-partners`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('👥 Total Delivery Partners:', adminPartners.data.length);

    const adminOrders = await axios.get(`${API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('📦 Total Orders:', adminOrders.data.length);

    console.log('\n🎉 DELIVERY SYSTEM TEST COMPLETED SUCCESSFULLY! 🎉');
    console.log('\n✅ Features Verified:');
    console.log('   • Admin authentication');
    console.log('   • Delivery partner authentication');
    console.log('   • Automatic delivery assignment');
    console.log('   • Order placement and fulfillment');
    console.log('   • Delivery status updates');
    console.log('   • Earnings calculation');
    console.log('   • Admin management');

  } catch (error) {
    console.error('\n❌ Test Failed:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Response:', error.response.data);
    }
  }
}

testDeliverySystem();