require('dotenv').config();
const Product = require('./models/Product');

async function seedProducts() {
  const products = [
    // Fresh Fish - Pomfret varieties (sold by piece)
    { name: 'White Pomfret (Paplet)', description: 'Fresh white pomfret from Arabian Sea', price: 800, categoryId: 1, stock: 50, unit: 'piece', unitLabel: 'each' },
    { name: 'Black Pomfret (Halwa)', description: 'Fresh black pomfret, premium variety', price: 900, categoryId: 1, stock: 35, unit: 'piece', unitLabel: 'each' },

    // Fresh Fish - Surmai varieties
    { name: 'Seer Fish (Surmai)', description: 'Large seer fish, ideal for curries', price: 700, categoryId: 1, stock: 25 },
    { name: 'Kingfish (Surmai)', description: 'Premium kingfish from coastal waters', price: 600, categoryId: 1, stock: 30 },
    { name: 'Premium Slicing Fish', description: 'High-quality fish for slicing', price: 550, categoryId: 1, stock: 40 },

    // Fresh Fish - Other varieties
    { name: 'Rawas (Indian Salmon)', description: 'Fresh Indian salmon, rich in omega-3', price: 650, categoryId: 1, stock: 45 },
    { name: 'Mackerel (Bangda)', description: 'Fresh Indian mackerel, rich in omega-3', price: 250, categoryId: 1, stock: 100, unit: 'kg', unitLabel: 'per kg' },
    { name: 'Bombay Duck (Bombil)', description: 'Fresh Bombay duck from coastal waters', price: 300, categoryId: 1, stock: 60, unit: 'kg', unitLabel: 'per kg' },
    { name: 'Mandeli (Small Anchovy)', description: 'Fresh small anchovy-type fish', price: 180, categoryId: 1, stock: 120, unit: 'kg', unitLabel: 'per kg' },
    { name: 'Rani (Pink Perch)', description: 'Fresh pink perch, threadfin bream', price: 400, categoryId: 1, stock: 55 },
    { name: 'Ghol (Black-spotted Croaker)', description: 'Fresh black-spotted croaker', price: 350, categoryId: 1, stock: 70 },
    { name: 'Tuna (Chura)', description: 'Fresh yellowfin tuna steaks', price: 450, categoryId: 1, stock: 40 },
    { name: 'Red Snapper', description: 'Fresh red snapper fillets', price: 550, categoryId: 1, stock: 35 },
    { name: 'Sea Bass (Bhetki)', description: 'Fresh sea bass, premium quality', price: 600, categoryId: 1, stock: 30 },
    { name: 'Sole (Repti)', description: 'Fresh sole fish', price: 500, categoryId: 1, stock: 40 },
    { name: 'Threadfin', description: 'Fresh threadfin fish', price: 450, categoryId: 1, stock: 45 },
    { name: 'Goatfish', description: 'Fresh goatfish from local waters', price: 320, categoryId: 1, stock: 65 },
    { name: 'Croakers', description: 'Fresh croaker fish varieties', price: 280, categoryId: 1, stock: 75 },
    { name: 'Ribbon Fish', description: 'Fresh ribbon fish', price: 380, categoryId: 1, stock: 50 },
    { name: 'Lizard Fish', description: 'Fresh lizard fish', price: 420, categoryId: 1, stock: 40 },
    { name: 'Shark', description: 'Fresh shark meat', price: 480, categoryId: 1, stock: 25 },
    { name: 'Baby Shark', description: 'Fresh baby shark', price: 350, categoryId: 1, stock: 30 },
    { name: 'Stingray', description: 'Fresh stingray', price: 520, categoryId: 1, stock: 20 },
    { name: 'Sardines (Tarli)', description: 'Fresh sardines, perfect for frying', price: 150, categoryId: 1, stock: 80 },
    { name: 'Rohu (Rui)', description: 'Freshwater rohu fish', price: 300, categoryId: 1, stock: 60 },
    { name: 'Catfish (Singhara)', description: 'Fresh catfish from local waters', price: 350, categoryId: 1, stock: 45 },

    // Dried Fish
    { name: 'Dried Bombay Duck (Bombil)', description: 'Traditional dried bombay duck', price: 400, categoryId: 2, stock: 70 },
    { name: 'Dried Shark (Mor)', description: 'Dried shark pieces', price: 550, categoryId: 2, stock: 35 },
    { name: 'Dried Mackerel', description: 'Dried mackerel for traditional recipes', price: 320, categoryId: 2, stock: 55 },
    { name: 'Dried Tuna', description: 'Dried tuna flakes', price: 480, categoryId: 2, stock: 40 },
    { name: 'Dried Sardines', description: 'Dried sardines for snacks', price: 280, categoryId: 2, stock: 65 },
    { name: 'Dried Anchovies', description: 'Dried small anchovies', price: 360, categoryId: 2, stock: 80 },
    { name: 'Dried Croaker', description: 'Dried croaker fish', price: 420, categoryId: 2, stock: 45 },

    // Fresh Prawns/Crustaceans
    { name: 'Fresh Prawns (Small)', description: 'Fresh small prawns', price: 450, categoryId: 1, stock: 100 },
    { name: 'Fresh Prawns (Medium)', description: 'Fresh medium prawns', price: 550, categoryId: 1, stock: 80 },
    { name: 'Tiger Prawns', description: 'Fresh tiger prawns', price: 750, categoryId: 1, stock: 40 },
    { name: 'Vannamei Prawns', description: 'Fresh vannamei prawns', price: 480, categoryId: 1, stock: 90 },
    { name: 'White Prawns', description: 'Fresh white prawns', price: 520, categoryId: 1, stock: 70 },
    { name: 'Crabs (Chimbori/Kekda)', description: 'Fresh local crabs', price: 600, categoryId: 1, stock: 35 },
    { name: 'Blue Crab', description: 'Fresh blue crab', price: 650, categoryId: 1, stock: 25 },
    { name: 'Squid (Calamari)', description: 'Fresh squid tubes and rings', price: 380, categoryId: 1, stock: 55 },
    { name: 'Cuttlefish', description: 'Fresh cuttlefish', price: 420, categoryId: 1, stock: 40 },
    { name: 'Mussels (Tisrya)', description: 'Fresh mussels', price: 250, categoryId: 1, stock: 85 },
    { name: 'Clams', description: 'Fresh clams and shellfish', price: 300, categoryId: 1, stock: 60 },

    // Dried Prawns/Crustaceans (using Dried Fish category)
    { name: 'Dried Prawns (Large)', description: 'Large dried prawns from Konkan coast', price: 650, categoryId: 2, stock: 30 },
    { name: 'Dried Prawns (Medium)', description: 'Medium dried prawns', price: 450, categoryId: 2, stock: 50 },
    { name: 'Dried Shrimp', description: 'Small dried shrimp', price: 350, categoryId: 2, stock: 75 },
    { name: 'Dried Squid', description: 'Dried squid pieces', price: 480, categoryId: 2, stock: 35 },
    { name: 'Dried Cuttlefish', description: 'Dried cuttlefish', price: 520, categoryId: 2, stock: 25 }
  ];

  try {
    for (const prod of products) {
      await Product.findOrCreate({
        where: { name: prod.name },
        defaults: prod
      });
    }
    console.log('Products seeded successfully');
  } catch (err) {
    console.error('Error seeding products:', err);
  }
  process.exit();
}

seedProducts();