'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface CartItem {
  _id: string;
  name: string;
  price: number;
  quantity: number;
  image?: {
    asset?: {
      url?: string;
      _ref?: string;
    };
  };
}

interface ShoppingCartContextType {
  cartItems: CartItem[]; // Changed to array
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getCartTotal: () => number;
  getItemQuantity: (id: string) => number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | null>(null);

export function ShoppingCartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]); // Initialize as empty array
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        // Ensure the parsed data is an array
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        } else {
          console.error('Saved cart is not an array');
          setCartItems([]);
        }
      } catch (error) {
        console.error('Error parsing cart data from localStorage:', error);
        setCartItems([]);
      }
    }
  }, []); // Added missing dependency array

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Cart manipulation functions
  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prev => {
      const existing = prev.find(i => i._id === item._id);
      return existing
        ? prev.map(i => i._id === item._id ? {...i, quantity: i.quantity + 1} : i)
        : [...prev, {...item, quantity: 1}];
    });
  }, []); // Added missing dependency array

  const removeFromCart = useCallback((id: string) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
  }, []); // Added missing dependency array

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setCartItems(prev => prev.map(item =>
      item._id === id ? {...item, quantity: Math.max(1, quantity)} : item
    ));
  }, []); // Added missing dependency array

  const clearCart = useCallback(() => setCartItems([]), []); // Added missing dependency array

  // Cart information functions
  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const getItemQuantity = useCallback((id: string) =>
    cartItems.find(item => item._id === id)?.quantity || 0,
    [cartItems]
  );

  // Cart UI state functions
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);

  return (
    <ShoppingCartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getTotalItems,
        getCartTotal,
        getItemQuantity,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart
      }}
    >
      {children}
    </ShoppingCartContext.Provider>
  );
}

export function useShoppingCart() {
  const context = useContext(ShoppingCartContext);
  if (!context) {
    throw new Error('useShoppingCart must be used within a ShoppingCartProvider');
  }
  return context;
}