import React from 'react';

const HowItWorksSection = () => {
  const steps = [
    {
      step: '01',
      icon: '🎣',
      title: 'Fresh Catch',
      description: 'Our expert fishermen catch fish early morning from sustainable sources and bring them to our processing facility.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      step: '02',
      icon: '🧊',
      title: 'Quality Check',
      description: 'Each fish undergoes rigorous quality inspection, cleaning, and is packed with ice for maximum freshness.',
      color: 'from-green-500 to-green-600'
    },
    {
      step: '03',
      icon: '📱',
      title: 'Easy Ordering',
      description: 'Browse our catalog, select your favorite fish, choose delivery time, and place your order online.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      step: '04',
      icon: '🚚',
      title: 'Fast Delivery',
      description: 'Our delivery partners ensure your fresh fish arrives within the promised time slot, perfectly chilled.',
      color: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            From ocean to table in just a few simple steps
          </p>
        </div>

        <div className="relative">
          {/* Connection Line */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-green-200 to-purple-200"></div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Step Number */}
                <div className="flex justify-center mb-6">
                  <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}>
                    {step.step}
                  </div>
                </div>

                {/* Icon */}
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">{step.icon}</div>
                </div>

                {/* Content */}
                <div className="text-center bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="lg:hidden flex justify-center mt-8">
                    <div className="text-2xl text-gray-400">↓</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Ready to Get Fresh Fish?
            </h3>
            <p className="text-gray-600 mb-8 text-lg">
              Join thousands of satisfied customers who trust Machhi for their daily fresh fish needs.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              🛒 Start Ordering Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;