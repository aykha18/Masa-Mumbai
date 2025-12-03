const Order = require('./models/Order');
const DeliveryPartner = require('./models/DeliveryPartner');
const db = require('./db');

async function checkOrderAssignments() {
  try {
    console.log('🔄 Checking order assignments...');

    // Get all orders
    const orders = await Order.findAll({
      attributes: ['id', 'userId', 'status', 'deliveryPartnerId', 'deliveryStatus']
    });

    console.log(`📦 Total orders: ${orders.length}`);

    // Group by delivery partner
    const assignments = {};
    orders.forEach(order => {
      const partnerId = order.deliveryPartnerId || 'unassigned';
      if (!assignments[partnerId]) {
        assignments[partnerId] = [];
      }
      assignments[partnerId].push(order);
    });

    console.log('\n📊 Order assignments:');
    for (const [partnerId, partnerOrders] of Object.entries(assignments)) {
      if (partnerId === 'unassigned') {
        console.log(`- Unassigned: ${partnerOrders.length} orders`);
      } else {
        // Get partner name
        const partner = await DeliveryPartner.findByPk(partnerId, {
          include: [{ model: require('./models/User'), as: 'user' }]
        });
        const partnerName = partner ? partner.user.name : `Partner ${partnerId}`;
        console.log(`- ${partnerName}: ${partnerOrders.length} orders`);
      }
    }

    // Check Sunil's partner
    const sunilPartner = await DeliveryPartner.findOne({
      where: { userId: 4 },
      include: [{ model: require('./models/User'), as: 'user' }]
    });

    if (sunilPartner) {
      console.log(`\n👤 Sunil's partner ID: ${sunilPartner.id}`);
      console.log(`Available: ${sunilPartner.isAvailable}`);
      console.log(`Active: ${sunilPartner.isActive}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit();
  }
}

checkOrderAssignments();