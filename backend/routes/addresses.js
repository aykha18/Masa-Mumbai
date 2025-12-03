const express = require('express');
const Address = require('../models/Address');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply JSON parsing middleware to address routes
router.use(express.json());

// Get all addresses for user
router.get('/', auth, async (req, res) => {
  try {
    const addresses = await Address.findAll({
      where: { userId: req.user.id },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
    });
    res.json(addresses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single address
router.get('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });
    if (!address) return res.status(404).json({ message: 'Address not found' });
    res.json(address);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create new address
router.post('/', auth, async (req, res) => {
  const { type, name, fullName, phone, street, city, state, pincode, landmark, isDefault } = req.body;

  try {
    // If setting as default, unset other defaults
    if (isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId: req.user.id } }
      );
    }

    const address = await Address.create({
      userId: req.user.id,
      type,
      name,
      fullName,
      phone,
      street,
      city,
      state,
      pincode,
      landmark,
      isDefault: isDefault || false
    });

    res.status(201).json(address);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update address
router.put('/:id', auth, async (req, res) => {
  const { type, name, fullName, phone, street, city, state, pincode, landmark, isDefault } = req.body;

  try {
    const address = await Address.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!address) return res.status(404).json({ message: 'Address not found' });

    // If setting as default, unset other defaults
    if (isDefault && !address.isDefault) {
      await Address.update(
        { isDefault: false },
        { where: { userId: req.user.id } }
      );
    }

    await address.update({
      type,
      name,
      fullName,
      phone,
      street,
      city,
      state,
      pincode,
      landmark,
      isDefault
    });

    res.json(address);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete address
router.delete('/:id', auth, async (req, res) => {
  try {
    const address = await Address.findOne({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!address) return res.status(404).json({ message: 'Address not found' });

    await address.destroy();
    res.json({ message: 'Address deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Set default address
router.patch('/:id/default', auth, async (req, res) => {
  try {
    // Unset all defaults for user
    await Address.update(
      { isDefault: false },
      { where: { userId: req.user.id } }
    );

    // Set this address as default
    const [updatedRows] = await Address.update(
      { isDefault: true },
      { where: { id: req.params.id, userId: req.user.id } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    res.json({ message: 'Default address updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;