import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'paymentSettings',
  title: 'Payment Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'enableCash',
      title: 'Accept Cash Payments',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'enableEWallet',
      title: 'Accept eWallet Payments',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'enableMomo',
      title: 'Accept Mobile Money',
      type: 'boolean',
      initialValue: true
    }),
    defineField({
      name: 'eWalletName',
      title: 'eWallet Service Name',
      type: 'string',
      hidden: ({ parent }) => !parent?.enableEWallet
    }),
    defineField({
      name: 'momoNumber',
      title: 'Mobile Money Number',
      type: 'string',
      hidden: ({ parent }) => !parent?.enableMomo
    }),
    defineField({
      name: 'cashInstructions',
      title: 'Cash Payment Instructions',
      type: 'text'
    })
  ]
})