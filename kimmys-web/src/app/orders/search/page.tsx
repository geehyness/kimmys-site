'use client';

import { useState } from 'react';

interface OrderItem {
  product: {
    _ref: string;
    _type: string;
  };
  quantity: number;
  priceAtPurchase: number;
  nameAtPurchase: string;
}

interface CustomerInfo {
  name: string;
  phone: string;
  email?: string;
  whatsapp?: string;
}

interface Order {
  _id: string;
  orderNumber: string;
  customer: CustomerInfo;
  items: OrderItem[];
  status: 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentMethod: 'ewallet' | 'momo' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  totalAmount: number;
  notes?: string;
  orderDate: string;
  estimatedReady?: string;
  paymentProof?: string;
}

export default function OrderSearchPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchError, setSearchError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setOrders([]);
    setSearchError('');
    setLoading(true);

    if (!phoneNumber) {
      setSearchError('Please enter your phone number.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/orders/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      } else {
        const errorData = await response.json();
        setSearchError(errorData.error || 'Failed to search for orders.');
      }
    } catch (error) {
      console.error('Error searching for orders:', error);
      setSearchError('Failed to connect to the server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Search Your Orders</h1>
      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="phoneNumber" style={{ display: 'block', marginBottom: '0.5rem' }}>
          Phone Number:
        </label>
        <input
          type="tel"
          id="phoneNumber"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="Enter the phone number used for your order"
          style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc', width: '300px' }}
        />
      </div>
      <button
        onClick={handleSearch}
        style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer'
        }}
      >
        Search Orders
      </button>

      {searchError && <p style={{ color: 'red', marginTop: '1rem' }}>{searchError}</p>}

      {loading && <p style={{ marginTop: '1rem' }}>Searching for orders...</p>}

      {orders.length > 0 ? (
        <div style={{ marginTop: '2rem' }}>
          <h2>Your Orders:</h2>
          <ul style={{ listStyleType: 'none', paddingLeft: '0' }}>
            {orders.map((order) => (
              <li key={order._id} style={{ border: '1px solid #eee', padding: '15px', marginBottom: '10px', borderRadius: '5px' }}>
                <p><strong>Order Number:</strong> {order.orderNumber}</p>
                <p><strong>Status:</strong> <span style={{ fontWeight: 'bold', color: order.status === 'ready' ? 'green' : (order.status === 'cancelled' ? 'red' : 'orange') }}>{order.status.toUpperCase()}</span></p>
                {order.estimatedReady && order.status !== 'completed' && order.status !== 'cancelled' && (
                  <p><strong>Estimated Ready Time:</strong> {new Date(order.estimatedReady).toLocaleString()}</p>
                )}
                <p><strong>Order Date:</strong> {new Date(order.orderDate).toLocaleString()}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : phoneNumber && !searchError && !loading ? (
        <p style={{ marginTop: '1rem' }}>No orders found for the provided phone number.</p>
      ) : null}
    </div>
  );
}