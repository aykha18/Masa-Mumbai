const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply JSON parsing middleware to cart routes
router.use(express.json());

// Get cart for user
router.get('/', auth, async (req, res) => {
  const cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (cart) {
    // Populate products and filter out items with missing products
    const items = [];
    for (const item of cart.items) {
      // Handle both old format (product object) and new format (product ID)
      const productId = typeof item.product === 'object' ? item.product.id : item.product;
      const product = await Product.findByPk(productId);
      if (product) {
        items.push({ ...item, product });
      }
    }
    // Update cart if any items were removed or format changed
    if (items.length !== cart.items.length) {
      await cart.update({ items: items.map(item => ({ product: item.product.id, quantity: item.quantity })) });
    }
    res.json({ ...cart.toJSON(), items });
  } else {
    res.json({ items: [] });
  }
});

// Add to cart
router.post('/', auth, async (req, res) => {
  const { productId, quantity } = req.body;

  // Check if product exists
  const product = await Product.findByPk(productId);
  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  let cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (!cart) {
    cart = await Cart.create({ userId: req.user.id, items: [] });
  }
  const items = [...cart.items];
  const itemIndex = items.findIndex(item => item.product === productId);
  if (itemIndex > -1) {
    items[itemIndex].quantity += quantity;
  } else {
    items.push({ product: productId, quantity });
  }
  await cart.update({ items });
  res.json(cart);
});

// Update cart item quantity
router.put('/:productId', auth, async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (cart) {
    const productId = parseInt(req.params.productId);
    const items = [...cart.items];
    const itemIndex = items.findIndex(item => {
      const itemProductId = typeof item.product === 'object' ? item.product.id : item.product;
      return itemProductId === productId;
    });
    if (itemIndex > -1) {
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        items.splice(itemIndex, 1);
      } else {
        items[itemIndex].quantity = quantity;
      }
      await cart.update({ items });
    }
  }
  res.json(cart);
});

// Remove from cart
router.delete('/:productId', auth, async (req, res) => {
  const cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (cart) {
    const productId = parseInt(req.params.productId);
    const items = cart.items.filter(item => {
      const itemProductId = typeof item.product === 'object' ? item.product.id : item.product;
      return itemProductId !== productId;
    });
    await cart.update({ items });
  }
  res.json(cart);
});

module.exports = router;