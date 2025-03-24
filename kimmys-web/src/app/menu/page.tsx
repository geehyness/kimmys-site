// src/app/menu/page.tsx
import { client } from '@/lib/sanity';
import Layout from '@/components/Layout';
import styles from '../page.module.css'; // Reuse styles from homepage
import MealCard from '@/components/MealCard'; // Import the MealCard component

async function getData() {
  const query = `*[_type == "meal"] {
    _id,
    name,
    description,
    price,
    image {
      asset-> {
        _id,
        url
      }
    }
  }`;
  try {
    const data = await client.fetch(query);
    return data;
  } catch (error) {
    console.error("Error fetching menu data from Sanity:", error);
    return;
  }
}

export default async function MenuPage() {
  const meals = await getData();

  return (
    <Layout>
      <div className={styles.container}>
        <h1>Our Full Menu</h1>
        <section className={styles.mealsSection}>
          {meals && meals.length > 0 ? (
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