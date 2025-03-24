import { client } from '@/lib/sanity';
import styles from './page.module.css';
import MealCard from '@/components/MealCard';
import ErrorComponent from '@/components/Error';

async function getMeals() {
  try {
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
    
    const data = await client.fetch(query);
    
    if (!data) {
      throw new Error('No data returned from Sanity');
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching meals:', error);
    throw error;
  }
}

export default async function Home() {
  let meals = [];
  let error = null;

  try {
    meals = await getMeals();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load meals';
    console.error('Page error:', err);
  }

  if (error) {
    return <ErrorComponent message={error} />;
  }

  return (
    
    <div className={styles.container}>
      <section className={styles.hero}>
      <br />
      <br />
      <br />
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
  );
}