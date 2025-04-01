import { client } from '@/lib/sanity';
import { format } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { IncomingForm } from 'formidable';

interface SanityReference {
  _type: 'reference';
  _ref: string;
}

interface SanityImage {
  _type: 'image';
  asset: SanityReference;
}

interface Extra {
  _id: string;
  name: string;
  price: number;
}

interface CartItem {
  _id: string;
  _type: string;
  quantity: number;
  price: number;
  name: string;
  image?: {
    asset?: {
      _ref?: string;
    };
  };
  selectedExtras: Extra[][];
}

interface OrderItem {
  _key: string;
  product: SanityReference;
  quantity: number;
  priceAtPurchase: number;
  nameAtPurchase: string;
  selectedExtras?: {
    _key: string;
    extra: SanityReference;
    name: string;
    price: number;
    quantityIndex: number;
  }[];
  image?: SanityImage;
}

interface OrderData {
  cartItems: CartItem[];
  total: number;
  paymentMethod: string;
  customerPhoneNumber: string;
  whatsappNumber?: string;
  customerName?: string;
  customerEmail?: string;
}

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    const form = new IncomingForm();
    const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    if (!fields.orderData || typeof fields.orderData !== 'string') {
      return res.status(400).json({ error: 'Missing order data' });
    }

    const orderData: OrderData = JSON.parse(fields.orderData);
    const { cartItems, total, paymentMethod, customerPhoneNumber, whatsappNumber, customerName, customerEmail } = orderData;

    // Handle payment proof upload
    let paymentProof: SanityImage | undefined;
    if (files.paymentProof) {
      const file = files.paymentProof as unknown as formidable.File;
      const uploadDir = './public/uploads';
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const newFilename = `proof-${Date.now()}-${file.originalFilename}`;
      const newPath = `${uploadDir}/${newFilename}`;
      fs.renameSync(file.filepath, newPath);
      paymentProof = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: newFilename
        }
      };
    }

    // Generate order number
    const currentDate = new Date();
    const formattedDate = format(currentDate, 'yyMMdd');
    const startOfDay = new Date(currentDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(currentDate);
    endOfDay.setHours(23, 59, 59, 999);

    const orderCountToday = await client.fetch(
      `count(*[_type == "order" && orderDate >= $start && orderDate <= $end])`,
      { start: startOfDay.toISOString(), end: endOfDay.toISOString() }
    );

    const orderNumber = `${formattedDate}-${String(orderCountToday + 1).padStart(3, '0')}`;

    // Create order items with proper typing
    const items: OrderItem[] = cartItems.map((item) => {
      const orderItem: OrderItem = {
        _key: generateRandomKey(),
        product: {
          _type: 'reference',
          _ref: item._id,
        },
        quantity: item.quantity,
        priceAtPurchase: item.price,
        nameAtPurchase: item.name,
      };

      // Add selected extras if they exist
      if (item.selectedExtras && item.selectedExtras.length > 0) {
        orderItem.selectedExtras = item.selectedExtras.flatMap((extras, idx) => 
          extras.map(extra => ({
            _key: generateRandomKey(),
            extra: {
              _type: 'reference',
              _ref: extra._id,
            },
            name: extra.name,
            price: extra.price,
            quantityIndex: idx
          }))
        );
      }

      // Add image if it exists
      if (item.image?.asset?._ref) {
        orderItem.image = {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: item.image.asset._ref
          }
        };
      }

      return orderItem;
    });

    // Create the order document
    const order = {
      _type: 'order',
      orderNumber,
      customer: {
        name: customerName || `Customer ${customerPhoneNumber}`,
        phone: customerPhoneNumber,
        ...(customerEmail && { email: customerEmail }),
        ...(whatsappNumber && { whatsapp: whatsappNumber }),
      },
      items,
      totalAmount: total,
      paymentMethod: paymentMethod.toLowerCase(),
      paymentStatus: paymentProof ? 'paid' : 'pending',
      ...(paymentProof && { paymentProof }),
      orderDate: currentDate.toISOString(),
      status: 'received'
    };

    const result = await client.create(order);
    return res.status(200).json({ 
      success: true,
      orderId: result._id,
      orderNumber,
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function generateRandomKey() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}