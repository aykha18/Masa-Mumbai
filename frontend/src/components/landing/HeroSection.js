import React from 'react';

const HeroSection = ({ onGetStarted }) => {
  return (
    <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 animate-bounce">
        <div className="text-4xl">🐟</div>
      </div>
      <div className="absolute top-32 right-16 animate-pulse">
        <div className="text-3xl">🧊</div>
      </div>
      <div className="absolute bottom-20 left-20 animate-bounce" style={{ animationDelay: '1s' }}>
        <div className="text-2xl">🚚</div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="text-sm font-medium">🏆 मुंबईचा विश्वासार्ह मासा डिलिव्हरी</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Masa Mumbai
              <span className="block text-blue-200">ताजा मासा • वेगवान डिलिव्हरी</span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-8 leading-relaxed">
              मुंबईच्या विश्वासार्ह मासा डिलिव्हरी सर्व्हिस.
              समुद्रापासून घरीपर्यंत, ताजा आणि वेगवान.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <button
                onClick={onGetStarted}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                🛒 ताजा मासा ऑर्डर करा
              </button>
              <button className="border-2 border-white/30 hover:border-white text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 backdrop-blur-sm">
                📖 Learn More
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center lg:justify-start gap-6 text-sm text-blue-200">
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                100% Fresh Guarantee
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                Free Delivery
              </div>
              <div className="flex items-center">
                <span className="text-green-400 mr-2">✓</span>
                30-Min Delivery
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image Placeholder */}
          <div className="relative">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
              <div className="text-center">
                <div className="text-8xl mb-4">🐟</div>
                <h3 className="text-2xl font-bold mb-2">Premium Quality Fish</h3>
                <p className="text-blue-200">Sourced directly from trusted fishermen</p>

                {/* Floating Quality Badges */}
                <div className="flex justify-center gap-4 mt-6">
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    🏆 Award Winning
                  </div>
                  <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    🧊 Ice Fresh
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -top-4 -left-4 bg-white text-blue-600 px-4 py-2 rounded-lg shadow-lg">
              <div className="text-2xl font-bold">10K+</div>
              <div className="text-sm">Happy Customers</div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-white text-green-600 px-4 py-2 rounded-lg shadow-lg">
              <div className="text-2xl font-bold">4.9★</div>
              <div className="text-sm">Customer Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave Separator */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" className="w-full h-12 fill-white">
          <path d="M0,32L48,37.3C96,43,192,53,288,58.7C384,64,480,64,576,58.7C672,53,768,43,864,48C960,53,1056,75,1152,80C1248,85,1344,75,1392,69.3L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"></path>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;