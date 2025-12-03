const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const DeliverySlot = sequelize.define('DeliverySlot', {
  name: { type: DataTypes.STRING, allowNull: false }, // e.g., "Today (12pm to 2pm)"
  date: { type: DataTypes.DATEONLY, allowNull: false }, // Delivery date
  startTime: { type: DataTypes.TIME, allowNull: false }, // Start time (HH:MM)
  endTime: { type: DataTypes.TIME, allowNull: false }, // End time (HH:MM)
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }, // Whether slot is available
  maxOrders: { type: DataTypes.INTEGER, defaultValue: 50 }, // Max orders per slot
  currentOrders: { type: DataTypes.INTEGER, defaultValue: 0 }, // Current orders in this slot
}, { timestamps: true });

module.exports = DeliverySlot;