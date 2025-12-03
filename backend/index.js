require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./db');
// Import models to ensure they are registered
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
const Cart = require('./models/Cart');
const Order = require('./models/Order');
const DeliverySlot = require('./models/DeliverySlot');
const Address = require('./models/Address');
const DeliveryPartner = require('./models/DeliveryPartner');
const DeliveryConfig = require('./models/DeliveryConfig');

// Define associations
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Category.hasMany(Product, { foreignKey: 'categoryId' });

Order.belongsTo(DeliverySlot, { foreignKey: 'deliverySlotId', as: 'deliverySlot' });
DeliverySlot.hasMany(Order, { foreignKey: 'deliverySlotId' });

Order.belongsTo(Address, { foreignKey: 'addressId', as: 'address' });
Address.hasMany(Order, { foreignKey: 'addressId' });

// Delivery Partner System Associations
DeliveryPartner.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasOne(DeliveryPartner, { foreignKey: 'userId', as: 'deliveryPartner' });

Order.belongsTo(DeliveryPartner, { foreignKey: 'deliveryPartnerId', as: 'deliveryPartner' });
DeliveryPartner.hasMany(Order, { foreignKey: 'deliveryPartnerId' });

const app = express();

app.use(cors());
app.use('/uploads', express.static('uploads'));

sequelize.sync({ alter: true })
  .then(() => console.log('Database synced'))
  .catch(err => console.log(err));

app.get('/', (req, res) => res.send('API running'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/delivery-slots', require('./routes/delivery-slots'));
app.use('/api/delivery-config', require('./routes/delivery-config'));
app.use('/api/addresses', require('./routes/addresses'));
app.use('/api/delivery-partners', require('./routes/delivery-partners'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));