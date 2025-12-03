require('dotenv').config();
const DeliveryConfig = require('./models/DeliveryConfig');

async function seedDeliveryConfig() {
  try {
    console.log('Seeding delivery configuration...');

    // Create or update delivery config (singleton)
    const [config, created] = await DeliveryConfig.findOrCreate({
      where: {}, // Empty where clause for singleton
      defaults: {
        partnerPaymentType: 'percentage',
        partnerPaymentValue: 10.0, // 10%
        deliveryFee: 20.0,
        tipEnabled: true,
        maxTipAmount: 100.0,
        autoAssignmentEnabled: true,
        assignmentTimeoutMinutes: 5,
        maxDeliveryRadiusKm: 10.0,
        partnerRatingThreshold: 3.5
      }
    });

    if (created) {
      console.log('Delivery configuration created');
    } else {
      console.log('Delivery configuration already exists');
    }

    console.log('Delivery configuration seeding completed!');
  } catch (err) {
    console.error('Error seeding delivery configuration:', err);
  }
  process.exit();
}

seedDeliveryConfig();