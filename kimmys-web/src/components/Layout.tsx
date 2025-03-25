// components/Layout.tsx
'use client';

import { useShoppingCart } from '@/context/ShoppingCartContext';
import Header from './Header';
import ShoppingCart from './ShoppingCart';
import styles from './Layout.module.css';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { isCartOpen, toggleCart, getTotalItems, closeCart } = useShoppingCart();

  return (
    <div className={styles.layout}>
      <Header />
      <main className={styles.mainContent}>
        {children}
      </main>
      
      {/* Floating Cart Button */}
      <button 
        className={`${styles.floatingCartButton} ${getTotalItems() > 0 ? styles.hasItems : ''}`}
        onClick={toggleCart}
        aria-label="Shopping Cart"
      >
        <span className={styles.cartIcon}>🛒</span>
        {getTotalItems() > 0 && (
          <span className={styles.cartBadge}>{getTotalItems()}</span>
        )}
      </button>
      
      {/* Cart Overlay */}
      {isCartOpen && (
        <>
          <div className={styles.overlay} onClick={closeCart} />
          <div className={styles.cartWrapper}>
            <ShoppingCart />
          </div>
        </>
      )}

<br /><br />
      <Footer/>
    </div>
  );
}