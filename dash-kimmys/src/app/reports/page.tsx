'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { client } from '@/lib/sanityClient';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/utils/formatDate';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface Order {
  _id: string;
  orderNumber?: string;
  customer?: {
    name?: string;
    phone?: string;
    email?: string;
    whatsapp?: string;
  };
  items?: Array<{
    _key: string;
    product?: {
      _id: string;
      name: string;
    };
    quantity: number;
    priceAtPurchase: number;
    nameAtPurchase: string;
    selectedExtras?: Array<{
      _key: string;
      extra?: {
        _id: string;
        name: string;
      };
      name: string;
      price: number;
      quantityIndex: number;
    }>;
    totalAmount: number;
  }>;
  totalAmount?: number;
  orderDate?: string;
  status?: string;
}

const months = [
  { value: '', label: 'All Months' },
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function ReportsPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  const fetchCompletedOrders = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);

      const query = `
        *[_type == "order" && status == "completed"] | order(orderDate desc) {
          _id,
          orderNumber,
          customer {
            name,
            phone,
            email,
            whatsapp
          },
          items[] {
            _key,
            product->{
              _id,
              name
            },
            quantity,
            priceAtPurchase,
            nameAtPurchase,
            selectedExtras[] {
              _key,
              extra->{
                _id,
                name
              },
              name,
              price,
              quantityIndex
            },
            totalAmount
          },
          totalAmount,
          orderDate
        }
      `;

      const data = await client.fetch<Order[]>(query);
      if (!data) throw new Error('No data returned from Sanity');
      setOrders(data);
    } catch (err) {
      console.error("Error fetching completed orders:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch completed orders');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/check', { credentials: 'include' });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        router.push('/login');
      } finally {
        setAuthChecked(true);
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCompletedOrders();
    }
  }, [isAuthenticated, fetchCompletedOrders]);

  const filteredOrders = React.useMemo(() => {
    return orders.filter(order => {
      if (!selectedMonth && !selectedYear) return true;
      const orderDate = new Date(order.orderDate || '');
      const orderMonth = String(orderDate.getMonth() + 1).padStart(2, '0');
      const orderYear = String(orderDate.getFullYear());

      const monthMatch = !selectedMonth || orderMonth === selectedMonth;
      const yearMatch = !selectedYear || orderYear === selectedYear;

      return monthMatch && yearMatch;
    });
  }, [orders, selectedMonth, selectedYear]);

  const totalRevenue = React.useMemo(() => {
    return filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  }, [filteredOrders]);

  const handlePrint = () => {
    const printContent = document.getElementById('printable-content');
    if (!printContent) {
      console.error('Printable content not found');
      return;
    }
  
    // Create a clone of the content without filters
    const contentClone = printContent.cloneNode(true) as HTMLElement;
    
    // Remove the filter controls from the cloned content
    const filters = contentClone.querySelector('.filter-controls');
    if (filters) {
      filters.remove();
    }
  
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print window');
      return;
    }
  
    // Get current date in readable format
    const printDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  
    // Get selected month and year labels
    const selectedMonthLabel = months.find(m => m.value === selectedMonth)?.label || 'All Months';
    const selectedYearLabel = selectedYear || 'All Years';
  
    // Add proper print styling
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Order Report</title>
          <style>
            @page { size: auto; margin: 10mm; }
            body { 
              font-family: Arial, sans-serif; 
              padding: 20px;
              color: #000;
            }
            .report-header {
              margin-bottom: 20px;
              border-bottom: 1px solid #ddd;
              padding-bottom: 10px;
            }
            .report-title {
              font-size: 1.5em;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-meta {
              display: flex;
              justify-content: space-between;
              margin-bottom: 10px;
              font-size: 0.9em;
            }
            .print-date {
              color: #555;
            }
            .report-period {
              font-weight: bold;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .no-print {
              display: none;
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <div class="report-title">Completed Orders Report</div>
            <div class="report-meta">
              <div class="report-period">
                Period: ${selectedMonthLabel} ${selectedYearLabel}
              </div>
              <div class="print-date">Printed: ${printDate}</div>
            </div>
          </div>
          ${contentClone.innerHTML}
        </body>
      </html>
    `);
  
    printWindow.document.close();
  
    // Ensure content is loaded before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  };

  if (!authChecked) {
    return <div className="p-4">Loading authentication...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>
      <div className="mb-4">
        <button 
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Export as PDF
        </button>
      </div>

      <div id="printable-content">
        {/* Wrap filters in a div with class for easy removal */}
        <div className="filter-controls no-print">
          <div className="mb-4 flex items-center gap-4">
            <div>
              <label htmlFor="month" className="block text-sm font-medium text-gray-700">Month:</label>
              <select
                id="month"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {months.map((month) => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year:</label>
              <select
                id="year"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Completed Orders Report</h2>

        {loading ? (
          <Skeleton count={5} height={50} className="mb-2" />
        ) : error ? (
          <div>Error loading orders: {error}</div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.orderNumber || `UNKNOWN-${order._id.slice(0, 5)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.customer?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      R{(order.totalAmount || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.items?.map(item => item.nameAtPurchase).join(', ') || 'No items'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                    Total Revenue:
                  </td>
                  <td className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    R{totalRevenue.toFixed(2)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p>No completed orders found for the selected period.</p>
        )}
      </div>
    </div>
  );
}