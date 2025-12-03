const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: 5432,
  dialect: 'postgres',
  logging: false
});

async function assignOrdersSQL() {
  try {
    console.log('🔄 Connecting to database...');

    await sequelize.authenticate();
    console.log('✅ Database connected');

    console.log('📦 Assigning orders to Sunil\'s partner...');

    // First, check current assignments
    const [assignments] = await sequelize.query(`
      SELECT "deliveryPartnerId", COUNT(*) as count
      FROM "Orders"
      GROUP BY "deliveryPartnerId"
    `);

    console.log('📊 Current assignments:');
    assignments.forEach(row => {
      console.log(`- Partner ${row.deliveryPartnerId || 'None'}: ${row.count} orders`);
    });

    // Update orders to assign to partner ID 2 (Sunil) - reassign from other partners
    const ordersResult = await sequelize.query(`
      UPDATE "Orders"
      SET "deliveryPartnerId" = 2,
          "deliveryStatus" = 'assigned',
          "deliveryAssignedAt" = NOW(),
          "status" = 'Preparing'
      WHERE "deliveryPartnerId" IS NOT NULL
    `);

    const ordersUpdated = ordersResult[1].rowCount; // Get affected rows count
    console.log(`✅ Reassigned ${ordersUpdated} orders to Sunil`);

    // Update partner's delivery count
    await sequelize.query(`
      UPDATE "DeliveryPartners"
      SET "totalDeliveries" = "totalDeliveries" + ${ordersUpdated}
      WHERE "id" = 2
    `);

    console.log(`✅ Updated partner delivery count`);

    console.log('🎉 All orders successfully assigned to Sunil!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

assignOrdersSQL();