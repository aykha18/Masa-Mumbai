const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const DeliverySlot = require('./DeliverySlot');

const Order = sequelize.define('Order', {
  userId: { type: DataTypes.INTEGER, allowNull: true },
  items: { type: DataTypes.JSON, allowNull: false },
  total: { type: DataTypes.FLOAT, allowNull: false },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending'
  },
  upiId: { type: DataTypes.STRING },
  deliverySlotId: { type: DataTypes.INTEGER, allowNull: false },
  addressId: { type: DataTypes.INTEGER, allowNull: true },
  guestAddress: { type: DataTypes.JSON, allowNull: true }, // For guest orders
  guestInfo: { type: DataTypes.JSON, allowNull: true }, // Guest contact info

  // Delivery Partner System
  deliveryPartnerId: { type: DataTypes.INTEGER, allowNull: true },
  deliveryStatus: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deliveryAssignedAt: { type: DataTypes.DATE, allowNull: true },
  deliveryAcceptedAt: { type: DataTypes.DATE, allowNull: true },
  deliveryPickedUpAt: { type: DataTypes.DATE, allowNull: true },
  deliveryCompletedAt: { type: DataTypes.DATE, allowNull: true },

  // Payment and Tips
  tipAmount: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  deliveryFee: { type: DataTypes.FLOAT, defaultValue: 0.0 },
  partnerEarnings: { type: DataTypes.FLOAT, defaultValue: 0.0 },

  // Customer Rating for Delivery
  deliveryRating: { type: DataTypes.INTEGER, allowNull: true }, // 1-5 stars
  deliveryReview: { type: DataTypes.TEXT, allowNull: true },

  // Tracking
  trackingNotes: { type: DataTypes.JSON, defaultValue: [] }, // Array of status updates with timestamps
  estimatedDeliveryTime: { type: DataTypes.DATE, allowNull: true }
}, { timestamps: true });

module.exports = Order;