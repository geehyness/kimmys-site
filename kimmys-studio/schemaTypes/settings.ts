import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'settings',
  title: 'Shop Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'shopName',
      title: 'Shop Name',
      type: 'string',
      validation: (Rule) => Rule.required()
    }),
    defineField({
      name: 'logo',
      title: 'Shop Logo',
      type: 'image'
    }),
    defineField({
      name: 'openingHours',
      title: 'Opening Hours',
      type: 'array',
      of: [{type: 'openingHours'}]
    }),
    defineField({
      name: 'contactInfo',
      title: 'Contact Information',
      type: 'object',
      fields: [
        defineField({
          name: 'phone',
          title: 'Phone Number',
          type: 'string'
        }),
        defineField({
          name: 'email',
          title: 'Email',
          type: 'string'
        }),
        defineField({
          name: 'address',
          title: 'Physical Address',
          type: 'text'
        })
      ]
    }),
    defineField({
      name: 'socialMedia',
      title: 'Social Media Links',
      type: 'object',
      fields: [
        defineField({
          name: 'facebook',
          title: 'Facebook',
          type: 'url'
        }),
        defineField({
          name: 'instagram',
          title: 'Instagram',
          type: 'url'
        }),
        defineField({
          name: 'twitter',
          title: 'Twitter',
          type: 'url'
        })
      ]
    })
  ]
})