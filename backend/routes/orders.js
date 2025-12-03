const express = require('express');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const DeliverySlot = require('../models/DeliverySlot');
const Address = require('../models/Address');
const DeliveryConfig = require('../models/DeliveryConfig');
const auth = require('../middleware/auth');
const DeliveryService = require('../services/deliveryService');

const router = express.Router();

// Apply JSON parsing middleware to order routes
router.use(express.json());

// Place order
router.post('/', auth, async (req, res) => {
  const { deliverySlotId, addressId, paymentMethod, tipAmount } = req.body;

  // Validate address selection
  if (!addressId) {
    return res.status(400).json({ message: 'Delivery address selection is required' });
  }

  // Validate delivery slot selection
  if (!deliverySlotId) {
    return res.status(400).json({ message: 'Delivery slot selection is required' });
  }

  // Validate payment method
  if (!paymentMethod || !['cod', 'upi'].includes(paymentMethod)) {
    return res.status(400).json({ message: 'Valid payment method is required (cod or upi)' });
  }

  const deliverySlot = await DeliverySlot.findByPk(deliverySlotId);
  if (!deliverySlot) {
    return res.status(400).json({ message: 'Invalid delivery slot' });
  }

  if (!deliverySlot.isActive) {
    return res.status(400).json({ message: 'Delivery slot is not available' });
  }

  if (deliverySlot.currentOrders >= deliverySlot.maxOrders) {
    return res.status(400).json({ message: 'Delivery slot is full' });
  }

  // Validate address
  const address = await Address.findOne({
    where: { id: addressId, userId: req.user.id }
  });
  if (!address) {
    return res.status(400).json({ message: 'Invalid delivery address' });
  }

  const cart = await Cart.findOne({ where: { userId: req.user.id } });
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart is empty' });

  // Validate stock availability and get product details
  const items = [];
  for (const item of cart.items) {
    const productId = typeof item.product === 'object' ? item.product.id : item.product;
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(400).json({ message: `Product ${productId} not found` });
    }

    // Check stock availability
    if (product.stock < item.quantity) {
      return res.status(400).json({
        message: `Insufficient stock for ${product.name}. Available: ${product.stock} ${product.unit === 'kg' ? 'kg' : product.unit === 'dozen' ? 'dozen' : 'pieces'}`
      });
    }

    items.push({ product: productId, quantity: item.quantity, price: product.price });
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Validate and handle tip
  let finalTipAmount = 0;
  if (tipAmount && tipAmount > 0) {
    const config = await DeliveryConfig.findOne();
    if (config && config.tipEnabled) {
      if (tipAmount > config.maxTipAmount) {
        return res.status(400).json({ message: `Tip amount cannot exceed ₹${config.maxTipAmount}` });
      }
      finalTipAmount = tipAmount;
    }
  }

  // Calculate delivery fee
  const config = await DeliveryConfig.findOne();
  const deliveryFee = config ? config.deliveryFee : 20;

  // Generate UPI ID for UPI payments
  let upiId = null;
  if (paymentMethod === 'upi') {
    upiId = 'aykha2020@kotak';
  }

  console.log('Creating order with data:', {
    userId: req.user.id,
    items,
    total,
    tipAmount: finalTipAmount,
    deliveryFee,
    deliverySlotId,
    addressId,
    paymentMethod,
    upiId
  });

  const order = await Order.create({
    userId: req.user.id,
    items,
    total,
    tipAmount: finalTipAmount,
    deliveryFee,
    deliverySlotId,
    addressId,
    upiId
  });

  // Deduct stock from products
  for (const item of cart.items) {
    const productId = typeof item.product === 'object' ? item.product.id : item.product;
    const product = await Product.findByPk(productId);
    await product.decrement('stock', { by: item.quantity });
  }

  // Update delivery slot order count
  await deliverySlot.increment('currentOrders');

  await cart.destroy(); // Clear cart

  // Assign delivery partner
  try {
    console.log(`🔄 Starting delivery assignment for order ${order.id}...`);
    const assignmentResult = await DeliveryService.assignDeliveryPartner(order.id);
    console.log(`📋 Assignment result for order ${order.id}:`, assignmentResult ? 'SUCCESS' : 'NO PARTNER FOUND');
  } catch (error) {
    console.error('❌ Error assigning delivery partner:', error);
    // Don't fail the order if delivery assignment fails
  }

  // Return order with UPI payment URL for UPI payments
  const response = { ...order.toJSON() };
  if (paymentMethod === 'upi' && upiId) {
    response.upiPaymentUrl = generateUPIPaymentURL(upiId, total + finalTipAmount, `Order-${order.id}`);
  }

  res.status(201).json(response);
});

