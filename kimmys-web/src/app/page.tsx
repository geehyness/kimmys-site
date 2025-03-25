// app/page.tsx
import { client } from '@/lib/sanity';
import MealCard from '@/components/MealCard';
import styles from './page.module.css';

async function getFeaturedMeals() {
  const query = `*[_type == "meal" && isAvailable == true] | order(_createdAt desc)[0..5] {
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
  return await client.fetch(query);
}

export default async function Home() {
  const featuredMeals = await getFeaturedMeals();

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <h1>Welcome to Kimmy's Fast Foods</h1>
          <p>Authentic local flavors at affordable prices</p>
        </div>
      </section>

      <section className={`container ${styles.mealsSection}`}>
        <h2 className="text-center">Featured Items</h2>
        {featuredMeals.length > 0 ? (
          <div className={styles.mealsGrid}>
            {featuredMeals.map((meal) => (
              <MealCard key={meal._id} meal={meal} />
            ))}
          </div>
        ) : (
          <p className="text-center">Our menu is currently being updated. Please check back soon!</p>
        )}
      </section>
    </>
  );
}