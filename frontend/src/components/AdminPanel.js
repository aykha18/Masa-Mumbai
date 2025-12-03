import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SalesDashboard from './SalesDashboard';
import API_BASE from '../api';

const AdminPanel = ({ token }) => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [deliverySlots, setDeliverySlots] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    stock: '',
    unit: 'piece',
    unitLabel: 'each'
  });
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [editingStock, setEditingStock] = useState(null);
  const [stockValue, setStockValue] = useState('');
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [newDeliverySlot, setNewDeliverySlot] = useState({
    name: '',
    date: '',
    startTime: '',
    endTime: '',
    maxOrders: 50
  });
  const [deliveryConfig, setDeliveryConfig] = useState({
    partnerPaymentType: 'percentage',
    partnerPaymentValue: 10,
    deliveryFee: 20,
    tipEnabled: true,
    maxTipAmount: 100,
    autoAssignmentEnabled: true,
    assignmentTimeoutMinutes: 5,
    maxDeliveryRadiusKm: 10,
    partnerRatingThreshold: 3.5
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchDeliverySlots();
    fetchDeliveryConfig();
  }, []);

  const fetchProducts = async () => {
    const res = await axios.get(`${API_BASE}/api/products`);
    setProducts(res.data.products || res.data);
  };

  const fetchCategories = async () => {
    const res = await axios.get(`${API_BASE}/api/categories`);
    setCategories(res.data);
  };

  const fetchDeliverySlots = async () => {
    const res = await axios.get(`${API_BASE}/api/delivery-slots/admin`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setDeliverySlots(res.data);
  };

  const fetchDeliveryConfig = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/delivery-config`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDeliveryConfig(res.data);
    } catch (err) {
      console.error('Failed to fetch delivery config:', err);
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedImages(files);

    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const addProduct = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    // Append text fields as strings
    formData.append('name', newProduct.name || '');
    formData.append('description', newProduct.description || '');
    formData.append('price', newProduct.price || '');
    formData.append('categoryId', newProduct.categoryId || '');
    formData.append('stock', newProduct.stock || '');
    formData.append('unit', newProduct.unit || 'piece');
    formData.append('unitLabel', newProduct.unitLabel || 'each');

    // Add images
    selectedImages.forEach(image => {
      formData.append('images', image);
    });

    console.log('Sending FormData with fields:', {
      name: newProduct.name,
      description: newProduct.description,
      price: newProduct.price,
      categoryId: newProduct.categoryId,
      stock: newProduct.stock,
      unit: newProduct.unit,
      unitLabel: newProduct.unitLabel,
      imagesCount: selectedImages.length
    });

    try {
      await axios.post(`${API_BASE}/api/products`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setNewProduct({ name: '', description: '', price: '', categoryId: '', stock: '', unit: 'piece', unitLabel: 'each' });
      setSelectedImages([]);
      setImagePreviews([]);
      fetchProducts();
    } catch (err) {
      console.error('Error adding product:', err);
    }
  };

  const addCategory = async (e) => {
    e.preventDefault();
    await axios.post(`${API_BASE}/api/categories`, newCategory, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNewCategory({ name: '', description: '' });
    fetchCategories();
  };

  const deleteCategory = async (id) => {
    await axios.delete(`${API_BASE}/api/categories/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchCategories();
  };

  const addDeliverySlot = async (e) => {
    e.preventDefault();
    await axios.post(`${API_BASE}/api/delivery-slots`, newDeliverySlot, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setNewDeliverySlot({ name: '', date: '', startTime: '', endTime: '', maxOrders: 50 });
    fetchDeliverySlots();
  };

  const updateDeliverySlot = async (id, updates) => {
    await axios.put(`${API_BASE}/api/delivery-slots/${id}`, updates, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchDeliverySlots();
  };

  const deleteDeliverySlot = async (id) => {
    await axios.delete(`${API_BASE}/api/delivery-slots/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchDeliverySlots();
  };

  const deleteProduct = async (id) => {
    await axios.delete(`${API_BASE}/api/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchProducts();
  };

  const startEditingStock = (productId, currentStock) => {
    setEditingStock(productId);
    setStockValue(currentStock.toString());
  };

  const cancelEditingStock = () => {
    setEditingStock(null);
    setStockValue('');
  };

  const updateStock = async (productId) => {
    try {
      await axios.put(`${API_BASE}/api/products/${productId}`, {
        stock: parseInt(stockValue)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingStock(null);
      setStockValue('');
      fetchProducts();
    } catch (err) {
      console.error('Failed to update stock:', err);
    }
  };

  const tabs = [
    { id: 'products', label: 'Manage Products' },
    { id: 'categories', label: 'Manage Categories' },
    { id: 'delivery-slots', label: 'Delivery Slots' },
    { id: 'delivery-config', label: 'Delivery System Config' },
    { id: 'analytics', label: 'Sales Analytics' }
  ];

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Admin Panel</h2>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="bg-white rounded-lg shadow p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && (
        <>
          {/* Manage Products */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-xl font-semibold mb-4">Add New Product</h3>
            <form onSubmit={addProduct}>
              <input
                type="text"
                placeholder="Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="text"
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
                required
              />
              <input
                type="number"
                placeholder="Stock Quantity"
                value={newProduct.stock}
                onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
                min="0"
                required
              />
              <select
                value={newProduct.categoryId}
                onChange={(e) => setNewProduct({ ...newProduct, categoryId: e.target.value })}
                className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
                required
              >
                <option value="">Select Category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Image Upload */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                />
                <p className="text-sm text-gray-500 mt-1">Select up to 5 images (JPEG, PNG, GIF)</p>
              </div>

              {/* Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image Previews</label>
                  <div className="grid grid-cols-3 gap-2">
                    {imagePreviews.map((preview, index) => (
                      <img
                        key={index}
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-20 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Unit Selection */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Type</label>
                  <select
                    value={newProduct.unit}
                    onChange={(e) => {
                      const unit = e.target.value;
                      let unitLabel = 'each';
                      if (unit === 'kg') unitLabel = 'per kg';
                      else if (unit === 'dozen') unitLabel = 'per dozen';
                      setNewProduct({ ...newProduct, unit, unitLabel });
                    }}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="piece">Piece</option>
                    <option value="kg">Kilogram (kg)</option>
                    <option value="dozen">Dozen</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Label</label>
                  <input
                    type="text"
                    placeholder="Display label"
                    value={newProduct.unitLabel}
                    onChange={(e) => setNewProduct({ ...newProduct, unitLabel: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">Add Product</button>
            </form>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-4">Existing Products</h3>
            {products.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-lg shadow mb-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-start space-x-4">
                      {/* Product Images */}
                      {p.primaryImage && (
                        <img
                          src={`${API_BASE}${p.primaryImage}`}
                          alt={p.name}
                          className="w-16 h-16 object-cover rounded-lg border"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">{p.name}</h4>
                        <p className="text-gray-600 mb-2">{p.description}</p>
                        <p className="text-green-600 font-semibold">₹{p.price} <span className="text-sm text-gray-500">{p.unitLabel}</span></p>
                        <p className="text-sm text-gray-500">Category: {p.category ? p.category.name : 'N/A'}</p>
                        {p.images && p.images.length > 1 && (
                          <p className="text-sm text-gray-500">{p.images.length} images</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => deleteProduct(p.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Stock Management */}
                <div className="border-t pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Stock:</span>
                    {editingStock === p.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={stockValue}
                          onChange={(e) => setStockValue(e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                          min="0"
                          autoFocus
                        />
                        <button
                          onClick={() => updateStock(p.id)}
                          className="bg-green-500 text-white px-2 py-1 rounded text-sm hover:bg-green-600"
                        >
                          Save
                        </button>
                        <button
                          onClick={cancelEditingStock}
                          className="bg-gray-500 text-white px-2 py-1 rounded text-sm hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className={`text-sm font-semibold ${p.stock === 0 ? 'text-red-600' : 'text-green-600'}`}>
                          {p.stock} {p.unit === 'kg' ? 'kg' : p.unit === 'dozen' ? 'dozen' : 'pieces'}
                        </span>
                        <button
                          onClick={() => startEditingStock(p.id, p.stock)}
                          className="bg-blue-500 text-white px-2 py-1 rounded text-sm hover:bg-blue-600"
                        >
                          Update Stock
                        </button>
                      </div>
                    )}
                  </div>
                  {p.stock === 0 && (
                    <p className="text-red-500 text-xs mt-1">⚠️ This product is currently out of stock</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'categories' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Manage Categories</h3>
          <form onSubmit={addCategory} className="mb-4">
            <input
              type="text"
              placeholder="Category Name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              className="w-full p-3 mb-4 border border-gray-300 rounded-lg"
            />
            <button type="submit" className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600">Add Category</button>
          </form>
          <div>
            {categories.map(c => (
              <div key={c.id} className="bg-gray-50 p-4 rounded-lg shadow mb-2 flex justify-between items-center">
                <div>
                  <h4 className="font-semibold">{c.name}</h4>
                  <p>{c.description}</p>
                </div>
                <button
                  onClick={() => deleteCategory(c.id)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'delivery-slots' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Manage Delivery Slots</h3>
          <form onSubmit={addDeliverySlot} className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Slot Name"
              value={newDeliverySlot.name}
              onChange={(e) => setNewDeliverySlot({ ...newDeliverySlot, name: e.target.value })}
              className="border p-2"
              required
            />
            <input
              type="date"
              value={newDeliverySlot.date}
              onChange={(e) => setNewDeliverySlot({ ...newDeliverySlot, date: e.target.value })}
              className="border p-2"
              required
            />
            <input
              type="time"
              placeholder="Start Time"
              value={newDeliverySlot.startTime}
              onChange={(e) => setNewDeliverySlot({ ...newDeliverySlot, startTime: e.target.value })}
              className="border p-2"
              required
            />
            <input
              type="time"
              placeholder="End Time"
              value={newDeliverySlot.endTime}
              onChange={(e) => setNewDeliverySlot({ ...newDeliverySlot, endTime: e.target.value })}
              className="border p-2"
              required
            />
            <input
              type="number"
              placeholder="Max Orders"
              value={newDeliverySlot.maxOrders}
              onChange={(e) => setNewDeliverySlot({ ...newDeliverySlot, maxOrders: parseInt(e.target.value) })}
              className="border p-2"
              min="1"
            />
            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              Add Slot
            </button>
          </form>
          <div className="space-y-2">
            {deliverySlots.map(slot => (
              <div key={slot.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div>
                  <h4 className="font-semibold">{slot.name}</h4>
                  <p>Date: {slot.date} | Time: {slot.startTime} - {slot.endTime}</p>
                  <p>Orders: {slot.currentOrders}/{slot.maxOrders} | Status: {slot.isActive ? 'Active' : 'Inactive'}</p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateDeliverySlot(slot.id, { isActive: !slot.isActive })}
                    className={`px-3 py-1 rounded-lg text-white ${slot.isActive ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'}`}
                  >
                    {slot.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => deleteDeliverySlot(slot.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'delivery-config' && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Delivery System Configuration</h3>
          <form onSubmit={async (e) => {
            e.preventDefault();
            try {
              await axios.put(`${API_BASE}/api/delivery-config`, deliveryConfig, {
                headers: { Authorization: `Bearer ${token}` }
              });
              alert('Delivery configuration updated successfully!');
              fetchDeliveryConfig();
            } catch (err) {
              console.error('Failed to update delivery config:', err);
              alert('Failed to update delivery configuration');
            }
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Payment Configuration */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800">Payment Settings</h4>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partner Payment Type</label>
                  <select
                    value={deliveryConfig.partnerPaymentType}
                    onChange={(e) => setDeliveryConfig({ ...deliveryConfig, partnerPaymentType: e.target.value })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Partner Payment Value ({deliveryConfig.partnerPaymentType === 'percentage' ? '%' : '₹'})
                  </label>
                  <input
                    type="number"
                    value={deliveryConfig.partnerPaymentValue}
                    onChange={(e) => setDeliveryConfig({ ...deliveryConfig, partnerPaymentValue: parseFloat(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (₹)</label>
                  <input
                    type="number"
                    value={deliveryConfig.deliveryFee}
                    onChange={(e) => setDeliveryConfig({ ...deliveryConfig, deliveryFee: parseFloat(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Tip & Assignment Settings */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-800">Tip & Assignment Settings</h4>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="tipEnabled"
                    checked={deliveryConfig.tipEnabled}
                    onChange={(e) => setDeliveryConfig({ ...deliveryConfig, tipEnabled: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="tipEnabled" className="text-sm font-medium text-gray-700">Enable Customer Tips</label>
                </div>

                {deliveryConfig.tipEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Tip Amount (₹)</label>
                    <input
                      type="number"
                      value={deliveryConfig.maxTipAmount}
                      onChange={(e) => setDeliveryConfig({ ...deliveryConfig, maxTipAmount: parseFloat(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      min="0"
                      step="0.01"
                    />
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="autoAssignment"
                    checked={deliveryConfig.autoAssignmentEnabled}
                    onChange={(e) => setDeliveryConfig({ ...deliveryConfig, autoAssignmentEnabled: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="autoAssignment" className="text-sm font-medium text-gray-700">Enable Auto Assignment</label>
                </div>

                {deliveryConfig.autoAssignmentEnabled && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Timeout (minutes)</label>
                    <input
                      type="number"
                      value={deliveryConfig.assignmentTimeoutMinutes}
                      onChange={(e) => setDeliveryConfig({ ...deliveryConfig, assignmentTimeoutMinutes: parseInt(e.target.value) })}
                      className="w-full p-3 border border-gray-300 rounded-lg"
                      min="1"
                      max="60"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Delivery Radius (km)</label>
                  <input
                    type="number"
                    value={deliveryConfig.maxDeliveryRadiusKm}
                    onChange={(e) => setDeliveryConfig({ ...deliveryConfig, maxDeliveryRadiusKm: parseFloat(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    min="1"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partner Rating Threshold</label>
                  <input
                    type="number"
                    value={deliveryConfig.partnerRatingThreshold}
                    onChange={(e) => setDeliveryConfig({ ...deliveryConfig, partnerRatingThreshold: parseFloat(e.target.value) })}
                    className="w-full p-3 border border-gray-300 rounded-lg"
                    min="0"
                    max="5"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button type="submit" className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600">
                Update Delivery Configuration
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'analytics' && (
        <SalesDashboard token={token} />
      )}
    </div>
  );
};

export default AdminPanel;