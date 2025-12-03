const express = require('express');
const DeliveryConfig = require('../models/DeliveryConfig');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply JSON parsing middleware
router.use(express.json());

// Get delivery configuration (admin only)
router.get('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const config = await DeliveryConfig.findOne();
    if (!config) {
      return res.status(404).json({ message: 'Delivery configuration not found' });
    }
    res.json(config);
  } catch (err) {
    console.error('Error fetching delivery config:', err);
    res.status(500).json({ message: 'Error fetching delivery configuration' });
  }
});

// Update delivery configuration (admin only)
router.put('/', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const {
      partnerPaymentType,
      partnerPaymentValue,
      deliveryFee,
      tipEnabled,
      maxTipAmount,
      autoAssignmentEnabled,
      assignmentTimeoutMinutes,
      maxDeliveryRadiusKm,
      partnerRatingThreshold
    } = req.body;

    // Validate input
    if (!['percentage', 'fixed'].includes(partnerPaymentType)) {
      return res.status(400).json({ message: 'Invalid partner payment type' });
    }

    if (partnerPaymentValue < 0) {
      return res.status(400).json({ message: 'Partner payment value must be positive' });
    }

    if (deliveryFee < 0) {
      return res.status(400).json({ message: 'Delivery fee must be positive' });
    }

    if (tipEnabled && maxTipAmount < 0) {
      return res.status(400).json({ message: 'Maximum tip amount must be positive' });
    }

    if (autoAssignmentEnabled && (assignmentTimeoutMinutes < 1 || assignmentTimeoutMinutes > 60)) {
      return res.status(400).json({ message: 'Assignment timeout must be between 1 and 60 minutes' });
    }

    if (maxDeliveryRadiusKm < 1) {
      return res.status(400).json({ message: 'Maximum delivery radius must be at least 1 km' });
    }

    if (partnerRatingThreshold < 0 || partnerRatingThreshold > 5) {
      return res.status(400).json({ message: 'Partner rating threshold must be between 0 and 5' });
    }

    // Find or create config
    let config = await DeliveryConfig.findOne();
    if (!config) {
      config = await DeliveryConfig.create({
        partnerPaymentType,
        partnerPaymentValue,
        deliveryFee,
        tipEnabled,
        maxTipAmount,
        autoAssignmentEnabled,
        assignmentTimeoutMinutes,
        maxDeliveryRadiusKm,
        partnerRatingThreshold
      });
    } else {
      await config.update({
        partnerPaymentType,
        partnerPaymentValue,
        deliveryFee,
        tipEnabled,
        maxTipAmount,
        autoAssignmentEnabled,
        assignmentTimeoutMinutes,
        maxDeliveryRadiusKm,
        partnerRatingThreshold
      });
    }

    res.json(config);
  } catch (err) {
    console.error('Error updating delivery config:', err);
    res.status(500).json({ message: 'Error updating delivery configuration' });
  }
});

module.exports = router;