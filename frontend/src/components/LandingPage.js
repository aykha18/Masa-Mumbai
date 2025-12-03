import React from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import HowItWorksSection from './landing/HowItWorksSection';
import ProductShowcase from './landing/ProductShowcase';
import TestimonialsSection from './landing/TestimonialsSection';
import Footer from './landing/Footer';

const LandingPage = ({ token, role }) => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (token) {
      navigate('/');
    } else {
      navigate('/register');
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">🐟 Machhi</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {!token ? (
                <>
                  <button
                    onClick={handleLogin}
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleGetStarted}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200 text-sm font-medium"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <button
                  onClick={() => navigate('/')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-200 text-sm font-medium"
                >
                  Go to Shop
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <HeroSection onGetStarted={handleGetStarted} />
        <FeaturesSection />
        <HowItWorksSection />
        <ProductShowcase />
        <TestimonialsSection />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;