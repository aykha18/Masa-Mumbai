import React from 'react';

const FeaturesSection = () => {
  const features = [
    {
      icon: '🧊',
      title: 'Guaranteed Fresh',
      description: 'Fish caught and delivered within 24 hours. Ice-packed for maximum freshness.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: '🚚',
      title: 'Fast Delivery',
      description: 'Choose from multiple time slots. Get your order delivered in 30-60 minutes.',
      color: 'from-green-500 to-green-600'
    },
    {
      icon: '⭐',
      title: 'Premium Quality',
      description: 'Carefully selected, cleaned, and prepared by expert fishermen and handlers.',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      icon: '💳',
      title: 'Secure Payment',
      description: 'Multiple payment options including UPI, cards, and cash on delivery.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: '📱',
      title: 'Easy Ordering',
      description: 'Order from your phone anytime. Track your delivery in real-time.',
      color: 'from-pink-500 to-rose-500'
    },
    {
      icon: '🏆',
      title: 'Trusted Service',
      description: '10,000+ happy customers. Rated 4.9 stars on all platforms.',
      color: 'from-indigo-500 to-blue-500'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why Choose Machhi?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience the difference with India's most trusted fresh fish delivery service
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group bg-gray-50 rounded-xl p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${feature.color} text-white text-2xl mb-6 group-hover:scale-110 transition-transform duration-300`}>
                {feature.icon}
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-50 to-green-50 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">10K+</div>
              <div className="text-gray-600">Happy Customers</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-green-600 mb-2">50+</div>
              <div className="text-gray-600">Fresh Varieties</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-purple-600 mb-2">24hrs</div>
              <div className="text-gray-600">Max Freshness</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">4.9★</div>
              <div className="text-gray-600">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;