// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ShoppingCartProvider } from '@/context/ShoppingCartContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
          <Header />
          <main>{children}</main>
          <Footer />
        </ShoppingCartProvider>
      </body>
    </html>
  );
}