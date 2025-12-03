import React from 'react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Priya Sharma',
      location: 'Delhi',
      rating: 5,
      text: 'Amazing fresh fish! Delivered exactly on time and the quality is outstanding. Machhi has become my go-to for all seafood needs.',
      avatar: '👩‍🍳'
    },
    {
      name: 'Rajesh Kumar',
      location: 'Mumbai',
      rating: 5,
      text: 'The convenience is unbeatable. I can order fresh fish from my phone and get it delivered within an hour. Highly recommended!',
      avatar: '👨‍💼'
    },
    {
      name: 'Meera Patel',
      location: 'Ahmedabad',
      rating: 5,
      text: 'Finally found a reliable fish delivery service! The fish arrives perfectly fresh and well-packaged. Great customer service too.',
      avatar: '👩‍👧‍👦'
    },
    {
      name: 'Amit Singh',
      location: 'Chennai',
      rating: 5,
      text: 'Quality and freshness are top-notch. The delivery partners are professional and the app is very user-friendly.',
      avatar: '👨‍🍳'
    }
  ];

  const renderStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-blue-50 to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Don't just take our word for it - hear from thousands of satisfied customers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              {/* Rating */}
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 text-lg mr-2">
                  {renderStars(testimonial.rating)}
                </div>
                <span className="text-sm text-gray-500">
                  {testimonial.rating}.0
                </span>
              </div>

              {/* Testimonial Text */}
              <blockquote className="text-gray-700 mb-6 leading-relaxed">
                "{testimonial.text}"
              </blockquote>

              {/* Customer Info */}
              <div className="flex items-center">
                <div className="text-3xl mr-3">{testimonial.avatar}</div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    📍 {testimonial.location}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Indicators */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="text-3xl mb-2">🏆</div>
                <div className="font-semibold text-gray-900">Award Winning</div>
                <div className="text-sm text-gray-600">Best Fresh Food Delivery 2024</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🛡️</div>
                <div className="font-semibold text-gray-900">100% Safe</div>
                <div className="text-sm text-gray-600">Hygienic & Sustainable</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">⚡</div>
                <div className="font-semibold text-gray-900">Lightning Fast</div>
                <div className="text-sm text-gray-600">30-60 min delivery</div>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">💚</div>
                <div className="font-semibold text-gray-900">Eco Friendly</div>
                <div className="text-sm text-gray-600">Sustainable fishing</div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Join Thousands of Happy Customers
          </h3>
          <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
            Experience the convenience of fresh fish delivery. Start your journey to better seafood today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg">
              🛒 Get Fresh Fish Now
            </button>
            <button className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300">
              📞 Call Us: +91-9876543210
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;