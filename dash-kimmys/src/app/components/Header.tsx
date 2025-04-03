'use client';

import Link from 'next/link';
import { useState } from 'react';
import { logout } from '@/lib/auth'; // Assuming this is your logout function

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white py-4 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-xl font-bold text-gray-800">
          Home
        </Link>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button
            onClick={toggleMobileMenu}
            className="text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6 items-center">
            <li>
              <Link href="/reports" className="text-gray-700 hover:text-gray-900">
                Reports
              </Link>
            </li>
            <li>
              <Link href="/customers" className="text-gray-700 hover:text-gray-900">
                Customers
              </Link>
            </li>
            <li>
              <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm">
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Mobile Menu (Collapsed by default) */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <nav className="px-4 py-2">
          <ul className="flex flex-col space-y-3">
            <li>
              <Link href="/reports" className="text-gray-700 hover:text-gray-900 block py-2">
                Reports
              </Link>
            </li>
            <li>
              <Link href="/customers" className="text-gray-700 hover:text-gray-900 block py-2">
                Customers
              </Link>
            </li>
            <li>
              <button onClick={logout} className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg text-sm block">
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}