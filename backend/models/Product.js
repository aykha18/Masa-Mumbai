const { DataTypes } = require('sequelize');
const sequelize = require('../db');

const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.FLOAT, allowNull: false },
  images: { type: DataTypes.JSON, defaultValue: [] },
  primaryImage: { type: DataTypes.STRING },
  stock: { type: DataTypes.FLOAT, defaultValue: 0 }, // Changed to FLOAT for kg support
  unit: { type: DataTypes.ENUM('kg', 'piece', 'dozen'), defaultValue: 'piece' },
  unitLabel: { type: DataTypes.STRING, defaultValue: 'each' }, // Display label like "per kg", "each", "per dozen"
  categoryId: { type: DataTypes.INTEGER, allowNull: true },
}, {
  timestamps: true,
  getterMethods: {
    image() {
      return this.primaryImage || (this.images && this.images.length > 0 ? this.images[0] : null);
    }
  }
});

module.exports = Product;