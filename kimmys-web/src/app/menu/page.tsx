'use client';

import { useState, useEffect } from 'react';
import { client } from '@/lib/sanity';
import styles from './page.module.css';
import MealCard from '@/components/MealCard';
import { Meal, Category } from '@/types/meal';

export default function MenuPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Optimized meal query with proper category expansion
        const mealQuery = `*[_type == "meal" && isAvailable == true] {
          _id,
          _type,
          name,
          description,
          price,
          isAvailable,
          "category": category->{
            _id,
            _type,
            title,
            slug {
              current
            }
          },
          image {
            asset-> {
              _id,
              _type,
              url
            }
          }
        }`;

        // Optimized categories query with proper slug handling
        const categoriesQuery = `*[_type == "category"] | order(title asc) {
          _id,
          _type,
          title,
          slug {
            current
          }
        }`;

        const [mealsData, categoriesData] = await Promise.all([
          client.fetch<Meal[]>(mealQuery),
          client.fetch<Category[]>(categoriesQuery)
        ]);

        setMeals(mealsData || []);
        setCategories(categoriesData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Failed to load menu. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const filteredMeals = activeCategory
    ? meals.filter(meal => {
        if (!meal.category) return false;
        return '_id' in meal.category && meal.category._id === activeCategory;
      })
    : meals;

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Loading menu...</p>
    </div>
  );

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <h1>Our Full Menu</h1>
          <p>Filter by category or browse all items</p>
        </div>
      </section>

      <section className={`container ${styles.mealsSection}`}>
        <div className={styles.categoryFilters}>
          <button
            className={`${styles.filterButton} ${!activeCategory ? styles.active : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            All Items
          </button>

          {categories.map(category => (
            <button
              key={category._id}
              className={`${styles.filterButton} ${activeCategory === category._id ? styles.active : ''}`}
              onClick={() => setActiveCategory(category._id)}
            >
              {category.title}
            </button>
          ))}
        </div>

        <h2 className="text-center">Menu Items</h2>

        <div className={styles.mealsGrid}>
          {filteredMeals.length > 0 ? (
            filteredMeals.map(meal => (
              <MealCard key={meal._id} meal={meal} />
            ))
          ) : (
            <p className={styles.noItems}>
              {meals.length === 0
                ? 'No meals available'
                : 'No items found in this category'}
            </p>
          )}
        </div>
      </section>
    </>
  );
}