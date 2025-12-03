import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import API_BASE from '../api';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children, token }) => {
  const [cart, setCart] = useState({ items: [] });

  const fetchCart = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${API_BASE}/api/cart`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCart(res.data);
    } catch (err) {
      console.error('Failed to fetch cart:', err);
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      await axios.post(`${API_BASE}/api/cart`, { productId, quantity }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCart(); // Refresh cart after adding
    } catch (err) {
      throw err; // Re-throw to let caller handle
    }
  };

  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    try {
      await axios.put(`${API_BASE}/api/cart/${productId}`, { quantity: newQuantity }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state immediately for better UX
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.map(item =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item
        )
      }));
    } catch (err) {
      // Refresh cart on error to ensure consistency
      await fetchCart();
      throw err;
    }
  };

  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`${API_BASE}/api/cart/${productId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Update local state immediately for better UX
      setCart(prevCart => ({
        ...prevCart,
        items: prevCart.items.filter(item => item.product.id !== productId)
      }));
    } catch (err) {
      // Refresh cart on error to ensure consistency
      await fetchCart();
      throw err;
    }
  };

  const clearCart = () => {
    setCart({ items: [] });
  };

  useEffect(() => {
    if (token) {
      fetchCart();
    } else {
      setCart({ items: [] });
    }
  }, [token]);

  // Fetch cart on mount to ensure data is loaded
  useEffect(() => {
    if (token) {
      fetchCart();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const value = {
    cart,
    fetchCart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};