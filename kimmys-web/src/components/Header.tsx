'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { useShoppingCart } from '@/context/ShoppingCartContext';
import styles from './Header.module.css';

const NAV_ITEMS = [
  { path: '/', name: 'Home' },
  { path: '/menu', name: 'Menu' },
  { path: '/specials', name: 'Specials' },
  { path: '/about', name: 'About' },
  { path: '/contact', name: 'Contact' },
  { path: '/orders/search', name: 'Track Order' },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems, toggleCart, closeCart, isCartOpen } = useShoppingCart();
  const mobileMenuRef = useRef<HTMLDivElement>(null); // Added type for ref

  const closeAll = () => {
    closeCart();
    setIsMenuOpen(false);
  };

  const handleToggleCart = () => {
    toggleCart();
    setIsMenuOpen(false);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => { // Added MouseEvent type
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    // Close menu on escape key
    const handleEscape = (event: KeyboardEvent) => { // Added KeyboardEvent type
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/" onClick={closeAll}>
            <span className={styles.logoMain}>Kimmy&apos;s</span>
          </Link>
        </div>

        <nav className={styles.desktopNav}>
          <ul className={styles.navList}>
            {NAV_ITEMS.map((item) => (
              <li key={item.path} className={styles.navItem}>
                <Link
                  href={item.path}
                  className={styles.navLink}
                  onClick={closeAll}
                >
                  {item.name}
                </Link>
              </li>
            ))}
            <li className={styles.navItem}>
              <button
                className={styles.cartButton}
                onClick={handleToggleCart}
                aria-label={`Cart (${getTotalItems()} items)`}
                aria-expanded={isCartOpen}
              >
                🛒 {getTotalItems() > 0 && <span>{getTotalItems()}</span>}
              </button>
            </li>
          </ul>
        </nav>

        <div className={styles.mobileNav} ref={mobileMenuRef}>
          <button
            className={`${styles.menuButton} ${isMenuOpen ? styles.open : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className={styles.hamburger}></span>
          </button>

          <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
            <ul className={styles.navList}>
              {NAV_ITEMS.map((item) => (
                <li key={item.path} className={styles.navItem}>
                  <Link
                    href={item.path}
                    className={styles.navLink}
                    onClick={closeAll}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
              <li className={styles.navItem}>
                <button
                  className={styles.cartButton}
                  onClick={handleToggleCart}
                  aria-label={`Cart (${getTotalItems()} items)`}
                >
                  🛒 Cart ({getTotalItems()})
                </button>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </header>
  );
}