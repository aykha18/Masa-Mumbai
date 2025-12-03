const axios = require('axios');

const API_BASE = 'http://192.168.1.41:5000';

async function testStockUpdate() {
  try {
    console.log('🧪 Testing Stock Update in Admin Panel...\n');

    // Login as admin
    const adminLogin = await axios.post(`${API_BASE}/api/auth/login`, {
      email: 'admin@fishapp.com',
      password: 'admin123'
    });
    const adminToken = adminLogin.data.token;

    // Get products
    const productsRes = await axios.get(`${API_BASE}/api/products`);
    const products = productsRes.data.products || productsRes.data;

    console.log('📦 Current Products:');
    products.forEach(p => {
      console.log(`   ${p.name}: ${p.stock} ${p.unit === 'kg' ? 'kg' : p.unit === 'dozen' ? 'dozen' : 'pieces'}`);
    });

    if (products.length > 0) {
      const testProduct = products[0];
      const originalStock = testProduct.stock;
      const newStock = originalStock + 5;

      console.log(`\n🔄 Updating stock for "${testProduct.name}" from ${originalStock} to ${newStock}...`);

      // Update stock
      await axios.put(`${API_BASE}/api/products/${testProduct.id}`, {
        stock: newStock
      }, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('✅ Stock update successful!');

      // Verify the update
      const updatedProductsRes = await axios.get(`${API_BASE}/api/products`);
      const updatedProducts = updatedProductsRes.data.products || updatedProductsRes.data;
      const updatedProduct = updatedProducts.find(p => p.id === testProduct.id);

      console.log(`\n📊 Verification:`);
      console.log(`   Original stock: ${originalStock}`);
      console.log(`   Updated stock: ${updatedProduct.stock}`);
      console.log(`   Expected stock: ${newStock}`);

      if (updatedProduct.stock === newStock) {
        console.log('🎉 Stock update is working correctly in Admin Panel!');
      } else {
        console.log('❌ Stock update failed - values don\'t match');
      }
    } else {
      console.log('❌ No products found to test');
    }

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

testStockUpdate();