const express = require('express');
const { Op } = require('sequelize');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const auth = require('../middleware/auth');

const router = express.Router();

// All analytics routes require admin authentication
router.use(auth);
router.use((req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
});

// Get overall sales statistics
router.get('/stats', async (req, res) => {
  try {
    const totalOrders = await Order.count();
    const totalRevenue = await Order.sum('total');
    const avgOrderValue = totalRevenue / totalOrders;

    // Get date range (last 60 days)
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const recentOrders = await Order.count({
      where: { createdAt: { [Op.gte]: sixtyDaysAgo } }
    });

    const recentRevenue = await Order.sum('total', {
      where: { createdAt: { [Op.gte]: sixtyDaysAgo } }
    });

    res.json({
      totalOrders,
      totalRevenue: totalRevenue || 0,
      avgOrderValue: avgOrderValue || 0,
      recentOrders,
      recentRevenue: recentRevenue || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get sales by day of week
router.get('/sales-by-day', async (req, res) => {
  try {
    const orders = await Order.findAll({
      attributes: [
        [Order.sequelize.fn('EXTRACT', Order.sequelize.literal('DOW FROM "createdAt"')), 'dayOfWeek'],
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'orderCount'],
        [Order.sequelize.fn('SUM', Order.sequelize.col('total')), 'totalRevenue']
      ],
      group: [Order.sequelize.fn('EXTRACT', Order.sequelize.literal('DOW FROM "createdAt"'))],
      order: [[Order.sequelize.fn('EXTRACT', Order.sequelize.literal('DOW FROM "createdAt"')), 'ASC']]
    });

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const result = orders.map(order => ({
      day: dayNames[order.dataValues.dayOfWeek],
      orders: parseInt(order.dataValues.orderCount),
      revenue: parseFloat(order.dataValues.totalRevenue)
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get top selling products
router.get('/top-products', async (req, res) => {
  try {
    // This is a complex query that aggregates order items
    const topProducts = await Order.sequelize.query(`
      SELECT
        p.id,
        p.name,
        p.price,
        c.name as category,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.quantity * oi.price) as total_revenue,
        COUNT(DISTINCT o.id) as order_count
      FROM "Orders" o
      CROSS JOIN LATERAL json_array_elements(o.items) as item
      JOIN LATERAL json_to_record(item) as oi(product int, quantity int, price float) ON true
      JOIN "Products" p ON p.id = oi.product
      LEFT JOIN "Categories" c ON c.id = p."categoryId"
      GROUP BY p.id, p.name, p.price, c.name
      ORDER BY total_revenue DESC
      LIMIT 10
    `, {
      type: Order.sequelize.QueryTypes.SELECT
    });

    res.json(topProducts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get daily sales trend (last 60 days)
router.get('/daily-trend', async (req, res) => {
  try {
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const dailySales = await Order.findAll({
      attributes: [
        [Order.sequelize.fn('DATE', Order.sequelize.col('createdAt')), 'date'],
        [Order.sequelize.fn('COUNT', Order.sequelize.col('id')), 'orders'],
        [Order.sequelize.fn('SUM', Order.sequelize.col('total')), 'revenue']
      ],
      where: {
        createdAt: { [Op.gte]: sixtyDaysAgo }
      },
      group: [Order.sequelize.fn('DATE', Order.sequelize.col('createdAt'))],
      order: [[Order.sequelize.fn('DATE', Order.sequelize.col('createdAt')), 'ASC']]
    });

    const result = dailySales.map(sale => ({
      date: sale.dataValues.date,
      orders: parseInt(sale.dataValues.orders),
      revenue: parseFloat(sale.dataValues.revenue || 0)
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get weekly sales trend
router.get('/weekly-trend', async (req, res) => {
  try {
    const weeklySales = await Order.sequelize.query(`
      SELECT
        DATE_TRUNC('week', "createdAt") as week_start,
        COUNT(*) as orders,
        SUM(total) as revenue
      FROM "Orders"
      WHERE "createdAt" >= CURRENT_DATE - INTERVAL '60 days'
      GROUP BY DATE_TRUNC('week', "createdAt")
      ORDER BY week_start ASC
    `, {
      type: Order.sequelize.QueryTypes.SELECT
    });

    res.json(weeklySales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get monthly sales trend
router.get('/monthly-trend', async (req, res) => {
  try {
    const monthlySales = await Order.sequelize.query(`
      SELECT
        DATE_TRUNC('month', "createdAt") as month_start,
        COUNT(*) as orders,
        SUM(total) as revenue
      FROM "Orders"
      WHERE "createdAt" >= CURRENT_DATE - INTERVAL '60 days'
      GROUP BY DATE_TRUNC('month', "createdAt")
      ORDER BY month_start ASC
    `, {
      type: Order.sequelize.QueryTypes.SELECT
    });

    res.json(monthlySales);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get category performance
router.get('/category-performance', async (req, res) => {
  try {
    const categoryStats = await Order.sequelize.query(`
      SELECT
        c.name as category,
        COUNT(DISTINCT o.id) as orders,
        SUM(oi.quantity) as total_quantity,
        SUM(oi.quantity * oi.price) as total_revenue
      FROM "Orders" o
      CROSS JOIN LATERAL json_array_elements(o.items) as item
      JOIN LATERAL json_to_record(item) as oi(product int, quantity int, price float) ON true
      JOIN "Products" p ON p.id = oi.product
      JOIN "Categories" c ON c.id = p."categoryId"
      GROUP BY c.name
      ORDER BY total_revenue DESC
    `, {
      type: Order.sequelize.QueryTypes.SELECT
    });

    res.json(categoryStats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;