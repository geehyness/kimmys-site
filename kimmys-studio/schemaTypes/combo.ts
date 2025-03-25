import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'combo',
  title: 'Meal Combo',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Combo Name',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text'
    }),
    defineField({
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: (Rule) => Rule.required().positive()
    }),
    defineField({
      name: 'image',
      title: 'Image',
      type: 'image',
      options: { hotspot: true }
    }),
    defineField({
      name: 'meals',
      title: 'Included Meals',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'meal' }] }],
      validation: (Rule) => Rule.required().min(2)
    }),
    defineField({
      name: 'isAvailable',
      title: 'Is Available',
      type: 'boolean',
      initialValue: true
    })
  ]
})