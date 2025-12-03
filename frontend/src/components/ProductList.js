import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { useRecentlyViewed } from '../contexts/RecentlyViewedContext';
import API_BASE from '../api';

const ProductList = ({ token, role, search, category }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const { recentlyViewed } = useRecentlyViewed();

  const fetchProducts = async (searchQuery = '', categoryId = '') => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchQuery) params.append('q', searchQuery);
      if (categoryId) params.append('category', categoryId);

      const res = await axios.get(`${API_BASE}/api/products?${params}`);
      setProducts(res.data.products || res.data);
    } catch (err) {
      setError('Failed to load products');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(search, category);
  }, [search, category]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProducts(search, category);
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [search, category]);

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId);
      toast.success('Added to cart');
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Oops! Something went wrong</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => fetchProducts(search, category)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-2 md:p-4 bg-gray-100 min-h-screen">
      {/* <h2 className="text-xl md:text-2xl font-bold mb-4 text-center text-gray-800">Products</h2> */}

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
          <p className="text-gray-600">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {products.map(p => (
            <div
              key={p.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition duration-200 overflow-hidden cursor-pointer"
              onClick={() => navigate(`/products/${p.id}`)}
            >
              {/* Product Image */}
              <div className="h-32 md:h-48 bg-gray-200 flex items-center justify-center">
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
                    <div className="text-4xl mb-2">📦</div>
                    <p className="text-sm">No Image</p>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-2 md:p-4">
                <h3 className="text-sm md:text-lg font-semibold mb-1 md:mb-2 text-gray-800 line-clamp-2">{p.name}</h3>
                <p className="text-gray-600 mb-1 md:mb-2 text-xs md:text-sm line-clamp-2">{p.description}</p>
                <p className="text-xs md:text-sm text-gray-500 mb-1 md:mb-2">Category: {p.category ? p.category.name : 'N/A'}</p>
                <div className="flex items-center justify-between mb-2 md:mb-4">
                  <p className="text-lg md:text-xl font-bold text-green-600">₹{p.price} <span className="text-xs text-gray-500">{p.unitLabel}</span></p>
                </div>
                {role !== 'admin' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(p.id);
                    }}
                    disabled={p.stock === 0}
                    className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition duration-200"
                  >
                    {p.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recently Viewed Products */}
      {recentlyViewed.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">🕒 Recently Viewed</h2>
            <button
              onClick={() => window.location.reload()}
              className="text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Clear History
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2 md:gap-4">
            {recentlyViewed.slice(0, 5).map(p => (
              <div
                key={`recent-${p.id}`}
                className="bg-white rounded-lg shadow hover:shadow-lg transition duration-200 cursor-pointer overflow-hidden"
                onClick={() => navigate(`/products/${p.id}`)}
              >
                <div className="h-20 md:h-32 bg-gray-200 flex items-center justify-center">
                  {p.primaryImage ? (
                    <img
                      src={`${API_BASE}${p.primaryImage}`}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDE1MCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9Ijc1IiB5PSI3NSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjOUNBNEFBIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Tm8gSW1nPC90ZXh0Pgo8L3N2Zz4=';
                      }}
                    />
                  ) : (
                    <div className="text-gray-400 text-center">
                      <div className="text-lg mb-1">📦</div>
                      <p className="text-xs">No Image</p>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm mb-1 line-clamp-2">{p.name}</h3>
                  <p className="text-green-600 font-bold text-sm">₹{p.price} <span className="text-xs text-gray-500">{p.unitLabel}</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;