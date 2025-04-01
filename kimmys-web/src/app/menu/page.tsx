'use client';

import { useState, useEffect } from 'react';
import { client } from '@/lib/sanity';
import styles from './page.module.css';
import MealCard from '@/components/MealCard';
import { Meal, Category } from '@/types/meal';

interface CategoryWithCount extends Category {
  mealCount: number;
}

export default function MenuPage() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch all categories
        const categoriesQuery = `*[_type == "category"] | order(title asc) {
          _id,
          _type,
          title,
          slug {
            current
          },
          "mealCount": count(*[_type == "meal" && references(^._id) && isAvailable == true])
        }`;

        // Fetch meals based on selected category or all available meals
        const mealsQuery = selectedCategory 
          ? `*[_type == "meal" && isAvailable == true && references(*[_type == "category" && slug.current == "${selectedCategory}"]._id)]`
          : `*[_type == "meal" && isAvailable == true]`;

          const fullMealsQuery = `${mealsQuery} {
            _id,
            _type,
            name,
            description,
            price,
            isAvailable,
            featured,
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
            },
            // Add this part to fetch extras
            extras[]-> {
              _id,
              _type,
              name,
              price,
              isAvailable
            }
          }`;
  

        const [categoriesData, mealsData] = await Promise.all([
          client.fetch<CategoryWithCount[]>(categoriesQuery),
          client.fetch<Meal[]>(fullMealsQuery)
        ]);

        setCategories(categoriesData || []);
        setMeals(mealsData || []);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError('Failed to load menu. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [selectedCategory]);

  if (loading) return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Loading menu...</p>
    </div>
  );

  if (error) return <div className={styles.error}>{error}</div>;

  return (
    <main className={styles.menuPage}>
      {/* Menu Header */}
      <section className={styles.menuHeader}>
        <div className={`container ${styles.headerContent}`}>
          <h1>Our Menu</h1>
          <p>Discover our delicious offerings</p>
        </div>
      </section>

      {/* Category Filter */}
      <section className={`container ${styles.categoryFilter}`}>
        <div className={styles.filterButtons}>
          <button
            onClick={() => setSelectedCategory(null)}
            className={!selectedCategory ? styles.active : ''}
          >
            All Items
          </button>
          {categories.map(category => (
            <button
              key={category._id}
              onClick={() => setSelectedCategory(category.slug.current)}
              className={selectedCategory === category.slug.current ? styles.active : ''}
            >
              {category.title} ({category.mealCount})
            </button>
          ))}
        </div>
      </section>

      {/* Menu Items */}
      <section className={`container ${styles.menuItems}`}>
        {meals.length > 0 ? (
          <div className={styles.mealsGrid}>
            {meals.map(meal => (
              <MealCard key={meal._id} meal={meal} />
            ))}
          </div>
        ) : (
          <div className={styles.noItems}>
            <p>No meals available in this category</p>
            <button 
              onClick={() => setSelectedCategory(null)}
              className={styles.viewAllButton}
            >
              View All Items
            </button>
          </div>
        )}
      </section>
    </main>
  );
}