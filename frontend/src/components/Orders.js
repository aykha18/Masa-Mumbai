import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE from '../api';

const Orders = ({ token, role }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let endpoint = `${API_BASE}/api/orders`;

        // If user is a delivery partner, fetch assigned deliveries instead
        if (role === 'delivery_partner') {
          endpoint = `${API_BASE}/api/delivery-partners/deliveries`;
        }

        const res = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(res.data);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, role]);

  const getStatusColor = (status) => {
    const colors = {
      'Placed': 'bg-blue-100 text-blue-800',
      'Confirmed': 'bg-yellow-100 text-yellow-800',
      'Out for Delivery': 'bg-orange-100 text-orange-800',
      'Delivered': 'bg-green-100 text-green-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Placed': '📋',
      'Confirmed': '✅',
      'Out for Delivery': '🚚',
      'Delivered': '🎉',
      'Cancelled': '❌'
    };
    return icons[status] || '📦';
  };

  const getOrderSteps = (status) => {
    const steps = ['Placed', 'Confirmed', 'Out for Delivery', 'Delivered'];
    const currentIndex = steps.indexOf(status);
    return steps.map((step, index) => ({
      name: step,
      completed: index <= currentIndex,
      current: index === currentIndex
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleAcceptDelivery = async (orderId) => {
    try {
      setActionLoading(orderId);
      await axios.post(`${API_BASE}/api/delivery-partners/deliveries/${orderId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Delivery accepted successfully!');
      // Refresh orders
      const res = await axios.get(`${API_BASE}/api/delivery-partners/deliveries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to accept delivery');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectDelivery = async (orderId) => {
    if (!window.confirm('Are you sure you want to reject this delivery?')) return;

    try {
      setActionLoading(orderId);
      await axios.post(`${API_BASE}/api/delivery-partners/deliveries/${orderId}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Delivery rejected and reassigned');
      // Refresh orders
      const res = await axios.get(`${API_BASE}/api/delivery-partners/deliveries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject delivery');
    } finally {
      setActionLoading(null);
    }
  };

  const handlePickupDelivery = async (orderId) => {
    try {
      setActionLoading(orderId);
      await axios.put(`${API_BASE}/api/delivery-partners/deliveries/${orderId}/status`, {
        status: 'picked_up'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Delivery marked as picked up!');
      // Refresh orders
      const res = await axios.get(`${API_BASE}/api/delivery-partners/deliveries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update delivery status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliverOrder = async (orderId) => {
    const notes = prompt('Add delivery notes (optional):');
    try {
      setActionLoading(orderId);
      await axios.put(`${API_BASE}/api/delivery-partners/deliveries/${orderId}/status`, {
        status: 'delivered',
        notes: notes || undefined
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order delivered successfully!');
      // Refresh orders
      const res = await axios.get(`${API_BASE}/api/delivery-partners/deliveries`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to mark as delivered');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  const title = role === 'delivery_partner' ? '🚚 My Deliveries' : '📦 My Orders';

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-800">{title}</h2>

        {orders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">{role === 'delivery_partner' ? '🚚' : '📭'}</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {role === 'delivery_partner' ? 'No deliveries assigned yet' : 'No orders yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {role === 'delivery_partner'
                ? 'New delivery assignments will appear here when available'
                : 'Your delicious fish orders will appear here'
              }
            </p>
            {role !== 'delivery_partner' && (
              <button
                onClick={() => window.location.href = '/'}
                className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-200"
              >
                Start Shopping
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Order Header */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-xl font-bold">Order #{order.id}</h3>
                      <p className="text-blue-100">{formatDate(order.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                        <span className="mr-1">{getStatusIcon(order.status)}</span>
                        {order.status}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Progress */}
                <div className="px-6 py-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    {getOrderSteps(order.status).map((step, index) => (
                      <div key={step.name} className="flex items-center">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                          step.completed
                            ? 'bg-green-500 text-white'
                            : step.current
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}>
                          {step.completed ? '✓' : index + 1}
                        </div>
                        <span className={`ml-2 text-sm font-medium ${
                          step.completed ? 'text-green-600' : step.current ? 'text-blue-600' : 'text-gray-500'
                        }`}>
                          {step.name}
                        </span>
                        {index < getOrderSteps(order.status).length - 1 && (
                          <div className={`flex-1 h-0.5 mx-4 ${
                            step.completed ? 'bg-green-500' : 'bg-gray-300'
                          }`} style={{ minWidth: '40px' }}></div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Details */}
                <div className="p-6">
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Payment Info */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">💳 Payment Details</h4>
                      <div className="space-y-2">
                        <p className="flex items-center text-gray-600">
                          <span className="mr-2">Method:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.paymentMethod === 'cod'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {order.paymentMethod === 'cod' ? '💵 Cash on Delivery' : '📱 UPI Payment'}
                          </span>
                        </p>
                        <p className="flex items-center text-gray-600">
                          <span className="mr-2">Status:</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.paymentStatus === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : order.paymentStatus === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </p>
                        {order.upiId && (
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">UPI ID:</span> {order.upiId}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Delivery Info */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-gray-800">🚚 Delivery Details</h4>
                      {order.deliverySlot ? (
                        <div className="space-y-2">
                          <p className="text-gray-600">
                            <span className="font-medium">Slot:</span> {order.deliverySlot.name}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Time:</span> {order.deliverySlot.startTime} - {order.deliverySlot.endTime}
                          </p>
                          <p className="text-gray-600">
                            <span className="font-medium">Date:</span> {new Date(order.deliverySlot.date).toLocaleDateString('en-IN')}
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500">Delivery details will be updated soon</p>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="border-t pt-6">
                    <h4 className="font-semibold text-gray-800 mb-4">🛒 Order Items</h4>
                    <div className="space-y-3">
                      {order.items.map(item => (
                        <div key={item.id || item._id} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-lg">🐟</span>
                            </div>
                            <div>
                              <h5 className="font-medium text-gray-800">{item.product?.name || 'Product'}</h5>
                              <p className="text-sm text-gray-600">
                                Quantity: {item.quantity} {item.product?.unit === 'kg' ? 'kg' : item.product?.unit === 'dozen' ? 'dozen' : 'pieces'}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-800">₹{item.price * item.quantity}</p>
                            <p className="text-sm text-gray-600">₹{item.price} each</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Order Total */}
                    <div className="mt-6 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-800">Total: ₹{order.total}</p>
                          {order.status === 'Delivered' && (
                            <p className="text-sm text-green-600 mt-1">✓ Order completed successfully</p>
                          )}
                        </div>

                        {/* Delivery Partner Actions */}
                        {role === 'delivery_partner' && (
                          <div className="flex gap-2">
                            {order.deliveryStatus === 'assigned' && (
                              <>
                                <button
                                  onClick={() => handleAcceptDelivery(order.id)}
                                  disabled={actionLoading === order.id}
                                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition duration-200 disabled:opacity-50"
                                >
                                  {actionLoading === order.id ? '...' : '✅ Accept'}
                                </button>
                                <button
                                  onClick={() => handleRejectDelivery(order.id)}
                                  disabled={actionLoading === order.id}
                                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition duration-200 disabled:opacity-50"
                                >
                                  {actionLoading === order.id ? '...' : '❌ Reject'}
                                </button>
                              </>
                            )}
                            {order.deliveryStatus === 'accepted' && order.status === 'Preparing' && (
                              <button
                                onClick={() => handlePickupDelivery(order.id)}
                                disabled={actionLoading === order.id}
                                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50"
                              >
                                {actionLoading === order.id ? '...' : '🚚 Picked Up'}
                              </button>
                            )}
                            {order.status === 'Out for Delivery' && (
                              <button
                                onClick={() => handleDeliverOrder(order.id)}
                                disabled={actionLoading === order.id}
                                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition duration-200 disabled:opacity-50"
                              >
                                {actionLoading === order.id ? '...' : '🎉 Delivered'}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;