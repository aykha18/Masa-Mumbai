const { Client } = require('pg');

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  password: process.env.DB_PASS,
  port: 5432,
});

client.connect()
  .then(() => {
    console.log('Connected to PostgreSQL');
    return client.query('SELECT version()');
  })
  .then(res => {
    console.log('PostgreSQL version:', res.rows[0].version);
    return client.end();
  })
  .then(() => {
    console.log('Connection closed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection failed:', err);
    process.exit(1);
  });