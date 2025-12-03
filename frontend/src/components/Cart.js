import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import GuestCheckout from './GuestCheckout';
import API_BASE from '../api';

const Cart = ({ token }) => {
  const { cart, removeFromCart, clearCart, updateQuantity } = useCart();
  const location = useLocation();
  const [deliverySlots, setDeliverySlots] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDeliverySlots();
    fetchAddresses();
  }, [token]);

  // Refetch addresses when returning to cart page
  useEffect(() => {
    if (token && location.pathname === '/') {
      fetchAddresses();
    }
  }, [location.pathname, token]);

  const fetchDeliverySlots = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/delivery-slots`);
      setDeliverySlots(res.data);
    } catch (err) {
      console.error('Failed to fetch delivery slots:', err);
    }
  };

  const fetchAddresses = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(res.data);
      // Auto-select default address if available
      const defaultAddr = res.data.find(addr => addr.isDefault);
      if (defaultAddr) {
        setSelectedAddressId(defaultAddr.id);
      }
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
    }
  };

  const checkout = async () => {
    if (!selectedAddressId) {
      toast.error('Please select a delivery address');
      return;
    }

    if (!selectedSlotId) {
      toast.error('Please select a delivery slot');
      return;
    }

    if (cart.items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/orders`, {
        deliverySlotId: selectedSlotId,
        addressId: selectedAddressId,
        paymentMethod
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (paymentMethod === 'upi' && res.data.upiPaymentUrl) {
        // Open UPI payment URL with multiple fallback methods for mobile compatibility
        const upiUrl = res.data.upiPaymentUrl;

        // Try to open UPI app
        window.location.href = upiUrl;

        // Show UPI URL in toast for manual copying if app doesn't open
        setTimeout(() => {
          toast.success(
            <div>
              <p>UPI Payment URL:</p>
              <p className="text-xs break-all font-mono bg-gray-100 p-2 rounded mt-1">
                {upiUrl}
              </p>
              <p className="text-xs mt-1">Copy this URL and paste in your UPI app if it didn't open automatically.</p>
            </div>,
            { duration: 10000 }
          );
        }, 2000);
      } else {
        // COD order
        toast.success('Order placed successfully! Pay cash on delivery.');
      }

      clearCart();
      setSelectedSlotId('');
      setSelectedAddressId('');
      setPaymentMethod('cod');

      // Notification
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Order Placed', {
          body: paymentMethod === 'upi'
            ? 'Complete payment via UPI app'
            : 'Your order has been placed successfully.'
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Removed from cart');
    } catch (err) {
      toast.error('Failed to remove from cart');
    }
  };

  const totalAmount = cart.items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">Shopping Cart</h2>
      <div className="max-w-4xl mx-auto">

        {cart.items.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h3>
            <p className="text-gray-600 mb-6">Add some delicious fish to get started!</p>
            <a href="/products"
               className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200 inline-block">
              Browse Products
            </a>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="space-y-4 mb-6">
              {cart.items.map(item => (
                <div key={item.product.id} className="bg-white rounded-lg shadow-lg p-3 md:p-6">
                  <div className="flex flex-col md:flex-row items-center gap-3 md:gap-4">
                    {/* Product Image - Hidden on mobile */}
                    <div className="hidden md:block w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/100x100?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <div className="text-2xl">📦</div>
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 text-center md:text-left">
                      <h3 className="text-base md:text-xl font-semibold text-gray-800 mb-1">{item.product.name}</h3>
                      {/* Product description - Hidden on mobile */}
                      <p className="hidden md:block text-gray-600 text-sm mb-2">{item.product.description}</p>
                      <p className="text-base md:text-lg font-bold text-green-600">₹{item.product.price}</p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-l-lg"
                        >
                          -
                        </button>
                        <span className="w-12 text-center py-2 border-x border-gray-300">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-100 rounded-r-lg"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => handleRemoveFromCart(item.product.id)}
                        className="w-10 h-10 flex items-center justify-center text-red-500 hover:bg-red-50 rounded-lg border border-red-200"
                        title="Remove item"
                      >
                        🗑️
                      </button>
                    </div>

                    {/* Item Total */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-800">₹{item.product.price * item.quantity}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Order Summary</h3>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({cart.items.length} items)</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-green-600">₹{totalAmount}</span>
                </div>
              </div>
            </div>

            {/* Checkout Form */}
            <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Delivery & Payment</h3>

              {!token ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-4">Please login to checkout with your saved addresses</p>
                  <a
                    href="/login"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200 mr-4"
                  >
                    Login to Checkout
                  </a>
                  <p className="text-sm text-gray-500 mt-2">Or continue as guest below</p>
                </div>
              ) : null}

              {/* Address Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Select Delivery Address *
                </label>
                {addresses.length === 0 ? (
                  <div className="text-center py-4 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500 mb-2">No addresses saved</p>
                    <a
                      href="/profile"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Add an address in your profile
                    </a>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {addresses.map(address => (
                      <label
                        key={address.id}
                        className={`flex items-start p-3 border rounded-lg cursor-pointer transition duration-200 ${
                          selectedAddressId === address.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input
                          type="radio"
                          name="address"
                          value={address.id}
                          checked={selectedAddressId === address.id}
                          onChange={(e) => setSelectedAddressId(e.target.value)}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{address.name}</span>
                            {address.isDefault && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                Default
                              </span>
                            )}
                            <span className="text-sm text-gray-500">
                              {address.type === 'home' ? '🏠' : address.type === 'work' ? '💼' : '📍'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>{address.fullName} • {address.phone}</p>
                            <p>{address.street}, {address.city}, {address.state} - {address.pincode}</p>
                            {address.landmark && <p>Landmark: {address.landmark}</p>}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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

              <div className="mb-6">
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

              <button
                onClick={checkout}
                disabled={!selectedAddressId || !selectedSlotId || loading}
                className={`w-full py-3 rounded-lg transition duration-200 font-semibold ${
                  selectedAddressId && selectedSlotId && !loading
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
            </div>
          </>
        )}

        {/* Guest Checkout */}
        {!token && cart.items.length > 0 && (
          <div className="mt-8">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Continue as Guest</h3>
              <p className="text-gray-600">No account required - just fill in your details below</p>
            </div>
            <GuestCheckout onSuccess={() => {
              clearCart();
              toast.success('Order placed successfully!');
            }} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;