const { Sequelize } = require('sequelize');
require('dotenv').config();

// Import models
const Order = require('./backend/models/Order');
const DeliveryPartner = require('./backend/models/DeliveryPartner');
const db = require('./backend/db');

async function manuallyAssignOrders() {
  try {
    console.log('🔄 Connecting to database...');

    // Sync database
    await db.authenticate();
    console.log('✅ Database connected');

    // Find the delivery partner (Sunil)
    const partner = await DeliveryPartner.findOne({
      where: { userId: 4 } // Sunil's user ID
    });

    if (!partner) {
      console.log('❌ Delivery partner not found');
      return;
    }

    console.log(`👤 Found delivery partner: ${partner.id}`);

    // Find orders that need assignment
    const pendingOrders = await Order.findAll({
      where: {
        deliveryPartnerId: null,
        status: {
          [db.Sequelize.Op.in]: ['Confirmed', 'Preparing', 'Ready for Pickup', 'Guest Order']
        }
      }
    });

    console.log(`📦 Found ${pendingOrders.length} orders needing assignment`);

    if (pendingOrders.length === 0) {
      console.log('✅ No orders need assignment');
      return;
    }

    // Assign each order to the partner
    for (const order of pendingOrders) {
      await order.update({
        deliveryPartnerId: partner.id,
        deliveryStatus: 'assigned',
        deliveryAssignedAt: new Date(),
        status: 'Preparing'
      });

      console.log(`✅ Assigned order ${order.id} to delivery partner`);
    }

    console.log(`🎉 Successfully assigned ${pendingOrders.length} orders to delivery partner`);

    // Update partner's delivery count
    await partner.increment('totalDeliveries', { by: pendingOrders.length });
    console.log('📊 Updated partner delivery count');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit();
  }
}

manuallyAssignOrders();