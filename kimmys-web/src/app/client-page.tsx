'use client';

import { useEffect, useState } from 'react';
import { client } from '@/lib/sanity';
import MealCard from '@/components/MealCard';
import Layout from '@/components/Layout';
import styles from './page.module.css';

export default function ClientPage() {
  const [meals, setMeals] = useState([]);

  useEffect(() => {
    async function fetchMeals() {
      const query = `*[_type == "meal"] {
        _id, name, description, price,
        image { asset-> { _id, url } }
      }`;
      const data = await client.fetch(query);
      setMeals(data);
    }
    fetchMeals();
  }, []);

  return (
    <Layout>
      <div className={styles.container}>
        <section className={styles.hero}>
          <h1>Welcome to Kimmy's!</h1>
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
    </Layout>
  );
}