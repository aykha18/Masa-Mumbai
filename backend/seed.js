const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

require('dotenv').config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/fishapp');

const seedAdmin = async () => {
  try {
    const admin = new User({
      name: 'Admin',
      email: 'admin@fishapp.com',
      password: await bcrypt.hash('admin123', 10),
      role: 'admin'
    });
    await admin.save();
    console.log('Admin user created: admin@fishapp.com / admin123');
  } catch (err) {
    console.log('Admin already exists or error:', err.message);
  }
  process.exit();
};

seedAdmin();