// Rate delivery partner
router.post('/:id/rate-delivery', auth, async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const order = await Order.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        deliveryStatus: 'delivered'
      },
      include: [{ model: require('../models/DeliveryPartner'), as: 'deliveryPartner' }]
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found or not delivered yet' });
    }

    if (order.deliveryRating) {
      return res.status(400).json({ message: 'Order already rated' });
    }

    // Update order with rating
    await order.update({
      deliveryRating: rating,
      deliveryReview: review
    });

    // Update partner rating
    if (order.deliveryPartner) {
      await DeliveryService.updatePartnerRating(order.deliveryPartner.id, rating);
    }

    res.json({ message: 'Rating submitted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Helper function to generate UPI payment URL
const generateUPIPaymentURL = (upiId, amount, note) => {
  const baseUrl = 'tez://pay';
  const params = new URLSearchParams({
    pa: upiId,
    pn: 'Machhi E-Commerce',
    am: amount.toString(),
    cu: 'INR',
    tn: note
  });
  return `${baseUrl}?${params.toString()}`;
};

// Get user orders
router.get('/', auth, async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { userId: req.user.id }
    });

    // Populate products and delivery slots
    const ordersWithProducts = await Promise.all(orders.map(async order => {
      const items = await Promise.all(order.items.map(async item => {
        try {
          const productId = typeof item.product === 'object' ? item.product.id : item.product;
          const product = await Product.findByPk(productId);
          return { ...item, product: product || { name: 'Product not found', price: item.price } };
        } catch (err) {
          return { ...item, product: { name: 'Product not found', price: item.price } };
        }
      }));

      // Get delivery slot if exists
      let deliverySlot = null;
      if (order.deliverySlotId) {
        try {
          deliverySlot = await DeliverySlot.findByPk(order.deliverySlotId);
        } catch (err) {
          console.error('Error fetching delivery slot:', err);
        }
      }

      // Get address if exists
      let address = null;
      if (order.addressId) {
        try {
          address = await Address.findByPk(order.addressId);
        } catch (err) {
          console.error('Error fetching address:', err);
        }
      }

      return { ...order.toJSON(), items, deliverySlot, address };
    }));
    res.json(ordersWithProducts);
  } catch (err) {
    console.error('Error fetching orders:', err);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

// Update payment status (for UPI payments)
router.put('/:id/payment-status', auth, async (req, res) => {
  const { paymentStatus, upiTransactionId } = req.body;

  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Only allow updating payment status for UPI orders
    if (order.paymentMethod !== 'upi') {
      return res.status(400).json({ message: 'Payment status can only be updated for UPI payments' });
    }

    // Only allow owner or admin to update
    if (order.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    await order.update({
      paymentStatus,
      upiTransactionId: upiTransactionId || order.upiTransactionId
    });

    // If payment is completed, update order status
    if (paymentStatus === 'completed') {
      await order.update({ status: 'Confirmed' });
    }

    res.json(order);
  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ message: 'Error updating payment status' });
  }
});

// Guest checkout (no authentication required)
router.post('/guest', async (req, res) => {
  const { deliverySlotId, address, paymentMethod, items } = req.body;

  // Validate required fields
  if (!deliverySlotId) {
    return res.status(400).json({ message: 'Delivery slot selection is required' });
  }

  if (!address || !address.fullName || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
    return res.status(400).json({ message: 'Complete delivery address is required' });
  }

  if (!paymentMethod || !['cod', 'upi'].includes(paymentMethod)) {
    return res.status(400).json({ message: 'Valid payment method is required (cod or upi)' });
  }

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Cart items are required' });
  }

  // Validate delivery slot
  const deliverySlot = await DeliverySlot.findByPk(deliverySlotId);
  if (!deliverySlot) {
    return res.status(400).json({ message: 'Invalid delivery slot' });
  }

  if (!deliverySlot.isActive) {
    return res.status(400).json({ message: 'Delivery slot is not available' });
  }

  if (deliverySlot.currentOrders >= deliverySlot.maxOrders) {
    return res.status(400).json({ message: 'Delivery slot is full' });
  }

  // Validate stock availability and get product details
  const validatedItems = [];
  for (const item of items) {
    const productId = typeof item.product === 'object' ? item.product.id : item.product;
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(400).json({ message: `Product ${productId} not found` });
    }

    // Check stock availability
    if (product.stock < item.quantity) {
      return res.status(400).json({
        message: `Insufficient stock for ${product.name}. Available: ${product.stock} ${product.unit === 'kg' ? 'kg' : product.unit === 'dozen' ? 'dozen' : 'pieces'}`
      });
    }

    validatedItems.push({ product: productId, quantity: item.quantity, price: product.price });
  }

  const total = validatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // Generate UPI ID for UPI payments
  let upiId = null;
  if (paymentMethod === 'upi') {
    upiId = 'aykha2020@kotak';
  }

  console.log('Creating guest order with data:', {
    guestEmail: address.email || null,
    items: validatedItems,
    total,
    deliverySlotId,
    address,
    paymentMethod,
    upiId
  });

  // Create guest order
  const order = await Order.create({
    userId: null, // Guest order
    items: validatedItems,
    total,
    deliverySlotId,
    addressId: null,
    guestAddress: address,
    guestInfo: {
      name: address.fullName,
      email: address.email,
      phone: address.phone
    },
    upiId,
    status: 'Guest Order'
  });

  // Deduct stock from products
  for (const item of validatedItems) {
    const productId = typeof item.product === 'object' ? item.product.id : item.product;
    const product = await Product.findByPk(productId);
    await product.decrement('stock', { by: item.quantity });
  }

  // Update delivery slot order count
  await deliverySlot.increment('currentOrders');

  // Return order with UPI payment URL for UPI payments
  const response = {
    ...order.toJSON(),
    guestInfo: {
      name: address.fullName,
      email: address.email,
      phone: address.phone,
      address: address
    }
  };

  if (paymentMethod === 'upi' && upiId) {
    response.upiPaymentUrl = generateUPIPaymentURL(upiId, total, `Guest-Order-${order.id}`);
  }

  res.status(201).json(response);
});

module.exports = router;