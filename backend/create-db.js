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
    return client.query(`CREATE DATABASE ${process.env.DB_NAME};`);
  })
  .then(() => {
    console.log(`Database ${process.env.DB_NAME} created`);
    return client.end();
  })
  .then(() => {
    console.log('Connection closed');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });