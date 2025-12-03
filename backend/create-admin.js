require('dotenv').config();
const bcrypt = require('bcryptjs');
const User = require('./models/User');

async function createAdmin() {
  try {
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@masamumbai.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    });
    console.log('Admin user created: admin@masamumbai.com / admin123');
  } catch (err) {
    console.log('Admin already exists or error:', err.message);
  }
  process.exit();
}

createAdmin();