const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function testLoadBalancing() {
  try {
    console.log('🧪 Testing Load Balancing Across Delivery Partners...\n');

    // Login as admin to check partners
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.token;

    // Get all partners
    const partnersRes = await axios.get(`${API_BASE}/api/delivery-partners`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('📊 Available Delivery Partners:');
    partnersRes.data.forEach(p => {
      console.log(`   ID ${p.id}: ${p.user?.name} (Rating: ${p.rating}, Deliveries: ${p.totalDeliveries})`);
    });

    // Login as one of the delivery partners to place orders (they have user accounts)
    const userLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'sunil@gmail.com',
      password: 'aykha123'
    });

    if (userLogin.data) {
      console.log('\n✅ Regular user login successful');
      const userToken = userLogin.data.token;

      // Get delivery slots
      const slotsRes = await axios.get(`${API_BASE}/api/delivery-slots`);
      const availableSlot = slotsRes.data.find(slot => slot.currentOrders < slot.maxOrders);

      if (!availableSlot) {
        console.log('❌ No available delivery slots');
        return;
      }

      console.log(`📅 Using delivery slot: ${availableSlot.name}`);

      // Get user addresses
      const addressesRes = await axios.get(`${API_BASE}/api/addresses`, {
        headers: { Authorization: `Bearer ${userToken}` }
      });

      if (addressesRes.data.length === 0) {
        console.log('❌ No addresses found for user');
        return;
      }

      const address = addressesRes.data[0];
      console.log(`📍 Using address: ${address.name}`);

      // Get products
      const productsRes = await axios.get(`${API_BASE}/api/products`);
      const products = productsRes.data.slice(0, 3); // Take first 3 products

      console.log('\n🛒 Placing multiple orders to test load balancing...\n');

      const orderResults = [];

      for (let i = 0; i < 5; i++) {
        try {
          // Add to cart
          const cartData = {
            productId: products[i % products.length].id,
            quantity: 1
          };

          await axios.post(`${API_BASE}/api/cart`, cartData, {
            headers: { Authorization: `Bearer ${userToken}` }
          });

          // Place order
          const orderRes = await axios.post(`${API_BASE}/api/orders`, {
            deliverySlotId: availableSlot.id,
            addressId: address.id,
            paymentMethod: 'cod'
          }, {
            headers: { Authorization: `Bearer ${userToken}` }
          });

          const orderId = orderRes.data.id;
          console.log(`📦 Order ${orderId} placed successfully`);

          // Check which partner got assigned
          const orderDetails = await axios.get(`${API_BASE}/api/orders`, {
            headers: { Authorization: `Bearer ${userToken}` }
          });

          const latestOrder = orderDetails.data.find(o => o.id === orderId);
          if (latestOrder.deliveryPartnerId) {
            orderResults.push({
              orderId,
              partnerId: latestOrder.deliveryPartnerId,
              status: latestOrder.deliveryStatus
            });
          }

          // Small delay between orders
          await new Promise(resolve => setTimeout(resolve, 500));

        } catch (error) {
          console.log(`❌ Failed to place order ${i + 1}:`, error.response?.data?.message || error.message);
        }
      }

      console.log('\n📊 Load Balancing Results:');
      console.log('Order Assignments:');
      orderResults.forEach(result => {
        console.log(`   Order ${result.orderId} → Partner ${result.partnerId} (${result.status})`);
      });

      // Count assignments per partner
      const partnerCounts = {};
      orderResults.forEach(result => {
        partnerCounts[result.partnerId] = (partnerCounts[result.partnerId] || 0) + 1;
      });

      console.log('\n📈 Distribution Summary:');
      Object.entries(partnerCounts).forEach(([partnerId, count]) => {
        console.log(`   Partner ${partnerId}: ${count} orders`);
      });

      const uniquePartners = Object.keys(partnerCounts).length;
      console.log(`\n✅ Orders distributed across ${uniquePartners} partners`);

      if (uniquePartners > 1) {
        console.log('🎉 Load balancing is working! Orders are distributed across multiple partners.');
      } else {
        console.log('⚠️ All orders went to the same partner. Load balancing may need adjustment.');
      }

    } else {
      console.log('❌ Regular user login failed - user may not exist');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testLoadBalancing();