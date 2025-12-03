const DeliveryPartner = require('../models/DeliveryPartner');
const Order = require('../models/Order');
const DeliveryConfig = require('../models/DeliveryConfig');
const User = require('../models/User');

class DeliveryService {
  // Assign delivery partner to order
  static async assignDeliveryPartner(orderId) {
    try {
      console.log(`🔍 Finding order ${orderId}...`);
      const order = await Order.findByPk(orderId);
      if (!order) {
        console.log(`❌ Order ${orderId} not found`);
        throw new Error('Order not found');
      }
      console.log(`✅ Order ${orderId} found, status: ${order.status}`);

      // Get delivery configuration
      console.log(`⚙️ Checking delivery config...`);
      const config = await DeliveryConfig.findOne();
      if (!config || !config.autoAssignmentEnabled) {
        console.log(`❌ Auto assignment disabled or config not found`);
        return null;
      }
      console.log(`✅ Auto assignment enabled, rating threshold: ${config.partnerRatingThreshold}`);

      // Find available delivery partners
      const availablePartners = await DeliveryPartner.findAll({
        where: {
          isAvailable: true,
          isActive: true,
          rating: {
            [require('sequelize').Op.gte]: config.partnerRatingThreshold
          }
        },
        include: [{ model: User, as: 'user' }],
        order: [
          ['rating', 'DESC'], // Prioritize higher rated partners
          ['totalDeliveries', 'ASC'] // Then by experience (fewer deliveries = newer)
        ]
      });

      console.log(`🔍 Found ${availablePartners.length} available partners`);
      availablePartners.forEach(partner => {
        console.log(`   - Partner ${partner.id}: ${partner.user.name}, rating: ${partner.rating}, available: ${partner.isAvailable}, active: ${partner.isActive}`);
      });

      if (availablePartners.length === 0) {
        console.log(`❌ No available partners found for order ${orderId}`);
        return null;
      }

      // Implement load balancing: assign to partner with least current deliveries
      // First, get current delivery counts for each partner
      const partnersWithLoad = await Promise.all(
        availablePartners.map(async (partner) => {
          const currentDeliveries = await Order.count({
            where: {
              deliveryPartnerId: partner.id,
              deliveryStatus: {
                [require('sequelize').Op.in]: ['assigned', 'accepted', 'picked_up']
              }
            }
          });
          return {
            ...partner.toJSON(),
            currentLoad: currentDeliveries
          };
        })
      );

      // Sort by current load (ascending), then by rating (descending)
      partnersWithLoad.sort((a, b) => {
        if (a.currentLoad !== b.currentLoad) {
          return a.currentLoad - b.currentLoad; // Less load first
        }
        return b.rating - a.rating; // Higher rating first
      });

      console.log(`📊 Partner load distribution:`);
      partnersWithLoad.forEach(partner => {
        console.log(`   - Partner ${partner.id}: ${partner.user.name}, load: ${partner.currentLoad}, rating: ${partner.rating}`);
      });

      const assignedPartner = partnersWithLoad[0];

      // Update order with delivery partner
      console.log(`📋 Assigning order ${orderId} to partner ${assignedPartner.user.name} (ID: ${assignedPartner.id})`);
      await order.update({
        deliveryPartnerId: assignedPartner.id,
        deliveryStatus: 'assigned',
        deliveryAssignedAt: new Date()
      });

      // Add tracking note
      const trackingNotes = [...(order.trackingNotes || []), {
        status: 'assigned',
        message: `Order assigned to delivery partner ${assignedPartner.user.name}`,
        timestamp: new Date()
      }];
      await order.update({ trackingNotes });

      console.log(`✅ Order ${orderId} successfully assigned to partner ${assignedPartner.user.name}`);
      return assignedPartner;

    } catch (error) {
      console.error('Error assigning delivery partner:', error);
      return null;
    }
  }

