const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Address = sequelize.define('Address', {
  userId: { type: DataTypes.INTEGER, allowNull: false },
  type: { type: DataTypes.ENUM('home', 'work', 'other'), defaultValue: 'home' },
  name: { type: DataTypes.STRING, allowNull: false }, // Address label/name
  fullName: { type: DataTypes.STRING, allowNull: false },
  phone: { type: DataTypes.STRING, allowNull: false },
  street: { type: DataTypes.TEXT, allowNull: false },
  city: { type: DataTypes.STRING, allowNull: false },
  state: { type: DataTypes.STRING, allowNull: false },
  pincode: { type: DataTypes.STRING, allowNull: false },
  landmark: { type: DataTypes.STRING },
  isDefault: { type: DataTypes.BOOLEAN, defaultValue: false },
}, { timestamps: true });

module.exports = Address;