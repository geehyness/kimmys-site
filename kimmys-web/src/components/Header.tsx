// components/Header.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useShoppingCart } from '@/context/ShoppingCartContext';
import styles from './Header.module.css';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems, toggleCart, closeCart } = useShoppingCart();

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    closeCart();
  };

  const closeAll = () => {
    closeCart();
    setIsMenuOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/" onClick={closeAll}>
            <span className={styles.logoMain}>Kimmy's</span>
            <span className={styles.logoSub}>Fast Foods</span>
          </Link>
        </div>
        
        <nav className={styles.desktopNav}>
          <ul className={styles.navList}>
            {[
              { path: '/', name: 'Home' },
              { path: '/menu', name: 'Menu' },
              { path: '/specials', name: 'Specials' },
              { path: '/about', name: 'About' },
              { path: '/contact', name: 'Contact' }
            ].map((item) => (
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
                onClick={toggleCart}
                aria-label={`Cart (${getTotalItems()} items)`}
              >
                🛒 {getTotalItems() > 0 && <span>{getTotalItems()}</span>}
              </button>
            </li>
          </ul>
        </nav>

        <div className={styles.mobileNav}>
          <button 
            className={`${styles.menuButton} ${isMenuOpen ? styles.open : ''}`}
            onClick={handleToggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className={styles.hamburger}></span>
          </button>
          
          {isMenuOpen && (
            <div className={styles.mobileMenu}>
              <ul className={styles.navList}>
                {[
                  { path: '/', name: 'Home' },
                  { path: '/menu', name: 'Menu' },
                  { path: '/specials', name: 'Specials' },
                  { path: '/about', name: 'About' },
                  { path: '/contact', name: 'Contact' }
                ].map((item) => (
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
                    onClick={() => {
                      toggleCart();
                      setIsMenuOpen(false);
                    }}
                  >
                    🛒 Cart ({getTotalItems()})
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}