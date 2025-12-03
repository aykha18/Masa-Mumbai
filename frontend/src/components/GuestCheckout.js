import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import API_BASE from '../api';

const GuestCheckout = ({ onSuccess }) => {
  const { cart, clearCart } = useCart();
  const [deliverySlots, setDeliverySlots] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  const [address, setAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });

  useEffect(() => {
    fetchDeliverySlots();
  }, []);

  const fetchDeliverySlots = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/delivery-slots`);
      setDeliverySlots(res.data);
    } catch (err) {
      console.error('Failed to fetch delivery slots:', err);
    }
  };

  const handleAddressChange = (field, value) => {
    setAddress(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!selectedSlotId) {
      toast.error('Please select a delivery slot');
      return;
    }

    if (!address.fullName || !address.phone || !address.street || !address.city || !address.state || !address.pincode) {
      toast.error('Please fill in all required address fields');
      return;
    }

    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        deliverySlotId: selectedSlotId,
        address,
        paymentMethod,
        items: cart.items
      };

      const res = await axios.post(`${API_BASE}/api/orders/guest`, orderData);

      if (paymentMethod === 'upi' && res.data.upiPaymentUrl) {
        // Open UPI payment URL
        window.location.href = res.data.upiPaymentUrl;
        toast.success('Redirecting to UPI payment...');
      } else {
        // COD order
        toast.success('Order placed successfully! Pay cash on delivery.');
        clearCart();
        if (onSuccess) onSuccess(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Guest Checkout</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Delivery Address */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">📍 Delivery Address</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={address.fullName}
                onChange={(e) => handleAddressChange('fullName', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={address.phone}
                onChange={(e) => handleAddressChange('phone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
            <input
              type="email"
              value={address.email}
              onChange={(e) => handleAddressChange('email', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
            <textarea
              value={address.street}
              onChange={(e) => handleAddressChange('street', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-20 resize-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input
                type="text"
                value={address.city}
                onChange={(e) => handleAddressChange('city', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
              <input
                type="text"
                value={address.state}
                onChange={(e) => handleAddressChange('state', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode *</label>
              <input
                type="text"
                value={address.pincode}
                onChange={(e) => handleAddressChange('pincode', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
            <input
              type="text"
              value={address.landmark}
              onChange={(e) => handleAddressChange('landmark', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Near temple, opposite park, etc."
            />
          </div>
        </div>

        {/* Delivery Slot */}
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Delivery Slot *
          </label>
          <select
            value={selectedSlotId}
            onChange={(e) => setSelectedSlotId(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Choose a delivery slot</option>
            {deliverySlots.map(slot => (
              <option key={slot.id} value={slot.id}>
                {slot.name} ({slot.startTime} - {slot.endTime})
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method */}
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Payment Method
          </label>
          <div className="space-y-3">
            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <div>
                <span className="font-medium text-gray-800">💵 Cash on Delivery</span>
                <p className="text-sm text-gray-600">Pay when you receive your order</p>
              </div>
            </label>
            <label className="flex items-center p-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                value="upi"
                checked={paymentMethod === 'upi'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="mr-3"
              />
              <div>
                <span className="font-medium text-gray-800">📱 UPI Payment</span>
                <p className="text-sm text-gray-600">Pay securely via UPI apps</p>
              </div>
            </label>
          </div>
        </div>

        {/* Order Summary */}
        <div className="border-t pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Order Summary</h3>
          <div className="space-y-2 mb-4">
            {cart.items.map(item => (
              <div key={item.product.id} className="flex justify-between text-sm">
                <span>{item.product.name} × {item.quantity}</span>
                <span>₹{item.product.price * item.quantity}</span>
              </div>
            ))}
            <hr className="my-2" />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-green-600">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedSlotId || loading}
          className={`w-full py-3 rounded-lg transition duration-200 font-semibold ${
            selectedSlotId && !loading
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Processing...
            </div>
          ) : (
            paymentMethod === 'upi' ? 'Pay via UPI' : 'Place Order'
          )}
        </button>
      </form>
    </div>
  );
};

export default GuestCheckout;