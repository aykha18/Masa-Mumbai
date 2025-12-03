import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { CartProvider } from './contexts/CartContext';
import { RecentlyViewedProvider } from './contexts/RecentlyViewedContext';
import API_BASE from './api';
import Login from './components/Login';
import Register from './components/Register';
import DeliveryPartnerRegister from './components/DeliveryPartnerRegister';
import LandingPage from './components/LandingPage';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import Cart from './components/Cart';
import Orders from './components/Orders';
import Profile from './components/Profile';
import AdminPanel from './components/AdminPanel';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role') || 'user');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
    }
    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [token, role]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get(`${API_BASE}/api/categories`);
        setCategories(res.data);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const Home = () => {
    // Show landing page for non-logged-in users
    if (!token) {
      return <LandingPage token={token} role={role} />;
    }

    // Show main app interface for logged-in users
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-blue-600 text-white p-2 md:p-4 shadow">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-2 md:mb-4">
              <h1 className="text-lg md:text-2xl font-bold">🐟 Masa Mumbai</h1>
              <div className="flex items-center gap-2 md:gap-4">
                <button
                  onClick={() => { setToken(null); setRole('user'); }}
                  className="bg-red-500 hover:bg-red-600 px-2 md:px-4 py-1 md:py-2 rounded text-sm md:text-base transition duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
            {/* Search and Category Filters */}
            <div className="flex flex-col md:flex-row justify-center gap-2 md:gap-0">
              <input
                type="text"
                placeholder="🔍 Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg md:rounded-r-none w-full md:w-1/2 focus:outline-none focus:ring-2 focus:ring-white text-gray-800 placeholder-gray-600"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="p-2 border border-gray-300 rounded-lg md:rounded-l-none focus:outline-none focus:ring-2 focus:ring-white text-gray-800 bg-white"
              >
                <option value="">📂 All Categories</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </header>
        <main className="container mx-auto p-2 md:p-4">
          {role === 'admin' && <AdminPanel token={token} />}
          {role !== 'delivery_partner' && (
            <>
              <ProductList token={token} role={role} search={search} category={category} />
              <Cart token={token} />
              <Profile token={token} />
            </>
          )}
          <Orders token={token} role={role} />
        </main>
      </div>
    );
  };

  return (
    <Router>
      <RecentlyViewedProvider>
        <CartProvider token={token}>
          <div className="App">
            <Routes>
              <Route path="/login" element={token ? <Navigate to="/" /> : <Login setToken={setToken} setRole={setRole} />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-delivery-partner" element={<DeliveryPartnerRegister />} />
              <Route path="/products/:id" element={<ProductDetails token={token} role={role} />} />
              <Route path="/profile" element={<Home />} />
              <Route path="/" element={<Home />} />
            </Routes>
            <Toaster position="top-right" />
          </div>
        </CartProvider>
      </RecentlyViewedProvider>
    </Router>
  );
}

export default App;
