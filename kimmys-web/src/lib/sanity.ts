import type { Category, Meal } from '@/types/meal';
import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';
import type { SanityImageSource } from '@sanity/image-url/lib/types/types';

// Validate environment variables
const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2023-05-03';
const token = process.env.SANITY_API_WRITE_TOKEN;

if (!projectId) throw new Error('Missing NEXT_PUBLIC_SANITY_PROJECT_ID');
if (!dataset) throw new Error('Missing NEXT_PUBLIC_SANITY_DATASET');

// Enhanced client configuration
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production' && !token, // CDN only for public data
  token: token || undefined, // Handle undefined tokens gracefully
  ignoreBrowserTokenWarning: true,
  perspective: 'published',
  fetch: {
    cache: 'no-store' // Bypass cache for fresh data
  }
});

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// Enhanced fetch functions with timeout

export async function getCategories(): Promise<Category[]> {
  let timeout: NodeJS.Timeout | undefined; // Declare timeoutId 
  console.log("timeout", timeout)

  try {
    const controller = new AbortController();
    
    return await client.fetch<Category[]>(
      `*[_type == "category"] | order(title asc) {
        _id,
        title,
        slug
      }`,
      {},
      { signal: controller.signal }
    );
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export async function getAvailableMeals(): Promise<Meal[]> {
  let timeout: NodeJS.Timeout | undefined; // Declare timeoutId outside the try block

  try {
    const controller = new AbortController();

    return await client.fetch<Meal[]>(
      `*[_type == "meal" && isAvailable == true] {
        _id,
        name,
        description,
        price,
        isAvailable,
        "category": category->{
          _id,
          title,
          slug
        },
        image {
          asset-> {
            _id,
            url
          }
        }
      }`,
      {},
      { signal: controller.signal }
    );
  } catch (error) {
    console.error('Failed to fetch meals:', error);
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

// Connection test utility
export async function testSanityConnection(): Promise<boolean> {
  try {
    const result = await client.fetch('count(*[_type == "systemSettings"])');
    console.log('Sanity connection test successful:', result);
    return true;
  } catch (error) {
    console.error('Sanity connection test failed:', error);
    return false;
  }
}