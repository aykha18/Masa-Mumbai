const express = require('express');
const DeliverySlot = require('../models/DeliverySlot');
const auth = require('../middleware/auth');

const router = express.Router();

// Get all delivery slots (public - for users to select)
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const currentHour = now.getHours();

    // Get today's date in YYYY-MM-DD format
    const today = now.toISOString().split('T')[0];

    // Calculate tomorrow's date
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    let availableSlots = [];

    // Logic for available slots based on current time
    if (currentHour >= 6 && currentHour < 12) {
      // 6 AM to 12 PM: Show Today 12-2 PM and Today 5-8 PM
      availableSlots = await DeliverySlot.findAll({
        where: {
          date: today,
          isActive: true,
          currentOrders: {
            [require('sequelize').Op.lt]: require('sequelize').col('maxOrders')
          }
        },
        order: [['startTime', 'ASC']]
      });
    } else if (currentHour >= 14 && currentHour < 16) {
      // 2 PM to 4 PM: Show Today 5-8 PM and Tomorrow slots
      const todaySlots = await DeliverySlot.findAll({
        where: {
          date: today,
          startTime: '17:00:00', // 5 PM
          isActive: true,
          currentOrders: {
            [require('sequelize').Op.lt]: require('sequelize').col('maxOrders')
          }
        }
      });

      const tomorrowSlots = await DeliverySlot.findAll({
        where: {
          date: tomorrowStr,
          isActive: true,
          currentOrders: {
            [require('sequelize').Op.lt]: require('sequelize').col('maxOrders')
          }
        },
        order: [['startTime', 'ASC']]
      });

      availableSlots = [...todaySlots, ...tomorrowSlots];
    } else {
      // Other times: Show Tomorrow slots
      availableSlots = await DeliverySlot.findAll({
        where: {
          date: tomorrowStr,
          isActive: true,
          currentOrders: {
            [require('sequelize').Op.lt]: require('sequelize').col('maxOrders')
          }
        },
        order: [['startTime', 'ASC']]
      });
    }

    res.json(availableSlots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin routes for managing delivery slots
router.use(auth);
router.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
});

// Get all delivery slots (admin view)
router.get('/admin', async (req, res) => {
  try {
    const slots = await DeliverySlot.findAll({
      order: [['date', 'ASC'], ['startTime', 'ASC']]
    });
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create delivery slot
router.post('/', async (req, res) => {
  const { name, date, startTime, endTime, maxOrders } = req.body;
  try {
    const slot = await DeliverySlot.create({
      name,
      date,
      startTime,
      endTime,
      maxOrders: maxOrders || 50
    });
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update delivery slot
router.put('/:id', async (req, res) => {
  try {
    const slot = await DeliverySlot.findByPk(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Delivery slot not found' });

    const { name, date, startTime, endTime, maxOrders, isActive } = req.body;
    await slot.update({
      name,
      date,
      startTime,
      endTime,
      maxOrders,
      isActive
    });
    res.json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete delivery slot
router.delete('/:id', async (req, res) => {
  try {
    const slot = await DeliverySlot.findByPk(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Delivery slot not found' });
    await slot.destroy();
    res.json({ message: 'Delivery slot deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;