import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-3">🐟</div>
              <h3 className="text-2xl font-bold">Masa Mumbai</h3>
            </div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              मुंबईचा विश्वासार्ह मासा डिलिव्हरी सर्व्हिस. समुद्रापासून घरीपर्यंत
              ताजा मासा, हमीशह गुणवत्ता आणि शाश्वत पद्धती.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                📘 Facebook
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                📷 Instagram
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                🐦 Twitter
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  🛒 Shop Now
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  📋 How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  📞 Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                  ❓ FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center">
                <span className="text-gray-400 mr-2">📞</span>
                <span>+91-9876543210</span>
              </li>
              <li className="flex items-center">
                <span className="text-gray-400 mr-2">📧</span>
                <span>hello@masamumbai.com</span>
              </li>
              <li className="flex items-center">
                <span className="text-gray-400 mr-2">📍</span>
                <span>Mumbai, India</span>
              </li>
              <li className="flex items-center">
                <span className="text-gray-400 mr-2">🕒</span>
                <span>Mon-Sun: 6AM-10PM</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-lg font-semibold mb-4">Stay Updated</h4>
            <p className="text-gray-400 mb-6">
              Get fresh deals and seafood tips delivered to your inbox
            </p>
            <div className="flex">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
              />
              <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-r-lg font-medium transition duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © 2024 Masa Mumbai. सर्व हक्क राखीव.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition duration-200">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;