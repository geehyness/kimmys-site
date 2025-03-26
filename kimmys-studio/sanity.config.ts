import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: "Kimmy's Spaza Shop",

  projectId: 'lma2ysa6',
  dataset: 'production',

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Menu Items
            S.listItem()
              .title('Menu Items')
              .child(
                S.list()
                  .title('Menu Items')
                  .items([
                    S.documentTypeListItem('meal'),
                    S.documentTypeListItem('combo'),
                    S.documentTypeListItem('category'), // Add this line here
                  ])
              ),

            // Orders
            S.documentTypeListItem('order'),

            // Settings
            S.listItem()
              .title('Settings')
              .child(
                S.list()
                  .title('Settings')
                  .items([
                    S.documentTypeListItem('settings'),
                    S.documentTypeListItem('paymentSettings'),
                    S.documentTypeListItem('pickupSettings'),
                  ])
              ),
          ])
    }),
    visionTool()
  ],

  schema: {
    types: schemaTypes,
  },
})