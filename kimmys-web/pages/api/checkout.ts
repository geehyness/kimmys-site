import { client } from '@/lib/sanity'
import { format } from 'date-fns'
import { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import { IncomingForm } from 'formidable'

interface Extra {
  _id: string
  name: string
  price: number
}

interface CartItem {
  _id: string
  _type: string
  quantity: number
  price: number
  name: string
  image?: {
    asset?: {
      _ref?: string
      url?: string
    }
  }
  extras?: Extra[]
  selectedExtras: Extra[][]
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })
  }

  try {
    const form = new IncomingForm()
    const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err)
        else resolve({ fields, files })
      })
    })

    if (!fields.orderData || typeof fields.orderData !== 'string') {
      return res.status(400).json({ error: 'Missing order data' })
    }

    const orderData = JSON.parse(fields.orderData)
    const { 
      cartItems, 
      total, 
      paymentMethod, 
      customerPhoneNumber,
      whatsappNumber,
      customerName,
      customerEmail
    } = orderData

    // Handle payment proof upload
    let paymentProof = undefined
    if (files.paymentProof) {
      const file = files.paymentProof as unknown as formidable.File
      const uploadDir = './public/uploads'
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true })
      }
      
      const newFilename = `proof-${Date.now()}-${file.originalFilename}`
      const newPath = `${uploadDir}/${newFilename}`
      fs.renameSync(file.filepath, newPath)
      paymentProof = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: newFilename // This would need to be uploaded to Sanity's asset system in a real implementation
        }
      }
    }

    // Generate order number
    const currentDate = new Date()
    const formattedDate = format(currentDate, 'yyMMdd')
    const startOfDay = new Date(currentDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(currentDate)
    endOfDay.setHours(23, 59, 59, 999)

    const orderCountToday = await client.fetch(
      `count(*[_type == "order" && orderDate >= $start && orderDate <= $end])`,
      { start: startOfDay.toISOString(), end: endOfDay.toISOString() }
    )

    const orderNumber = `${formattedDate}-${String(orderCountToday + 1).padStart(3, '0')}`

    // Create the order document
    const order = {
      _type: 'order',
      orderNumber,
      customer: {
        name: customerName || `Customer ${customerPhoneNumber}`,
        phone: customerPhoneNumber,
        email: customerEmail || undefined,
        whatsapp: whatsappNumber || undefined,
      },
      items: cartItems.map((item) => ({
        product: {
          _type: 'reference',
          _ref: item._id,
        },
        quantity: item.quantity,
        priceAtPurchase: item.price,
        nameAtPurchase: item.name,
        selectedExtras: item.selectedExtras.flatMap((extras, idx) => 
          extras.map(extra => ({
            extra: {
              _type: 'reference',
              _ref: extra._id,
            },
            name: extra.name,
            price: extra.price,
            quantityIndex: idx
          }))
        ),
        image: item.image?.asset?._ref ? {
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: item.image.asset._ref
          }
        } : undefined
      })),
      totalAmount: total,
      paymentMethod: paymentMethod.toLowerCase(),
      paymentStatus: paymentProof ? 'paid' : 'pending',
      paymentProof: paymentProof,
      orderDate: currentDate.toISOString(),
      status: 'received'
    }

    const result = await client.create(order)
    return res.status(200).json({ 
      success: true,
      orderId: result._id,
      orderNumber,
    })

  } catch (error) {
    console.error('Checkout error:', error)
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}