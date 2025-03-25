import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'settings',
  title: 'Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'shopName',
      title: 'Shop Name',
      type: 'string',
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'openingHours',
      title: 'Opening Hours',
      type: 'array',
      of: [{ type: 'openingHours' }] // Correct reference to the type
    }),
    defineField({
      name: 'contactPhone',
      title: 'Contact Phone',
      type: 'string'
    })
  ]
})