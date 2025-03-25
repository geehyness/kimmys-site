import { defineType, defineField } from 'sanity'

export default defineType({
  name: 'openingHours',
  title: 'Opening Hours',
  type: 'object',
  fields: [
    defineField({
      name: 'day',
      title: 'Day',
      type: 'string',
      options: {
        list: [
          'Monday', 'Tuesday', 'Wednesday',
          'Thursday', 'Friday', 'Saturday',
          'Sunday'
        ]
      }
    }),
    defineField({
      name: 'open',
      title: 'Opening Time',
      type: 'string'
    }),
    defineField({
      name: 'close',
      title: 'Closing Time',
      type: 'string'
    }),
    defineField({
      name: 'closed',
      title: 'Closed All Day',
      type: 'boolean',
      initialValue: false
    })
  ]
})