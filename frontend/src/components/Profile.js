import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import AddressBook from './AddressBook';
import API_BASE from '../api';

const Profile = ({ token }) => {
  const [user, setUser] = useState({});
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data);
      setFormData(res.data);
    } catch (err) {
      toast.error('Failed to load profile');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await axios.put(`${API_BASE}/api/auth/me`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(res.data.user);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setEditing(false);
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center text-gray-800">My Account</h2>

      {/* Tab Navigation */}
      <div className="max-w-4xl mx-auto mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 font-medium text-sm transition duration-200 ${
              activeTab === 'profile'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            👤 Profile
          </button>
          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-6 py-3 font-medium text-sm transition duration-200 ${
              activeTab === 'addresses'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            📍 Addresses
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'profile' ? (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6 md:p-8">

        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800">Personal Information</h3>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-200"
            >
              Edit Profile
            </button>
          )}
        </div>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            {editing ? (
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-gray-900 text-lg">{user.name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <p className="text-gray-900 text-lg">{user.email}</p>
            <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            {editing ? (
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your phone number"
              />
            ) : (
              <p className="text-gray-900 text-lg">{user.phone || 'Not provided'}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
            {editing ? (
              <textarea
                value={formData.address || ''}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
                placeholder="Enter your delivery address"
              />
            ) : (
              <p className="text-gray-900 text-lg whitespace-pre-line">{user.address || 'Not provided'}</p>
            )}
          </div>

          {/* Account Info */}
          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Account Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Account Type</label>
                <p className="text-gray-900 capitalize">{user.role}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Member Since</label>
                <p className="text-gray-900">{new Date(user.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {editing && (
          <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold"
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              onClick={handleCancel}
              disabled={saving}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200 font-semibold"
            >
              Cancel
            </button>
          </div>
        )}
        </div>
      ) : (
        <AddressBook token={token} />
      )}
    </div>
  );
};

export default Profile;