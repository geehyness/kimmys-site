import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ShoppingCartProvider } from '@/context/ShoppingCartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import styles from '@/components/Layout.module.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Kimmy's",
  description: 'Best local meals in town',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ShoppingCartProvider>
          <div className={styles.layout}>
            <Header />
            <main className={styles.mainContent}>
              {children}
            </main>
            <button 
              id="cart-button"
              className={styles.floatingCartButton}
              aria-label="Shopping Cart"
            >
              <span className={styles.cartIcon}>🛒</span>
              <span id="cart-count" className={styles.cartBadge}></span>
            </button>
            <Footer />
          </div>
        </ShoppingCartProvider>
      </body>
    </html>
  );
}