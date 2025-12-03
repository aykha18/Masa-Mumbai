require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  port: 5432,
  dialect: 'postgres',
});

async function migrateProducts() {
  try {
    // Add unit column
    await sequelize.query(`
      ALTER TABLE "Products"
      ADD COLUMN IF NOT EXISTS "unit" VARCHAR(255) DEFAULT 'piece'
    `);

    // Add unitLabel column
    await sequelize.query(`
      ALTER TABLE "Products"
      ADD COLUMN IF NOT EXISTS "unitLabel" VARCHAR(255) DEFAULT 'each'
    `);

    // Update stock to be FLOAT
    await sequelize.query(`
      ALTER TABLE "Products"
      ALTER COLUMN "stock" TYPE FLOAT USING stock::FLOAT
    `);

    console.log('Products table migrated successfully');
  } catch (err) {
    console.error('Migration error:', err);
  } finally {
    await sequelize.close();
    process.exit();
  }
}

migrateProducts();