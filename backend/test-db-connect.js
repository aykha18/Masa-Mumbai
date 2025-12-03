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
    console.log('Connected to database machhi');
    return client.query('SELECT version()');
  })
  .then(res => {
    console.log('Version:', res.rows[0].version);
    return client.query('SELECT current_user, session_user');
  })
  .then(res => {
    console.log('User:', res.rows[0]);
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