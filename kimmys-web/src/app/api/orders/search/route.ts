// src/app/api/orders/search/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { client } from '@/lib/sanity';
import { groq } from 'next-sanity';

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
  items: OrderItem;
  status: 'received' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  paymentMethod: 'ewallet' | 'momo' | 'cash';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  totalAmount: number;
  notes?: string;
  orderDate: string;
  estimatedReady?: string;
  paymentProof?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber: rawPhoneNumber } = await request.json();

    if (!rawPhoneNumber) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    // Remove empty spaces from the phone number
    const phoneNumber = rawPhoneNumber.replace(/\s/g, '');

    const query = groq`
      *[_type == "order" && customer.phone == $phoneNumber] | order(orderDate desc) {
        _id,
        orderNumber,
        customer,
        items{
          product->{_id},
          quantity,
          priceAtPurchase,
          nameAtPurchase
        },
        status,
        paymentMethod,
        paymentStatus,
        totalAmount,
        notes,
        orderDate,
        estimatedReady,
        paymentProof
      }
    `;
    const params = { phoneNumber };
    const orders = await client.fetch<Order>(query, params);

    return NextResponse.json({ orders }, { status: 200 });

  } catch (error) {
    console.error('Error searching orders:', error);
    return NextResponse.json({ error: 'Failed to search for orders.' }, { status: 500 });
  }
}