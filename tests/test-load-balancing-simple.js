const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function testLoadBalancingSimple() {
  try {
    console.log('🧪 Testing Load Balancing Logic...\n');

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

    console.log('📊 Current Delivery Partners:');
    partnersRes.data.forEach(p => {
      console.log(`   ID ${p.id}: ${p.user?.name} (Rating: ${p.rating}, Deliveries: ${p.totalDeliveries})`);
    });

    // Check current order assignments
    const ordersRes = await axios.get(`${API_BASE}/api/orders`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    const assignedOrders = ordersRes.data.filter(o => o.deliveryPartnerId);
    console.log(`\n📦 Current Orders: ${ordersRes.data.length} total, ${assignedOrders.length} assigned`);

    // Group by partner
    const partnerAssignments = {};
    assignedOrders.forEach(order => {
      const partnerId = order.deliveryPartnerId;
      if (!partnerAssignments[partnerId]) {
        partnerAssignments[partnerId] = [];
      }
      partnerAssignments[partnerId].push(order.id);
    });

    console.log('\n📈 Current Load Distribution:');
    Object.entries(partnerAssignments).forEach(([partnerId, orders]) => {
      const partner = partnersRes.data.find(p => p.id == partnerId);
      console.log(`   Partner ${partnerId} (${partner?.user?.name}): ${orders.length} orders [${orders.join(', ')}]`);
    });

    // Check if load balancing is working
    const partnerIds = Object.keys(partnerAssignments);
    const maxLoad = Math.max(...Object.values(partnerAssignments).map(arr => arr.length));
    const minLoad = Math.min(...Object.values(partnerAssignments).map(arr => arr.length));
    const loadDifference = maxLoad - minLoad;

    console.log(`\n📊 Load Analysis:`);
    console.log(`   Max load: ${maxLoad} orders`);
    console.log(`   Min load: ${minLoad} orders`);
    console.log(`   Load difference: ${loadDifference} orders`);

    if (loadDifference <= 1) {
      console.log('✅ Load balancing is working well! Partners have similar workloads.');
    } else if (loadDifference <= 2) {
      console.log('⚠️ Load balancing is acceptable but could be improved.');
    } else {
      console.log('❌ Load balancing needs improvement. Some partners have much heavier workloads.');
    }

    // Show the assignment algorithm in action
    console.log('\n🔄 Assignment Algorithm:');
    console.log('1. Find all available partners (isAvailable=true, isActive=true, rating >= threshold)');
    console.log('2. Calculate current load for each partner (count of active deliveries)');
    console.log('3. Sort by: currentLoad ASC (lightest load first), then rating DESC');
    console.log('4. Assign to the partner with the lightest load');

    console.log('\n🎯 Benefits of Load Balancing:');
    console.log('   • Fair distribution of work across all partners');
    console.log('   • Prevents one partner from getting overwhelmed');
    console.log('   • Improves delivery efficiency and partner satisfaction');
    console.log('   • Better customer service with faster deliveries');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testLoadBalancingSimple();