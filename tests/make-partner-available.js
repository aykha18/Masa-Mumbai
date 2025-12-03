const DeliveryPartner = require('./backend/models/DeliveryPartner');

async function makePartnerAvailable() {
  try {
    // Find the delivery partner for sunil@gmail.com (userId: 4)
    const partner = await DeliveryPartner.findOne({
      where: { userId: 4 }
    });

    if (!partner) {
      console.log('Delivery partner not found');
      return;
    }

    // Make the partner available
    await partner.update({
      isAvailable: true,
      rating: 4.5 // Give a good rating to meet the threshold
    });

    console.log('✅ Delivery partner is now available for assignments');
    console.log('Partner ID:', partner.id);
    console.log('User ID:', partner.userId);
    console.log('Available:', partner.isAvailable);
    console.log('Rating:', partner.rating);

  } catch (error) {
    console.error('Error making partner available:', error);
  }
  process.exit();
}

makePartnerAvailable();