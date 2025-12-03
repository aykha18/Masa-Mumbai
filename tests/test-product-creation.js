const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testProductCreation() {
  try {
    // Create a simple test image (1x1 pixel PNG)
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');

    // Create FormData
    const formData = new FormData();
    formData.append('name', 'Test Salmon');
    formData.append('description', 'Fresh Atlantic salmon');
    formData.append('price', '450');
    formData.append('categoryId', '1');
    formData.append('stock', '25');
    formData.append('unit', 'kg');
    formData.append('unitLabel', 'per kg');

    // Create a temporary file for the image
    const tempImagePath = path.join(__dirname, 'temp-test-image.png');
    fs.writeFileSync(tempImagePath, testImageBuffer);

    // Append the image file
    formData.append('images', fs.createReadStream(tempImagePath), {
      filename: 'test-salmon.png',
      contentType: 'image/png'
    });

    console.log('Sending FormData with:');
    console.log('- name: Test Salmon');
    console.log('- description: Fresh Atlantic salmon');
    console.log('- price: 450');
    console.log('- categoryId: 1');
    console.log('- stock: 25');
    console.log('- unit: kg');
    console.log('- unitLabel: per kg');
    console.log('- images: 1 test image');

    // Send request
    const response = await axios.post('http://localhost:5000/api/products', formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzY0NTkyODk3fQ.6Q4qOx_8rVegco5USWzAOvxNjfNt4y1L0d7s_JioAh0'
      }
    });

    console.log('\n✅ SUCCESS! Product created:');
    console.log(JSON.stringify(response.data, null, 2));

    // Clean up temp file
    fs.unlinkSync(tempImagePath);

  } catch (error) {
    console.error('\n❌ ERROR:', error.response?.data || error.message);

    // Clean up temp file if it exists
    try {
      fs.unlinkSync(path.join(__dirname, 'temp-test-image.png'));
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

testProductCreation();