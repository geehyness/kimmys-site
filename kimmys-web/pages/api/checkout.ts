import { client } from '@/lib/sanity';
import { format } from 'date-fns';
import { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import { IncomingForm } from 'formidable';

interface CartItem {
  _id: string;
  _type: 'meal' | 'product' | string;
  quantity: number;
  price: number;
  name: string;
  image?: {
    asset?: {
      _ref?: string;
      url?: string;
    };
  };
}

export const config = {
  api: {
    bodyParser: false,
  },
};

const parseForm = (req: NextApiRequest): Promise<{ fields: formidable.Fields; files: formidable.Files }> => {
  return new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
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
    // Parse form data
    const { fields, files } = await parseForm(req);

    // Validate and parse order data
    if (!fields.orderData || typeof fields.orderData !== 'string') {
      return res.status(400).json({ error: 'Missing order data' });
    }

    const orderData = JSON.parse(fields.orderData);
    const { 
      cartItems, 
      total, 
      paymentMethod, 
      customerPhoneNumber, 
      whatsappNumber, 
      orderDate, 
      customerName, 
      customerEmail 
    } = orderData;

    // Validate required fields
    if (!cartItems?.length || !total || !paymentMethod || !customerPhoneNumber) {
      return res.status(400).json({ error: 'Missing required order information' });
    }

    // Handle file upload if exists
    let paymentProofUrl = null;
    if (files.paymentProof) {
      const file = files.paymentProof as unknown as formidable.File;
      const uploadDir = './public/uploads';
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      const newFilename = `proof-${Date.now()}-${file.originalFilename}`;
      const newPath = `${uploadDir}/${newFilename}`;
      fs.renameSync(file.filepath, newPath);
      paymentProofUrl = `/uploads/${newFilename}`;
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

    // Create Sanity document
    const sanityOrder = {
      _type: 'order',
      orderNumber,
      customer: {
        _type: 'customer',
        phone: customerPhoneNumber,
        email: customerEmail || undefined,
        name: customerName || `Customer ${customerPhoneNumber}`,
        whatsapp: whatsappNumber || undefined,
      },
      items: cartItems.map((item: CartItem) => ({
        _key: item._id,
        product: {
          _type: 'reference',
          _ref: item._id,
        },
        quantity: item.quantity,
        priceAtPurchase: item.price,
        nameAtPurchase: item.name,
        image: item.image?.asset?.url ? { asset: { _ref: item.image.asset._ref } } : undefined,
      })),
      totalAmount: total,
      paymentMethod: paymentMethod.toLowerCase(),
      paymentProof: paymentProofUrl || undefined,
      orderDate: orderDate || new Date().toISOString(),
      status: 'received',
    };

    const result = await client.create(sanityOrder);
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