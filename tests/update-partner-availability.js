const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function updatePartnerAvailability() {
  try {
    console.log('🔐 Logging in as admin...');

    // Login as admin
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });

    const token = adminLogin.data.token;
    console.log('✅ Admin login successful');

    // Get all delivery partners
    const partnersResponse = await axios.get(`${API_BASE}/api/delivery-partners`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('📋 Found delivery partners:', partnersResponse.data.length);

    // Find Sunil's partner (userId: 4)
    const sunilPartner = partnersResponse.data.find(p => p.userId === 4);

    if (!sunilPartner) {
      console.log('❌ Sunil\'s delivery partner not found');
      return;
    }

    console.log('👤 Found Sunil\'s partner:', sunilPartner.id);

    // Update partner availability
    const updateResponse = await axios.put(`${API_BASE}/api/delivery-partners/${sunilPartner.id}`, {
      isAvailable: true
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('✅ Partner availability updated successfully!');
    console.log('Available:', updateResponse.data.isAvailable);

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
  }
}

updatePartnerAvailability();