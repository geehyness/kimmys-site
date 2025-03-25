'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import ShoppingCart from '@/components/ShoppingCart';
//import { SanityImageSource } from '@sanity/image-url/lib/types/types';

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
  cartItems: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getCartTotal: () => number;
  getItemQuantity: (id: string) => number;
  isCartOpen: boolean;
  toggleCart: () => void;
  closeCart: () => void;
}

const ShoppingCartContext = createContext<ShoppingCartContextType | null>(null);

export function ShoppingCartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart manipulation functions
  const addToCart = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setCartItems(prev => {
      const existing = prev.find(i => i._id === item._id);
      return existing
        ? prev.map(i => i._id === item._id ? {...i, quantity: i.quantity + 1} : i)
        : [...prev, {...item, quantity: 1}];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setCartItems(prev => prev.map(item => 
      item._id === id ? {...item, quantity: Math.max(1, quantity)} : item
    ));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  // Cart information functions
  const getTotalItems = useCallback(() => 
    cartItems.reduce((total, item) => total + item.quantity, 0), 
    [cartItems]
  );

  const getCartTotal = useCallback(() => 
    cartItems.reduce((total, item) => total + (item.price * item.quantity), 0), 
    [cartItems]
  );

  const getItemQuantity = useCallback((id: string) => 
    cartItems.find(item => item._id === id)?.quantity || 0, 
    [cartItems]
  );

  // Cart UI state functions
  const toggleCart = useCallback(() => setIsCartOpen(prev => !prev), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  // Connect cart button to DOM
  useEffect(() => {
    const button = document.getElementById('cart-button');
    const countBadge = document.getElementById('cart-count');
    
    if (button && countBadge) {
      button.addEventListener('click', toggleCart);
      return () => button.removeEventListener('click', toggleCart);
    }
  }, [toggleCart]);

  // Update cart badge
  useEffect(() => {
    const countBadge = document.getElementById('cart-count');
    if (countBadge) {
      const total = getTotalItems();
      countBadge.textContent = total.toString();
      countBadge.style.display = total > 0 ? 'flex' : 'none';
    }
  }, [cartItems, getTotalItems]);

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
        toggleCart,
        closeCart
      }}
    >
      {children}
      {/* Cart overlay */}
      {isCartOpen && (
        <>
          <div className="overlay" onClick={closeCart} />
          <div className="cartWrapper open">
            <ShoppingCart />
          </div>
        </>
      )}
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