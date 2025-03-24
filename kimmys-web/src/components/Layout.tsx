'use client';

import { useShoppingCart } from '@/context/ShoppingCartContext';
import Header from './Header';
import Footer from './Footer';
import ShoppingCart from './ShoppingCart';
import styles from './Layout.module.css';

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
        className={styles.floatingCartButton}
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
      
      <Footer />
    </div>
  );
}