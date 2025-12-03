require('dotenv').config();
const User = require('./models/User');
const Product = require('./models/Product');
const Order = require('./models/Order');

async function seedSalesData() {
  try {
    console.log('Starting sales data seeding...');

    // Create some synthetic users
    const users = [];
    for (let i = 1; i <= 50; i++) {
      const user = await User.create({
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        password: '$2a$10$hashedpassword', // dummy hash
        phone: `98765432${i.toString().padStart(2, '0')}`,
        address: `Address ${i}, Mumbai`
      });
      users.push(user);
    }

    // Get all products
    const products = await Product.findAll();
    console.log(`Found ${products.length} products`);

    // Generate orders for last 60 days
    const orders = [];
    const now = new Date();

    for (let day = 0; day < 60; day++) {
      const orderDate = new Date(now);
      orderDate.setDate(now.getDate() - day);

      // Generate 5-15 orders per day with realistic patterns
      const ordersPerDay = Math.floor(Math.random() * 11) + 5; // 5-15 orders

      for (let orderNum = 0; orderNum < ordersPerDay; orderNum++) {
        const user = users[Math.floor(Math.random() * users.length)];

        // Generate 1-5 items per order
        const itemCount = Math.floor(Math.random() * 5) + 1;
        const orderItems = [];
        let total = 0;

        for (let i = 0; i < itemCount; i++) {
          const product = products[Math.floor(Math.random() * products.length)];
          const quantity = Math.floor(Math.random() * 5) + 1; // 1-5 quantity
          orderItems.push({
            product: product.id,
            quantity: quantity,
            price: product.price
          });
          total += product.price * quantity;
        }

        // Create order with realistic UPI IDs
        const upiIds = [
          'merchant@upi', 'shop@paytm', 'store@phonepe', 'fish@googlepay',
          'seafood@upi', 'fresh@paytm', 'marine@phonepe'
        ];

        const order = await Order.create({
          userId: user.id,
          items: orderItems,
          total: total,
          status: 'Completed',
          upiId: upiIds[Math.floor(Math.random() * upiIds.length)],
          createdAt: orderDate,
          updatedAt: orderDate
        });

        orders.push(order);
      }
    }

    console.log(`Created ${orders.length} synthetic orders`);
    console.log('Sales data seeding completed!');

  } catch (err) {
    console.error('Error seeding sales data:', err);
  }
  process.exit();
}

seedSalesData();