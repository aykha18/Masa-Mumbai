require('dotenv').config();
const Category = require('./models/Category');

async function seedCategories() {
  try {
    const categories = [
      { name: 'Fresh Fish', description: 'Freshly caught fish' },
      { name: 'Dried Fish', description: 'Dried and preserved fish' }
    ];

    for (const cat of categories) {
      await Category.findOrCreate({
        where: { name: cat.name },
        defaults: cat
      });
    }

    console.log('Categories seeded');
  } catch (err) {
    console.error('Error seeding categories:', err);
  }
  process.exit();
}

seedCategories();