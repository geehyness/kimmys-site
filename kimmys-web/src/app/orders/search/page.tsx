'use client';

import { useState } from 'react';

export default function OrderSearchPage() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [orderNumbers, setOrderNumbers] = useState<string[]>([]); // Changed to string array
  const [searchError, setSearchError] = useState('');

  const handleSearch = async () => {
    setOrderNumbers([]); // Reset to empty array instead of undefined
    setSearchError('');

    if (!phoneNumber) {
      setSearchError('Please enter your phone number.');
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
        setOrderNumbers(data.orderNumbers || []); // Ensure we always set an array
      } else {
        const errorData = await response.json();
        setSearchError(errorData.error || 'Failed to search for orders.');
      }
    } catch (error) {
      console.error('Error searching for orders:', error);
      setSearchError('Failed to connect to the server.');
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

      {orderNumbers.length > 0 ? (
        <div style={{ marginTop: '2rem' }}>
          <h2>Your Order Numbers:</h2>
          <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
            {orderNumbers.map((orderNumber) => (
              <li key={orderNumber}>{orderNumber}</li>
            ))}
          </ul>
        </div>
      ) : phoneNumber && !searchError ? (
        <p style={{ marginTop: '1rem' }}>No orders found for the provided phone number.</p>
      ) : null}
    </div>
  );
}