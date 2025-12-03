require('dotenv').config();
const DeliverySlot = require('./models/DeliverySlot');

async function seedDeliverySlots() {
  try {
    console.log('Seeding delivery slots...');

    const now = new Date();
    const currentHour = now.getHours();

    // Get today's date in YYYY-MM-DD format
    const today = now.toISOString().split('T')[0];

    // Calculate tomorrow's date
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const slots = [];

    // Always create tomorrow's slots
    slots.push(
      {
        name: 'Tomorrow (12pm to 2pm)',
        date: tomorrowStr,
        startTime: '12:00:00',
        endTime: '14:00:00',
        maxOrders: 50
      },
      {
        name: 'Tomorrow (5pm to 8pm)',
        date: tomorrowStr,
        startTime: '17:00:00',
        endTime: '20:00:00',
        maxOrders: 50
      }
    );

    // Add today's slots based on current time
    if (currentHour >= 6 && currentHour < 12) {
      // 6 AM to 12 PM: Add Today 12-2 PM and Today 5-8 PM
      slots.push(
        {
          name: 'Today (12pm to 2pm)',
          date: today,
          startTime: '12:00:00',
          endTime: '14:00:00',
          maxOrders: 50
        },
        {
          name: 'Today (5pm to 8pm)',
          date: today,
          startTime: '17:00:00',
          endTime: '20:00:00',
          maxOrders: 50
        }
      );
    } else if (currentHour >= 14 && currentHour < 16) {
      // 2 PM to 4 PM: Add Today 5-8 PM
      slots.push({
        name: 'Today (5pm to 8pm)',
        date: today,
        startTime: '17:00:00',
        endTime: '20:00:00',
        maxOrders: 50
      });
    }
    // For other times, only tomorrow's slots are available

    // Create slots if they don't exist
    for (const slotData of slots) {
      await DeliverySlot.findOrCreate({
        where: {
          name: slotData.name,
          date: slotData.date
        },
        defaults: slotData
      });
    }

    console.log(`Created/Updated ${slots.length} delivery slots`);
    console.log('Delivery slots seeding completed!');

  } catch (err) {
    console.error('Error seeding delivery slots:', err);
  }
  process.exit();
}

seedDeliverySlots();