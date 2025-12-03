const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_BASE = 'http://192.168.1.41:5000';

async function testProductUpdate() {
  try {
    console.log('🔐 Testing Admin Login...');

    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });

    console.log('✅ Admin Login successful!');
    const token = loginResponse.data.token;

    // Get first product to update
    console.log('\n📦 Getting products...');
    const productsResponse = await axios.get(`${API_BASE}/api/products`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (productsResponse.data.products.length === 0) {
      console.log('❌ No products found to update');
      return;
    }

    const productToUpdate = productsResponse.data.products[0];
    console.log(`📝 Updating product: ${productToUpdate.name} (ID: ${productToUpdate.id})`);

    // Create FormData for update
    const formData = new FormData();

    // Update some fields
    formData.append('name', productToUpdate.name + ' (Updated)');
    formData.append('description', productToUpdate.description + ' - Updated description');
    formData.append('price', (parseFloat(productToUpdate.price) + 10).toString());
    formData.append('categoryId', productToUpdate.categoryId.toString());
    formData.append('stock', (productToUpdate.stock + 5).toString());
    formData.append('unit', productToUpdate.unit);
    formData.append('unitLabel', productToUpdate.unitLabel);

    console.log('📤 Sending update request...');

    const updateResponse = await axios.put(`${API_BASE}/api/products/${productToUpdate.id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        ...formData.getHeaders()
      }
    });

    console.log('✅ Product updated successfully!');
    console.log('📋 Updated product:', {
      id: updateResponse.data.id,
      name: updateResponse.data.name,
      price: updateResponse.data.price,
      stock: updateResponse.data.stock
    });

    // Verify the update by fetching again
    console.log('\n🔍 Verifying update...');
    const verifyResponse = await axios.get(`${API_BASE}/api/products/${productToUpdate.id}`);
    console.log('✅ Verification successful:', {
      id: verifyResponse.data.id,
      name: verifyResponse.data.name,
      price: verifyResponse.data.price,
      stock: verifyResponse.data.stock
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data?.message || error.message);
    if (error.response) {
      console.error('📊 Status:', error.response.status);
      console.error('📄 Data:', error.response.data);
    }
  }
}

testProductUpdate();