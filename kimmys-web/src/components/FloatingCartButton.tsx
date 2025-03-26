'use client';

import { useShoppingCart } from '@/context/ShoppingCartContext';
import styles from './FloatingCartButton.module.css';

export default function FloatingCartButton() {
  const { toggleCart, getTotalItems } = useShoppingCart();
  const itemCount = getTotalItems();

  return (
    <button
      onClick={toggleCart}
      className={styles.floatingCartButton}
      aria-label={`Cart (${itemCount} items)`}
    >
      <span className={styles.cartIcon}>🛒</span>
      {itemCount > 0 && (
        <span className={styles.cartBadge}>
          {itemCount}
        </span>
      )}
    </button>
  );
}