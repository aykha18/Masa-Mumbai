import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../../api';

const ProductShowcase = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/products?limit=6`);
      setProducts(res.data.products || res.data.slice(0, 6));
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProduct = (productId) => {
    navigate(`/products/${productId}`);
  };

  const handleShopNow = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading fresh products...</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Fresh Fish Selection
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our premium collection of fresh, sustainably sourced fish
          </p>
        </div>

        {products.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {products.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer transform hover:-translate-y-1"
                  onClick={() => handleViewProduct(product.id)}
                >
                  {/* Product Image */}
                  <div className="h-48 bg-gray-200 flex items-center justify-center relative overflow-hidden">
                    {product.primaryImage ? (
                      <img
                        src={`${API_BASE}${product.primaryImage}`}
                        alt={product.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Q0E0QUYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD4KPC9zdmc+';
                        }}
                      />
                    ) : (
                      <div className="text-center">
                        <div className="text-4xl mb-2">🐟</div>
                        <p className="text-gray-500 text-sm">Fresh {product.name}</p>
                      </div>
                    )}

                    {/* Fresh Badge */}
                    <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      🧊 Fresh
                    </div>

                    {/* Stock Status */}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <span className="text-white font-semibold">Out of Stock</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {product.name}
                      </h3>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {product.category?.name || 'Fish'}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-green-600">
                          ₹{product.price}
                        </span>
                        <span className="text-sm text-gray-500 ml-1">
                          per {product.unitLabel}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          product.stock > 10 ? 'text-green-600' :
                          product.stock > 0 ? 'text-orange-600' : 'text-red-600'
                        }`}>
                          {product.stock > 10 ? 'In Stock' :
                           product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Button */}
            <div className="text-center">
              <button
                onClick={handleShopNow}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                🛒 View All Products
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🐟</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Fresh Products Coming Soon
            </h3>
            <p className="text-gray-600 mb-6">
              We're preparing the freshest selection for you
            </p>
            <button
              onClick={handleShopNow}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition duration-200"
            >
              Browse Categories
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductShowcase;