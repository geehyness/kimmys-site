// pages/api/checkout.ts
import { client } from '@/lib/sanity';
import { format } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';

interface CartItem {
  _id: string;
  _type: 'meal' | 'product' | string; // Adjust the possible types as needed
  quantity: number;
  price: number;
  name: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const orderData = req.body;
      const { cartItems, total, paymentMethod, paymentProof, customerPhoneNumber, whatsappNumber, orderDate, customerName, customerEmail } = orderData;

      if (!cartItems || cartItems.length === 0 || !total || !paymentMethod || !customerPhoneNumber) {
        console.error('Missing required order data:', orderData);
        return res.status(400).json({ error: 'Missing required order information.' });
      }

      const currentDate = new Date();
      const formattedDate = format(currentDate, 'yyMMdd');

      // Query for orders created today to get the count
      const startOfDay = new Date(currentDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(currentDate);
      endOfDay.setHours(23, 59, 59, 999);

      const query = `count(*[_type == "order" && orderDate >= $start && orderDate <= $end])`;
      const params = { start: startOfDay.toISOString(), end: endOfDay.toISOString() };
      const orderCountToday = await client.fetch(query, params);
      const nextOrderNumber = orderCountToday + 1;
      const orderNumber = `${formattedDate}-${String(nextOrderNumber).padStart(3, '0')}`;

      const sanityOrder = {
        _type: 'order',
        orderNumber: orderNumber,
        customer: {
          _type: 'object',
          phone: customerPhoneNumber,
          email: customerEmail || null,
          name: customerName || customerPhoneNumber,
          whatsapp: whatsappNumber || null,
        },
        items: cartItems.map((item: CartItem) => ({ // Explicitly type 'item' here
          _key: item._id,
          product: {
            _type: item._type === 'meal' ? 'reference' : 'reference',
            _ref: item._id,
          },
          quantity: item.quantity,
          priceAtPurchase: item.price,
          nameAtPurchase: item.name,
        })),
        totalAmount: total,
        paymentMethod: paymentMethod === 'eWallet' ? 'ewallet' :
                       paymentMethod === 'MoMo' ? 'momo' : 'cash',
        paymentProof: paymentProof,
        orderDate: orderDate,
        status: 'received',
      };

      const result = await client.create(sanityOrder);
      console.log('Order created in Sanity:', result);

      res.status(200).json({ message: 'Order placed successfully!', orderId: result._id, orderNumber: orderNumber });

    } catch (error) {
      console.error('Checkout API error:', error);
      return res.status(500).json({ error: 'Failed to process checkout on the server.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}