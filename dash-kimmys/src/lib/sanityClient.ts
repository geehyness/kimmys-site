// src/lib/sanityClient.ts
import { SanityImageSource } from '@/types/sanity';
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!, // Replace with your Project ID
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production', // Replace with your Dataset ID (defaults to 'production')
  apiVersion: '2023-10-01', // Use a recent API version
  useCdn: process.env.NODE_ENV === 'production', // Enable CDN in production
});

export const writeClient = createClient({
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    token: process.env.SANITY_API_WRITE_TOKEN,
    apiVersion: '2023-10-01',
    useCdn: false, // Always false for write operations
  });
  
  const builder = imageUrlBuilder(client);

  export const urlFor = (source: SanityImageSource) => builder.image(source);
  