// lib/sanity.ts
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'lma2ysa6',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2023-05-03',
  useCdn: true,
  perspective: 'published',
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}

// Type definitions
export interface Meal {
  _id: string;
  _type: 'meal';
  name: string;
  description?: string;
  price: number;
  image?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
  };
  category?: string;
  isAvailable?: boolean;
}

export interface Combo {
  _id: string;
  _type: 'combo';
  name: string;
  description?: string;
  price: number;
  meals: Array<{ _ref: string }>;
  image?: {
    asset: {
      _ref: string;
      _type: 'reference';
    };
  };
  isAvailable?: boolean;
}