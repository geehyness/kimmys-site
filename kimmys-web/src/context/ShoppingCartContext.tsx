'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Meal, Extra } from '@/types/meal';

interface CartItem extends Meal {
  quantity: number;
  selectedExtras: Extra[][];
}

interface ShoppingCartContextType {
  cartItems: CartItem[];
  addToCart: (item: Meal) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateExtraSelection: (itemId: string, quantityIndex: number, extra: Extra) => void;
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      } catch (error) {
        console.error('Error parsing cart data:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = useCallback((item: Meal) => {
    setCartItems(prev => {
      const existingItem = prev.find(i => i._id === item._id);
      if (existingItem) {
        return prev.map(i => 
          i._id === item._id
            ? { 
                ...i, 
                quantity: i.quantity + 1,
                selectedExtras: [...i.selectedExtras, []]
              }
            : i
        );
      }
      return [...prev, { 
        ...item, 
        quantity: 1,
        selectedExtras: [[]]
      }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCartItems(prev => prev.filter(item => item._id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item => {
        if (item._id !== id) return item;
        
        const newQuantity = Math.max(1, quantity);
        const quantityDiff = newQuantity - item.quantity;
        
        let newSelectedExtras = [...item.selectedExtras];
        if (quantityDiff > 0) {
          newSelectedExtras = [
            ...newSelectedExtras,
            ...Array(quantityDiff).fill([])
          ];
        } else if (quantityDiff < 0) {
          newSelectedExtras = newSelectedExtras.slice(0, newQuantity);
        }
        
        return {
          ...item,
          quantity: newQuantity,
          selectedExtras: newSelectedExtras
        };
      })
    );
  }, []);

  const updateExtraSelection = useCallback((itemId: string, quantityIndex: number, extra: Extra) => {
    setCartItems(prev => prev.map(item => {
      if (item._id !== itemId) return item;
      
      const newSelectedExtras = [...item.selectedExtras];
      const currentExtras = newSelectedExtras[quantityIndex] || [];
      
      const isExtraSelected = currentExtras.some(e => e._id === extra._id);
      const updatedExtras = isExtraSelected
        ? currentExtras.filter(e => e._id !== extra._id)
        : [...currentExtras, extra];
      
      newSelectedExtras[quantityIndex] = updatedExtras;
      
      return { ...item, selectedExtras: newSelectedExtras };
    }));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const getTotalItems = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => {
      const baseTotal = item.price * item.quantity;
      const extrasTotal = item.selectedExtras.reduce((sum, extras) => 
        sum + extras.reduce((acc, extra) => acc + extra.price, 0), 0);
      return total + baseTotal + extrasTotal;
    }, 0);
  }, [cartItems]);

  const getItemQuantity = useCallback((id: string) => {
    return cartItems.find(item => item._id === id)?.quantity || 0;
  }, [cartItems]);

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
        updateExtraSelection,
        clearCart,
        getTotalItems,
        getCartTotal,
        getItemQuantity,
        isCartOpen,
        openCart,
        closeCart,
        toggleCart,
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