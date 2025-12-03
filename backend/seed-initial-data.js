require('dotenv').config();
const sequelize = require('./db');
// Import models
const Category = require('./models/Category');
const Product = require('./models/Product');
const User = require('./models/User');
const DeliverySlot = require('./models/DeliverySlot');

async function seedInitialData() {
  try {
    console.log('Starting initial data seeding...');

    // Seed categories
    const [freshFishCat] = await Category.findOrCreate({
      where: { name: 'Fresh Fish' },
      defaults: { name: 'Fresh Fish', description: 'Freshly caught fish' }
    });

    const [driedFishCat] = await Category.findOrCreate({
      where: { name: 'Dried Fish' },
      defaults: { name: 'Dried Fish', description: 'Dried and preserved fish' }
    });

    console.log('Categories seeded');

    // Seed admin user
    const adminExists = await User.findOne({ where: { email: 'admin@fishapp.com' } });
    if (!adminExists) {
      const bcrypt = require('bcryptjs');
      await User.create({
        name: 'Admin',
        email: 'admin@fishapp.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      });
      console.log('Admin user created: admin@fishapp.com / admin123');
    }

    // Seed sample products
    const sampleProducts = [
      {
        name: 'Atlantic Salmon',
        description: 'Fresh Atlantic salmon, rich in omega-3 fatty acids',
        price: 450,
        stock: 25,
        unit: 'kg',
        unitLabel: 'per kg',
        categoryId: freshFishCat.id
      },
      {
        name: 'Tuna Fish',
        description: 'Premium yellowfin tuna, perfect for sashimi',
        price: 380,
        stock: 15,
        unit: 'kg',
        unitLabel: 'per kg',
        categoryId: freshFishCat.id
      },
      {
        name: 'Dried Anchovies',
        description: 'Traditional dried anchovies, great for cooking',
        price: 120,
        stock: 50,
        unit: 'piece',
        unitLabel: 'per piece',
        categoryId: driedFishCat.id
      },
      {
        name: 'Dried Shrimp',
        description: 'Premium dried shrimp for authentic flavors',
        price: 200,
        stock: 30,
        unit: 'kg',
        unitLabel: 'per kg',
        categoryId: driedFishCat.id
      }
    ];

    for (const productData of sampleProducts) {
      const existing = await Product.findOne({
        where: { name: productData.name }
      });
      if (!existing) {
        await Product.create(productData);
        console.log(`Created product: ${productData.name}`);
      }
    }

    // Seed delivery slots for tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const deliverySlots = [
      { name: 'Morning (9-11 AM)', date: tomorrow, startTime: '09:00', endTime: '11:00' },
      { name: 'Afternoon (2-4 PM)', date: tomorrow, startTime: '14:00', endTime: '16:00' },
      { name: 'Evening (6-8 PM)', date: tomorrow, startTime: '18:00', endTime: '20:00' }
    ];

    for (const slot of deliverySlots) {
      const existing = await DeliverySlot.findOne({
        where: {
          date: slot.date,
          startTime: slot.startTime
        }
      });
      if (!existing) {
        await DeliverySlot.create(slot);
        console.log(`Created delivery slot: ${slot.name}`);
      }
    }

    console.log('Initial data seeding completed!');
  } catch (err) {
    console.error('Error seeding initial data:', err);
  } finally {
    process.exit();
  }
}

seedInitialData();