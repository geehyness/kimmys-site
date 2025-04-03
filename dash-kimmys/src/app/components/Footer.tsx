import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 py-6 mt-8 border-t border-gray-200">
      <div className="container mx-auto px-4 text-center text-gray-600 text-sm">
        <p className="mb-2">
          &copy; {currentYear} Your Company Name. All rights reserved.
        </p>
        <ul className="flex justify-center space-x-4">
          <li>
            <Link href="/privacy" className="hover:text-gray-800">
              Privacy Policy
            </Link>
          </li>
          <li>
            <Link href="/terms" className="hover:text-gray-800">
              Terms of Service
            </Link>
          </li>
          <li>
            <Link href="/contact" className="hover:text-gray-800">
              Contact Us
            </Link>
          </li>
        </ul>
      </div>
    </footer>
  );
}