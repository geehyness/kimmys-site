import { createClient } from '@sanity/client';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'lma2ysa6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  useCdn: process.env.NODE_ENV === 'production', // Use CDN in production only
  token: process.env.SANITY_API_TOKEN, // Only needed for write operations
  perspective: 'published', // Ensure you get published content
  fetch: {
    cache: 'no-store', // Disable caching for fresh data
  }
});