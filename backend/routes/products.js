const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const router = express.Router();

// Apply JSON parsing middleware
router.use(express.json());

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: { model: Category, as: 'category' }
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all products with search and filter
router.get('/', async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice, sort, page = 1, limit = 20 } = req.query;
    const { Op } = require('sequelize');

    const whereClause = {};
    if (q) whereClause.name = { [Op.iLike]: `%${q}%` };
    if (category) whereClause.categoryId = category;
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
    }

    const order = [];
    switch (sort) {
      case 'price_asc': order.push(['price', 'ASC']); break;
      case 'price_desc': order.push(['price', 'DESC']); break;
      case 'newest': order.push(['createdAt', 'DESC']); break;
      case 'name': order.push(['name', 'ASC']); break;
      default: order.push(['createdAt', 'DESC']);
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: products } = await Product.findAndCountAll({
      where: whereClause,
      include: { model: Category, as: 'category' },
      order,
      limit: parseInt(limit),
      offset
    });

    res.json({
      products,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add product
router.post('/', auth, upload.any(), async (req, res) => {
  try {

    const productData = {};

    // Parse FormData manually
    req.files.forEach(file => {
      if (file.fieldname === 'images') {
        if (!productData.images) productData.images = [];
        productData.images.push(`/uploads/${file.filename}`);
      }
    });

    // Parse text fields from req.body (multer populates this with text fields)
    Object.keys(req.body).forEach(key => {
      const value = req.body[key];
      if (value !== undefined && value !== '') {
        switch (key) {
          case 'price':
            productData[key] = parseFloat(value);
            break;
          case 'categoryId':
          case 'stock':
            productData[key] = parseInt(value);
            break;
          default:
            productData[key] = value;
        }
      }
    });

    // Set primary image if images exist
    if (productData.images && productData.images.length > 0) {
      productData.primaryImage = productData.images[0];
    }

    console.log('Final product data:', productData);

    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (err) {
    console.error('Error creating product:', err);
    res.status(400).json({ message: err.message });
  }
});

// Update product
router.put('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (product) {
      await product.update(req.body);
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  const product = await Product.findByPk(req.params.id);
  if (product) {
    await product.destroy();
    res.json({ message: 'Deleted' });
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
});

module.exports = router;