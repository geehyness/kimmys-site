import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'pickupSettings',
  title: 'Pickup Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'prepTimeMinutes',
      title: 'Default Preparation Time (minutes)',
      type: 'number',
      initialValue: 20
    }),
    defineField({
      name: 'pickupInstructions',
      title: 'Pickup Instructions',
      type: 'text',
      description: 'Displayed to customers after ordering'
    })
  ]
})