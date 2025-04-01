// schemas/extra.js
export default defineType({
  name: 'extra',
  title: 'Extra',
  type: 'document',
  icon: () => '➕',
  fields: [
    defineField({
      name: 'name',
      title: 'Extra Name',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'price',
      title: 'Additional Price',
      type: 'number',
      validation: (Rule) => Rule.required().min(0)
    }),
    defineField({
      name: 'isAvailable',
      title: 'Is Available',
      type: 'boolean',
      initialValue: true
    })
  ]
})
