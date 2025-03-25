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
    };
  };
  category: Category;
  isAvailable: boolean;
}

export interface MealCardProps {
  meal: Omit<Meal, '_type'> & {
    image?: {
      asset?: {
        url?: string;
        _ref?: string;
      };
    };
  };
}

export default function ClientPage() {
  const [meals, setMeals] = useState<Meal>();

  useEffect(() => {
    async function fetchMeals() {
      const query = `*[_type == "meal"] {
        _id, name, description, price,
        image { asset-> { _id, url } },
        category-> { _id, title, slug },
        isAvailable
      }`;
      const data: Meal = await client.fetch(query);
      setMeals(data);
    }
    fetchMeals();
  });

  return (
    <div className="container">
      <section className={styles.hero}>
        <h1>Welcome to Kimmy&apos;s!</h1>
        <p>Your go-to place for delicious local meals</p>
      </section>

      <section className={styles.mealsSection}>
        <h2>Our Menu</h2>
        {Array.isArray(meals) && meals.length > 0 ? (
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