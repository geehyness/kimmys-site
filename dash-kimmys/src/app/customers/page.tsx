'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { client } from '@/lib/sanityClient';
import { useRouter } from 'next/navigation';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface SanityCustomer {
  _id: string;
  name?: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
}

interface SanityOrder {
  _id: string;
  customer?: SanityCustomer;
  totalAmount?: number;
  orderDate?: string;
  status?: string;
}

interface Customer {
  _id: string;
  name: string;
  phone?: string;
  email?: string;
  whatsapp?: string;
  completedOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
}

type SortField = 'name' | 'completedOrders' | 'totalSpent' | 'lastOrderDate';
type SortDirection = 'asc' | 'desc';

export default function CustomersPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const fetchCustomerData = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setLoading(true);
      setError(null);

      const query = `
        *[_type == "order" && status == "completed"] {
          _id,
          customer {
            _id,
            name,
            phone,
            email,
            whatsapp
          },
          totalAmount,
          orderDate
        }
      `;

      const orders = await client.fetch<SanityOrder[]>(query);
      
      // Process orders into customer data
      const customerMap = new Map<string, Customer>();
      
      orders.forEach(order => {
        if (!order.customer?._id) return;
        
        const customerId = order.customer._id;
        const existing = customerMap.get(customerId) || {
          _id: customerId,
          name: order.customer.name || 'Unknown Customer',
          phone: order.customer.phone,
          email: order.customer.email,
          whatsapp: order.customer.whatsapp,
          completedOrders: 0,
          totalSpent: 0,
          lastOrderDate: undefined
        };
        
        customerMap.set(customerId, {
          ...existing,
          completedOrders: existing.completedOrders + 1,
          totalSpent: existing.totalSpent + (order.totalAmount || 0),
          lastOrderDate: order.orderDate && (!existing.lastOrderDate || order.orderDate > existing.lastOrderDate) 
            ? order.orderDate 
            : existing.lastOrderDate
        });
      });
      
      setCustomers(Array.from(customerMap.values()));
    } catch (err) {
      console.error("Error fetching customer data:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch customer data');
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
      fetchCustomerData();
    }
  }, [isAuthenticated, fetchCustomerData]);

  const sortedCustomers = React.useMemo(() => {
    return [...customers].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'completedOrders':
          comparison = a.completedOrders - b.completedOrders;
          break;
        case 'totalSpent':
          comparison = a.totalSpent - b.totalSpent;
          break;
        case 'lastOrderDate':
          comparison = (a.lastOrderDate || '').localeCompare(b.lastOrderDate || '');
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [customers, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (!authChecked) {
    return <div className="p-4">Loading authentication...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Customers</h1>
      
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {sortedCustomers.length} customers with completed orders
        </div>
        
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            id="sort"
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
          >
            <option value="name">Name</option>
            <option value="completedOrders">Order Count</option>
            <option value="totalSpent">Total Spent</option>
            <option value="lastOrderDate">Last Order</option>
          </select>
          
          <button
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
            className="p-1 rounded hover:bg-gray-100"
            title={sortDirection === 'asc' ? 'Sort ascending' : 'Sort descending'}
          >
            {sortDirection === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {loading ? (
        <Skeleton count={10} height={40} className="mb-2" />
      ) : error ? (
        <div className="text-red-500">Error loading customers: {error}</div>
      ) : sortedCustomers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  Customer {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('completedOrders')}
                >
                  Orders {sortField === 'completedOrders' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('totalSpent')}
                >
                  Total Spent {sortField === 'totalSpent' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('lastOrderDate')}
                >
                  Last Order {sortField === 'lastOrderDate' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedCustomers.map((customer) => (
                <tr key={customer._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{customer.name}</div>
                    <div className="text-sm text-gray-500">{customer.email || customer.phone || 'No contact info'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.completedOrders}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    R{customer.totalSpent.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(customer.lastOrderDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          No customers with completed orders found
        </div>
      )}
    </div>
  );
}