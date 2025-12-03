const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function createDeliveryPartner() {
  try {
    console.log('👷 Setting up Delivery Partner...');

    let userId = null;
    let userRole = null;

    // Try to login as delivery partner first (might already exist)
    try {
      const existingLogin = await axios.post(`${API_BASE}/api/auth/login`, {
        email: 'sunil@gmail.com',
        password: 'aykha123'
      });

      userId = existingLogin.data.user.id;
      userRole = existingLogin.data.user.role;

      // Check if they have delivery partner role and profile
      if (existingLogin.data.user.role === 'delivery_partner') {
        console.log('✅ Delivery partner already exists with correct role');
        return existingLogin.data.user;
      } else {
        console.log('ℹ️ User exists but needs delivery partner profile');
      }
    } catch (e) {
      console.log('ℹ️ Delivery partner does not exist, creating...');
    }

    // First login as admin
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });

    const adminToken = adminLogin.data.token;
    console.log('✅ Admin login successful');

    if (userId) {
      // User exists, create delivery partner profile (this also updates role)
      await axios.post(`${API_BASE}/api/delivery-partners`, {
        userId: userId,
        vehicleType: 'bike',
        licenseNumber: 'DL123456789'
      }, {
        headers: { Authorization: `Bearer ${adminToken}` }
      });

      console.log('✅ Delivery partner profile created for existing user');
      return { id: userId, email: 'sunil@gmail.com', role: 'delivery_partner' };
    } else {
      // Create delivery partner user with profile using the delivery partner register endpoint
      const partnerResponse = await axios.post(`${API_BASE}/api/auth/register-delivery-partner`, {
        name: 'Sunil Kumar',
        email: 'sunil@gmail.com',
        password: 'aykha123',
        phone: '9876543210',
        address: 'Delhi, India',
        vehicleType: 'bike',
        licenseNumber: 'DL123456789'
      });

      console.log('✅ Delivery partner created:', partnerResponse.data.user.email);
      return partnerResponse.data.user;
    }

  } catch (error) {
    console.error('❌ Error setting up delivery partner:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function testDeliveryPartnerLogin() {
  try {
    // Create delivery partner first
    const partner = await createDeliveryPartner();

    console.log('\n🔐 Testing Delivery Partner Login...');

    // Login as delivery partner
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'sunil@gmail.com',
      password: 'aykha123'
    });

    console.log('✅ Delivery Partner Login successful!');
    console.log('👤 User:', loginResponse.data.user.name);
    console.log('🎭 Role:', loginResponse.data.user.role);
    console.log('🔑 Token:', loginResponse.data.token.substring(0, 20) + '...');

    const token = loginResponse.data.token;

    // Fetch deliveries
    console.log('\n🚚 Fetching deliveries...');
    const deliveriesResponse = await axios.get(`${API_BASE}/api/delivery-partners/deliveries`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Deliveries fetched successfully!');
    console.log('📦 Number of deliveries:', deliveriesResponse.data.length);

    if (deliveriesResponse.data.length > 0) {
      console.log('\n📋 First delivery details:');
      const firstOrder = deliveriesResponse.data[0];
      console.log('- Order ID:', firstOrder.id);
      console.log('- Status:', firstOrder.status);
      console.log('- Total:', firstOrder.total);
      console.log('- Customer:', firstOrder.user?.name || 'Guest');
    } else {
      console.log('📦 No deliveries assigned yet (this is normal)');
    }

    // Test regular orders endpoint
    console.log('\n📋 Testing regular orders endpoint...');
    const ordersResponse = await axios.get(`${API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Orders endpoint works!');
    console.log('📦 Orders count:', ordersResponse.data.length);

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Data:', error.response.data);
    }
  }
}

testDeliveryPartnerLogin();