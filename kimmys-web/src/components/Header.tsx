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
            Kimmy's
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className={styles.desktopNav}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link href="/" className={styles.navLink} onClick={closeAll}>
                Home
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/menu" className={styles.navLink} onClick={closeAll}>
                Menu
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/specials" className={styles.navLink} onClick={closeAll}>
                Specials
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/about" className={styles.navLink} onClick={closeAll}>
                About Us
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/contact" className={styles.navLink} onClick={closeAll}>
                Contact
              </Link>
            </li>
            <li className={styles.navItem}>
              <button 
                className={styles.cartButton}
                onClick={toggleCart}
              >
                Cart ({getTotalItems()})
              </button>
            </li>
          </ul>
        </nav>

        {/* Mobile Navigation */}
        <div className={styles.mobileNav}>
          <button 
            className={styles.menuButton}
            onClick={handleToggleMenu}
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            <span className={styles.hamburger}></span>
          </button>
          
          {isMenuOpen && (
            <div className={styles.mobileMenu}>
              <ul className={styles.navList}>
                <li className={styles.navItem}>
                  <Link href="/" className={styles.navLink} onClick={closeAll}>
                    Home
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/menu" className={styles.navLink} onClick={closeAll}>
                    Menu
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/specials" className={styles.navLink} onClick={closeAll}>
                    Specials
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/about" className={styles.navLink} onClick={closeAll}>
                    About Us
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <Link href="/contact" className={styles.navLink} onClick={closeAll}>
                    Contact
                  </Link>
                </li>
                <li className={styles.navItem}>
                  <button 
                    className={styles.cartButton}
                    onClick={() => {
                      toggleCart();
                      setIsMenuOpen(false);
                    }}
                  >
                    Cart ({getTotalItems()})
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