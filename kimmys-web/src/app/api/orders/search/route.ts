// src/app/api/orders/search/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { client } from '@/lib/sanity';
import { groq } from 'next-sanity';

interface SanityOrder {
  orderNumber: string;
}

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber) {
      return NextResponse.json({ error: 'Phone number is required.' }, { status: 400 });
    }

    const query = groq`
      *[_type == "order" && customer.phone == $phoneNumber] {
        orderNumber
      }
    `;
    const params = { phoneNumber };
    const orders = await client.fetch<SanityOrder[]>(query, params); // Specify that it's an array of SanityOrder

    const orderNumbers = orders.map((order: SanityOrder) => order.orderNumber).filter(Boolean);

    return NextResponse.json({ orderNumbers }, { status: 200 });

  } catch (error) {
    console.error('Error searching orders:', error);
    return NextResponse.json({ error: 'Failed to search for orders.' }, { status: 500 });
  }
}