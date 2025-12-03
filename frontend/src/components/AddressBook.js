import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE from '../api';

const AddressBook = ({ token, onAddressSelect, selectedAddressId }) => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: 'home',
    name: '',
    fullName: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: '',
    isDefault: false
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/addresses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(res.data);
    } catch (err) {
      toast.error('Failed to load addresses');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingAddress) {
        await axios.put(`${API_BASE}/api/addresses/${editingAddress.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Address updated successfully');
      } else {
        await axios.post(`${API_BASE}/api/addresses`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Address added successfully');
      }
      fetchAddresses();
      resetForm();
    } catch (err) {
      toast.error(editingAddress ? 'Failed to update address' : 'Failed to add address');
      console.error(err);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      type: address.type,
      name: address.name,
      fullName: address.fullName,
      phone: address.phone,
      street: address.street,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || '',
      isDefault: address.isDefault
    });
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      await axios.delete(`${API_BASE}/api/addresses/${addressId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Address deleted successfully');
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to delete address');
      console.error(err);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      await axios.patch(`${API_BASE}/api/addresses/${addressId}/default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Default address updated');
      fetchAddresses();
    } catch (err) {
      toast.error('Failed to set default address');
      console.error(err);
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'home',
      name: '',
      fullName: '',
      phone: '',
      street: '',
      city: '',
      state: '',
      pincode: '',
      landmark: '',
      isDefault: false
    });
    setEditingAddress(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">📍 My Addresses</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          + Add New Address
        </button>
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="home">🏠 Home</option>
                  <option value="work">💼 Work</option>
                  <option value="other">📍 Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address Label</label>
                <input
                  type="text"
                  placeholder="e.g., Home, Office"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <textarea
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
                rows="2"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Landmark (Optional)</label>
              <input
                type="text"
                placeholder="Near temple, opposite park, etc."
                value={formData.landmark}
                onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Set as default address
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
              >
                {editingAddress ? 'Update Address' : 'Save Address'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address List */}
      <div className="space-y-4">
        {addresses.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-4">📍</div>
            <p>No addresses saved yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
            >
              Add Your First Address
            </button>
          </div>
        ) : (
          addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-lg shadow-md p-6 border-2 transition duration-200 ${
                selectedAddressId === address.id
                  ? 'border-blue-500 bg-blue-50'
                  : address.isDefault
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-lg">{address.name}</span>
                    {address.isDefault && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {address.type === 'home' ? '🏠' : address.type === 'work' ? '💼' : '📍'}
                    </span>
                  </div>

                  <div className="text-gray-700 space-y-1">
                    <p className="font-medium">{address.fullName}</p>
                    <p>{address.street}</p>
                    <p>{address.city}, {address.state} - {address.pincode}</p>
                    {address.landmark && <p className="text-sm text-gray-600">Landmark: {address.landmark}</p>}
                    <p className="text-sm text-gray-600">📞 {address.phone}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {onAddressSelect && (
                    <button
                      onClick={() => onAddressSelect(address)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition duration-200 ${
                        selectedAddressId === address.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedAddressId === address.id ? 'Selected' : 'Select'}
                    </button>
                  )}

                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="px-4 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition duration-200"
                    >
                      Set Default
                    </button>
                  )}

                  <button
                    onClick={() => handleEdit(address)}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-200 transition duration-200"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(address.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition duration-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AddressBook;