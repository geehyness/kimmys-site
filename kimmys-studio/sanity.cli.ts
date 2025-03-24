import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'lma2ysa6',
    dataset: 'production'
  },
  studioHost: 'kimmys', // Add this at the root level
  autoUpdates: true,
  server: {
    hostname: 'localhost',
    port: 3333
  }
})