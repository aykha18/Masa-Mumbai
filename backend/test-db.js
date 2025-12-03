const sequelize = require('./db');

async function testDB() {
  try {
    await sequelize.authenticate();
    console.log('Database connection successful.');

    await sequelize.sync();
    console.log('Tables synced successfully.');

    // Check tables
    const tables = await sequelize.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('Tables in database:', tables[0].map(t => t.table_name));

    process.exit(0);
  } catch (error) {
    console.error('Database test failed:', error);
    process.exit(1);
  }
}

testDB();