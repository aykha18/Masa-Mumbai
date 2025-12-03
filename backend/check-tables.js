require('dotenv').config();
const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: 5432,
});

client.connect()
  .then(() => {
    console.log('Connected to database');
    return client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  })
  .then(res => {
    console.log('Tables:');
    res.rows.forEach(row => console.log('- ' + row.table_name));
    return client.end();
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });