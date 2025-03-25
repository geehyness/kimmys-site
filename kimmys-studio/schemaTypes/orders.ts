import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    defineField({
      name: 'customer',
      title: 'Customer Information',
      type: 'object',
      fields: [
        defineField({
          name: 'name',
          title: 'Full Name',
          type: 'string',
          validation: (Rule) => Rule.required()
        }),
        defineField({
          name: 'phone',
          title: 'Phone Number',
          type: 'string',
          validation: (Rule) => Rule.required()
        }),
        defineField({
          name: 'email',
          title: 'Email',
          type: 'string'
        })
      ]
    }),
    defineField({
      name: 'items',
      title: 'Order Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'product',
              title: 'Product',
              type: 'reference',
              to: [{ type: 'meal' }, { type: 'combo' }],
              validation: (Rule) => Rule.required()
            }),
            defineField({
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              initialValue: 1,
              validation: (Rule) => Rule.required().min(1)
            }),
            defineField({
              name: 'priceAtPurchase',
              title: 'Price at Purchase',
              type: 'number',
              description: 'Price at time of ordering',
              validation: (Rule) => Rule.required().positive()
            })
          ]
        }
      ],
      validation: (Rule) => Rule.required().min(1)
    }),
    defineField({
      name: 'status',
      title: 'Order Status',
      type: 'string',
      options: {
        list: [
          {title: 'Received', value: 'received'},
          {title: 'Preparing', value: 'preparing'},
          {title: 'Ready for Pickup', value: 'ready'},
          {title: 'Completed', value: 'completed'},
          {title: 'Cancelled', value: 'cancelled'}
        ]
      },
      initialValue: 'received',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'paymentMethod',
      title: 'Payment Method',
      type: 'string',
      options: {
        list: [
          {title: 'eWallet', value: 'ewallet'},
          {title: 'MoMo', value: 'momo'},
          {title: 'Cash on Collection', value: 'cash'}
        ],
        layout: 'radio'
      },
      initialValue: 'cash',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'paymentStatus',
      title: 'Payment Status',
      type: 'string',
      options: {
        list: [
          {title: 'Pending', value: 'pending'},
          {title: 'Paid', value: 'paid'},
          {title: 'Refunded', value: 'refunded'}
        ]
      },
      initialValue: 'pending',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'totalAmount',
      title: 'Total Amount',
      type: 'number',
      validation: (Rule) => Rule.required().positive()
    }),
    defineField({
      name: 'notes',
      title: 'Special Instructions',
      type: 'text'
    }),
    defineField({
      name: 'orderDate',
      title: 'Order Date & Time',
      type: 'datetime',
      initialValue: (new Date()).toISOString(),
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'estimatedReady',
      title: 'Estimated Ready Time',
      type: 'datetime'
    })
  ],
  initialValue: {
    orderDate: (new Date()).toISOString()
  },
  preview: {
    select: {
      customer: 'customer.name',
      items: 'items.length',
      total: 'totalAmount',
      status: 'status',
      payment: 'paymentMethod'
    },
    prepare(selection) {
      const { customer, items, total, status, payment } = selection
      const paymentMethods = {
        ewallet: 'eWallet',
        momo: 'MoMo',
        cash: 'Cash'
      }
      return {
        title: `${customer}'s Order`,
        subtitle: `${items} item(s) • R${total} • ${status} • ${paymentMethods[payment as keyof typeof paymentMethods] || payment}`
      }
    }
  }
})