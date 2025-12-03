const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const DeliveryConfig = sequelize.define('DeliveryConfig', {
  partnerPaymentType: {
    type: DataTypes.ENUM('percentage', 'fixed'),
    defaultValue: 'percentage'
  },
  partnerPaymentValue: {
    type: DataTypes.FLOAT,
    defaultValue: 10.0 // 10% or ₹10 fixed
  },
  deliveryFee: {
    type: DataTypes.FLOAT,
    defaultValue: 20.0 // Base delivery fee charged to customer
  },
  tipEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  maxTipAmount: {
    type: DataTypes.FLOAT,
    defaultValue: 100.0
  },
  autoAssignmentEnabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  assignmentTimeoutMinutes: {
    type: DataTypes.INTEGER,
    defaultValue: 5 // Minutes to wait for partner to accept
  },
  maxDeliveryRadiusKm: {
    type: DataTypes.FLOAT,
    defaultValue: 10.0
  },
  partnerRatingThreshold: {
    type: DataTypes.FLOAT,
    defaultValue: 3.5 // Minimum rating to be active
  }
}, {
  timestamps: true,
  // This should be a singleton table (only one config record)
  defaultScope: {
    limit: 1
  }
});

module.exports = DeliveryConfig;