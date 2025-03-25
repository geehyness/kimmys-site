'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/sanity';
import MealCard from '@/components/MealCard';
import styles from './page.module.css';

export interface Category {
  _id: string;
  _type: 'category';
  title: string;
  slug: {
    _type: 'slug';
    current: string;
  };
}

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
      url?: string;
    };
  };
  category?: {
    _ref: string;
    _type: 'reference';
  } | Category;
  isAvailable?: boolean;
}

export default function ClientPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMeals() {
      try {
        setLoading(true);
        const query = `*[_type == "meal" && isAvailable == true] {
          _id, 
          name, 
          description, 
          price,
          isAvailable,
          image { 
            asset-> { 
              _id, 
              url 
            } 
          },
          category-> { 
            _id, 
            title, 
            slug 
          }
        }`;
        const data: Meal[] = await client.fetch(query);
        setMeals(data);
      } catch (err) {
        setError('Failed to load meals. Please try again later.');
        console.error('Error fetching meals:', err);
      } finally {
        setLoading(false);
      }
    }
    
    fetchMeals();
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading menu items...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className="container">
      <section className={styles.hero}>
        <h1>Welcome to Kimmy&apos;s!</h1>
        <p>Your go-to place for delicious local meals</p>
      </section>

      <section className={styles.mealsSection}>
        <h2>Our Menu</h2>
        {meals.length > 0 ? (
          <div className={styles.mealsGrid}>
            {meals.map((meal) => (
              <MealCard key={meal._id} meal={meal} />
            ))}
          </div>
        ) : (
          <p>Our menu is currently being updated. Please check back soon!</p>
        )}
      </section>
    </div>
  );
}