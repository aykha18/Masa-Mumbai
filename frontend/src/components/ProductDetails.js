import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { useRecentlyViewed } from '../contexts/RecentlyViewedContext';
import API_BASE from '../api';

const ProductDetails = ({ token, role }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { addToRecentlyViewed } = useRecentlyViewed();

  useEffect(() => {
    fetchProduct();
    fetchRelatedProducts();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/api/products/${id}`);
      setProduct(res.data);
      // Track this product as recently viewed
      addToRecentlyViewed(res.data);
    } catch (err) {
      setError('Failed to load product');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      if (!product) return;
      const res = await axios.get(`${API_BASE}/api/products?category=${product.categoryId}&limit=4`);
      const filtered = res.data.products.filter(p => p.id !== product.id);
      setRelatedProducts(filtered.slice(0, 3));
    } catch (err) {
      console.error('Failed to load related products:', err);
    }
  };

  useEffect(() => {
    if (product) {
      fetchRelatedProducts();
    }
  }, [product]);

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;

    try {
      await addToCart(product.id, quantity);
      toast.success(`${quantity} ${product.name}(s) added to cart`);
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  const updateQuantity = (newQuantity) => {
    const minQuantity = product.unit === 'kg' ? 0.5 : 1;
    if (newQuantity >= minQuantity && newQuantity <= product.stock) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Product not found</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="mb-4 text-blue-600 hover:text-blue-800 flex items-center"
        >
          ← Back to Products
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="md:flex">
            {/* Product Image */}
            <div className="md:w-1/2 p-6">
              <div className="h-96 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                {product.primaryImage ? (
                  <img
                    src={`${API_BASE}${product.primaryImage}`}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                    onError={(e) => {
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDQwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjIwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
                    }}
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">📦</div>
                    <p className="text-gray-500">No image available</p>
                  </div>
                )}
              </div>

              {/* Additional Images (if available) */}
              {product.images && product.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {product.images.slice(1).map((image, index) => (
                    <img
                      key={index}
                      src={`${API_BASE}${image}`}
                      alt={`${product.name} ${index + 2}`}
                      className="w-20 h-20 object-cover rounded border-2 border-gray-200 cursor-pointer hover:border-blue-500"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjQwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEwIiBmaWxsPSIjOUNBNEFBIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1nPC90ZXh0Pgo8L3N2Zz4=';
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="md:w-1/2 p-6">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>

              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-green-600">₹{product.price}</span>
                <span className="ml-2 text-sm text-gray-500">{product.unitLabel}</span>
                <span className="ml-4 text-sm text-gray-500">
                  Category: {product.category ? product.category.name : 'N/A'}
                </span>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                {product.stock > 0 ? (
                  <div className="flex items-center">
                    <span className="text-green-600 font-semibold">✓ In Stock</span>
                    <span className="ml-2 text-gray-600">
                      ({product.stock} {product.unit === 'kg' ? 'kg' : product.unit === 'dozen' ? 'dozen' : 'pieces'} available)
                    </span>
                  </div>
                ) : (
                  <span className="text-red-600 font-semibold">❌ Out of Stock</span>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Quantity Selector & Add to Cart */}
              {role !== 'admin' && product.stock > 0 && (
                <div className="mb-6">
                  <div className="flex items-center space-x-4 mb-4">
                    <label className="font-semibold">Quantity:</label>
                    <div className="flex items-center border border-gray-300 rounded">
                      <button
                        onClick={() => updateQuantity(quantity - (product.unit === 'kg' ? 0.5 : 1))}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        disabled={quantity <= (product.unit === 'kg' ? 0.5 : 1)}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          if (!isNaN(val) && val >= 0) updateQuantity(val);
                        }}
                        className="px-2 py-1 border-x border-gray-300 text-center w-16"
                        min={product.unit === 'kg' ? 0.5 : 1}
                        step={product.unit === 'kg' ? 0.5 : 1}
                      />
                      <button
                        onClick={() => updateQuantity(quantity + (product.unit === 'kg' ? 0.5 : 1))}
                        className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                        disabled={quantity >= product.stock}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition duration-200 font-semibold"
                  >
                    Add to Cart - ₹{product.price * quantity}
                  </button>
                </div>
              )}

              {/* Admin Actions */}
              {role === 'admin' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Admin Actions</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/admin`)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Edit Product
                    </button>
                    <button
                      onClick={() => navigate('/products')}
                      className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    >
                      Back to Products
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {relatedProducts.map(p => (
                <div
                  key={p.id}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition duration-200 cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/products/${p.id}`)}
                >
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    {p.primaryImage ? (
                      <img
                        src={`${API_BASE}${p.primaryImage}`}
                        alt={p.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
                        }}
                      />
                    ) : (
                      <div className="text-gray-400 text-center">
                        <div className="text-2xl mb-2">📦</div>
                        <p className="text-sm">No Image</p>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-1 line-clamp-2">{p.name}</h3>
                    <p className="text-green-600 font-bold">₹{p.price}</p>
                    <p className="text-sm text-gray-500">Stock: {p.stock}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;