  // Calculate partner earnings for an order
  static async calculatePartnerEarnings(order) {
    try {
      const config = await DeliveryConfig.findOne();
      if (!config) {
        return 0;
      }

      let earnings = 0;

      if (config.partnerPaymentType === 'percentage') {
        earnings = (order.total * config.partnerPaymentValue) / 100;
      } else {
        earnings = config.partnerPaymentValue;
      }

      // Add tip if any
      earnings += order.tipAmount || 0;

      return Math.round(earnings * 100) / 100; // Round to 2 decimal places

    } catch (error) {
      console.error('Error calculating partner earnings:', error);
      return 0;
    }
  }

  // Update partner earnings when delivery is completed
  static async updatePartnerEarnings(orderId) {
    try {
      const order = await Order.findByPk(orderId, {
        include: [{ model: DeliveryPartner, as: 'deliveryPartner' }]
      });

      if (!order || !order.deliveryPartner) {
        return;
      }

      const earnings = await this.calculatePartnerEarnings(order);

      // Update order with earnings
      await order.update({ partnerEarnings: earnings });

      // Update partner's total earnings and delivery count
      await order.deliveryPartner.increment('totalEarnings', { by: earnings });
      await order.deliveryPartner.increment('totalDeliveries');

      console.log(`Updated earnings for partner ${order.deliveryPartnerId}: +₹${earnings}`);

    } catch (error) {
      console.error('Error updating partner earnings:', error);
    }
  }

  // Handle delivery timeout (reassign if not accepted)
  static async handleDeliveryTimeout(orderId) {
    try {
      const order = await Order.findByPk(orderId);
      if (!order || order.deliveryStatus !== 'assigned') {
        return;
      }

      const config = await DeliveryConfig.findOne();
      if (!config) return;

      const assignedTime = new Date(order.deliveryAssignedAt);
      const now = new Date();
      const minutesElapsed = (now - assignedTime) / (1000 * 60);

      if (minutesElapsed >= config.assignmentTimeoutMinutes) {
        // Timeout reached, reassign to another partner
        console.log(`Delivery timeout for order ${orderId}, reassigning...`);

        await order.update({
          deliveryPartnerId: null,
          deliveryStatus: null,
          deliveryAssignedAt: null
        });

        // Add tracking note
        const trackingNotes = [...(order.trackingNotes || []), {
          status: 'timeout',
          message: 'Delivery assignment timed out, reassigning to another partner',
          timestamp: new Date()
        }];
        await order.update({ trackingNotes });

        // Try to assign to another partner
        await this.assignDeliveryPartner(orderId);
      }

    } catch (error) {
      console.error('Error handling delivery timeout:', error);
    }
  }

  // Update partner rating
  static async updatePartnerRating(partnerId, newRating) {
    try {
      const partner = await DeliveryPartner.findByPk(partnerId);
      if (!partner) return;

      const currentTotal = partner.rating * partner.totalRatings;
      const newTotal = currentTotal + newRating;
      const newAverage = newTotal / (partner.totalRatings + 1);

      await partner.update({
        rating: Math.round(newAverage * 10) / 10, // Round to 1 decimal
        totalRatings: partner.totalRatings + 1
      });

    } catch (error) {
      console.error('Error updating partner rating:', error);
    }
  }

  // Get delivery statistics
  static async getDeliveryStats() {
    try {
      const totalPartners = await DeliveryPartner.count({ where: { isActive: true } });
      const availablePartners = await DeliveryPartner.count({
        where: { isAvailable: true, isActive: true }
      });

      const pendingOrders = await Order.count({
        where: { deliveryStatus: 'assigned' }
      });

      const completedToday = await Order.count({
        where: {
          deliveryStatus: 'delivered',
          deliveryCompletedAt: {
            [require('sequelize').Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      });

      return {
        totalPartners,
        availablePartners,
        pendingOrders,
        completedToday
      };

    } catch (error) {
      console.error('Error getting delivery stats:', error);
      return null;
    }
  }
}

module.exports = DeliveryService;