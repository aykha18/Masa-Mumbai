const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const DeliveryPartner = sequelize.define('DeliveryPartner', {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: { model: 'Users', key: 'id' }
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  currentLocation: {
    type: DataTypes.JSON, // {lat: number, lng: number}
    allowNull: true
  },
  vehicleType: {
    type: DataTypes.ENUM('bike', 'scooter', 'car', 'walking'),
    defaultValue: 'bike'
  },
  licenseNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  totalDeliveries: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  totalEarnings: {
    type: DataTypes.FLOAT,
    defaultValue: 0.0
  },
  rating: {
    type: DataTypes.FLOAT,
    defaultValue: 5.0
  },
  totalRatings: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  bankDetails: {
    type: DataTypes.JSON, // {accountNumber, ifsc, bankName, accountHolderName}
    allowNull: true
  },
  documents: {
    type: DataTypes.JSON, // {aadhar, license, photo}
    allowNull: true
  }
}, { timestamps: true });

module.exports = DeliveryPartner;