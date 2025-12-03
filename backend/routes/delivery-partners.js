const express = require('express');
const { Op } = require('sequelize');
const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');
const User = require('../models/User');
const DeliveryConfig = require('../models/DeliveryConfig');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply JSON parsing middleware
router.use(express.json());

// Get delivery partner profile
router.get('/profile', auth, async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, as: 'user' }]
    });

    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner profile not found' });
    }

    res.json(partner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update delivery partner availability
router.put('/availability', auth, async (req, res) => {
  try {
    const { isAvailable, currentLocation } = req.body;

    const partner = await DeliveryPartner.findOne({
      where: { userId: req.user.id }
    });

    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner profile not found' });
    }

    await partner.update({
      isAvailable,
      currentLocation
    });

    res.json(partner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get available deliveries for partner
router.get('/deliveries', auth, async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({
      where: { userId: req.user.id }
    });

    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner profile not found' });
    }

    // Get orders assigned to this partner
    const orders = await Order.findAll({
      where: {
        deliveryPartnerId: partner.id,
        deliveryStatus: {
          [Op.in]: ['assigned', 'accepted', 'picked_up']
        }
      },
      include: [
        { model: require('../models/DeliverySlot'), as: 'deliverySlot' },
        { model: require('../models/Address'), as: 'address' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Accept delivery
router.post('/deliveries/:orderId/accept', auth, async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({
      where: { userId: req.user.id }
    });

    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner profile not found' });
    }

    const order = await Order.findOne({
      where: {
        id: req.params.orderId,
        deliveryPartnerId: partner.id,
        deliveryStatus: 'assigned'
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not assigned to you' });
    }

    await order.update({
      deliveryStatus: 'accepted',
      deliveryAcceptedAt: new Date(),
      status: 'Preparing'
    });

    // Add tracking note
    const trackingNotes = [...(order.trackingNotes || []), {
      status: 'accepted',
      message: 'Delivery partner has accepted the order',
      timestamp: new Date()
    }];
    await order.update({ trackingNotes });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reject delivery
router.post('/deliveries/:orderId/reject', auth, async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({
      where: { userId: req.user.id }
    });

    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner profile not found' });
    }

    const order = await Order.findOne({
      where: {
        id: req.params.orderId,
        deliveryPartnerId: partner.id,
        deliveryStatus: 'assigned'
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not assigned to you' });
    }

    // Remove assignment and set back to pending for reassignment
    await order.update({
      deliveryPartnerId: null,
      deliveryStatus: null,
      deliveryAssignedAt: null
    });

    // Add tracking note
    const trackingNotes = [...(order.trackingNotes || []), {
      status: 'rejected',
      message: 'Delivery partner rejected the order - reassigned',
      timestamp: new Date()
    }];
    await order.update({ trackingNotes });

    res.json({ message: 'Order rejected and reassigned' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update delivery status
router.put('/deliveries/:orderId/status', auth, async (req, res) => {
  try {
    const { status, notes } = req.body;

    const partner = await DeliveryPartner.findOne({
      where: { userId: req.user.id }
    });

    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner profile not found' });
    }

    const order = await Order.findOne({
      where: {
        id: req.params.orderId,
        deliveryPartnerId: partner.id
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const updates = {};
    const trackingNotes = [...(order.trackingNotes || [])];

    switch (status) {
      case 'picked_up':
        updates.deliveryPickedUpAt = new Date();
        updates.status = 'Out for Delivery';
        trackingNotes.push({
          status: 'picked_up',
          message: 'Order picked up by delivery partner',
          timestamp: new Date()
        });
        break;
      case 'delivered':
        updates.deliveryCompletedAt = new Date();
        updates.status = 'Delivered';
        updates.deliveryStatus = 'delivered';
        trackingNotes.push({
          status: 'delivered',
          message: notes || 'Order delivered successfully',
          timestamp: new Date()
        });
        break;
      default:
        return res.status(400).json({ message: 'Invalid status' });
    }

    updates.trackingNotes = trackingNotes;
    await order.update(updates);

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get delivery partner earnings
router.get('/earnings', auth, async (req, res) => {
  try {
    const partner = await DeliveryPartner.findOne({
      where: { userId: req.user.id }
    });

    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner profile not found' });
    }

    // Get completed deliveries with earnings
    const completedOrders = await Order.findAll({
      where: {
        deliveryPartnerId: partner.id,
        deliveryStatus: 'delivered'
      },
      attributes: ['id', 'total', 'tipAmount', 'partnerEarnings', 'deliveryCompletedAt'],
      order: [['deliveryCompletedAt', 'DESC']],
      limit: 50
    });

    const totalEarnings = completedOrders.reduce((sum, order) => sum + (order.partnerEarnings || 0), 0);
    const totalTips = completedOrders.reduce((sum, order) => sum + (order.tipAmount || 0), 0);

    res.json({
      partner: {
        totalEarnings: partner.totalEarnings,
        totalDeliveries: partner.totalDeliveries,
        rating: partner.rating
      },
      recentDeliveries: completedOrders,
      summary: {
        totalEarnings,
        totalTips,
        deliveryCount: completedOrders.length
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin routes for managing delivery partners
router.use(auth);
router.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
});

// Get all delivery partners
router.get('/', async (req, res) => {
  try {
    const partners = await DeliveryPartner.findAll({
      include: [{ model: User, as: 'user' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(partners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create delivery partner
router.post('/', async (req, res) => {
  try {
    const { userId, vehicleType, licenseNumber } = req.body;

    // Check if user exists and is not already a delivery partner
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const existingPartner = await DeliveryPartner.findOne({ where: { userId } });
    if (existingPartner) {
      return res.status(400).json({ message: 'User is already a delivery partner' });
    }

    const partner = await DeliveryPartner.create({
      userId,
      vehicleType,
      licenseNumber
    });

    // Update user role
    await user.update({ role: 'delivery_partner' });

    res.status(201).json(partner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update delivery partner
router.put('/:id', async (req, res) => {
  try {
    const partner = await DeliveryPartner.findByPk(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    const { isAvailable, vehicleType, licenseNumber, isActive } = req.body;
    await partner.update({
      isAvailable,
      vehicleType,
      licenseNumber,
      isActive
    });

    res.json(partner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete delivery partner
router.delete('/:id', async (req, res) => {
  try {
    const partner = await DeliveryPartner.findByPk(req.params.id);
    if (!partner) {
      return res.status(404).json({ message: 'Delivery partner not found' });
    }

    // Update user role back to user
    const user = await User.findByPk(partner.userId);
    if (user) {
      await user.update({ role: 'user' });
    }

    await partner.destroy();
    res.json({ message: 'Delivery partner removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;