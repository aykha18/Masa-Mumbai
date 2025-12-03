const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function assignAllOrdersToSunil() {
  try {
    console.log('🔐 Logging in as admin...');

    // Login as admin
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });

    const token = adminLogin.data.token;
    console.log('✅ Admin login successful');

    // Get all delivery partners to find Sunil
    const partnersResponse = await axios.get(`${API_BASE}/api/delivery-partners`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const sunilPartner = partnersResponse.data.find(p => p.user.name === 'Sunil Kumar');
    if (!sunilPartner) {
      console.log('❌ Sunil\'s partner not found');
      return;
    }

    console.log(`👤 Found Sunil's partner: ID ${sunilPartner.id}`);

    // Since we can't get all orders directly, let's try to assign orders by creating a manual assignment
    // We'll need to use the database directly or find another way

    // For now, let's try to manually update orders. Since there's no admin endpoint,
    // let's create a simple script that uses the delivery service logic

    console.log('📦 Attempting to assign all unassigned orders to Sunil...');

    // Since we can't directly query orders, let's try a different approach
    // Let's check if we can use the delivery service by triggering it somehow

    // Actually, let me try to create a test order and see if it gets assigned
    console.log('🧪 Creating a test order to trigger assignment...');

    // But first, we need a user with a cart. Let's skip this for now.

    // Since the backend is running, let me try to manually assign via database
    // But since I can't connect to DB, let me try a different approach

    // Let's check if there's a way to manually trigger the assignment service
    // Actually, let me check the delivery service code again

    console.log('💡 The issue is that existing orders were created before the partner was available.');
    console.log('🔧 Solution: We need to manually assign the existing orders.');

    // Since we can't easily do this via API, let me suggest a manual database update
    console.log('\n📋 Manual Solution:');
    console.log('Run this SQL in your database:');
    console.log(`UPDATE "Orders" SET "deliveryPartnerId" = ${sunilPartner.id}, "deliveryStatus" = 'assigned', "deliveryAssignedAt" = NOW(), "status" = 'Preparing' WHERE "deliveryPartnerId" IS NULL;`);

    console.log('\nThen update the partner\'s delivery count:');
    console.log(`UPDATE "DeliveryPartners" SET "totalDeliveries" = "totalDeliveries" + 8 WHERE "id" = ${sunilPartner.id};`);

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

assignAllOrdersToSunil();