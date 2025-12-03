const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const DeliveryPartner = require('../models/DeliveryPartner');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply JSON parsing middleware to auth routes
router.use(express.json());

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, phone, address } = req.body;
  try {
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), phone, address });
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Register as delivery partner
router.post('/register-delivery-partner', async (req, res) => {
  const { name, email, password, phone, address, vehicleType, licenseNumber } = req.body;

  try {
    // Create user account
    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      phone,
      address,
      role: 'delivery_partner'
    });

    // Create delivery partner profile
    const partner = await DeliveryPartner.create({
      userId: user.id,
      vehicleType: vehicleType || 'bike',
      licenseNumber
    });

    res.status(201).json({
      message: 'Delivery partner registered successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'name', 'email', 'phone', 'address', 'role', 'createdAt']
    });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({ name, phone, address });
    res.json({ message: 'Profile updated successfully', user: {
      id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, role: user.role
    }});
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;