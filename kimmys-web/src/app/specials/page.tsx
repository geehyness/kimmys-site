// src/app/specials/page.tsx
import { client } from '@/lib/sanity';
import Layout from '@/components/Layout';
import styles from '../page.module.css'; // Reuse styles from homepage
import MealCard from '@/components/MealCard'; // Import the MealCard component

async function getData() {
  const query = `*[_type == "special" && isActive == true] {
    _id,
    title,
    meal-> {
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
    }
  }`;
  try {
    const data = await client.fetch(query);
    return data;
  } catch (error) {
    console.error("Error fetching specials data from Sanity:", error);
    return;
  }
}

export default async function SpecialsPage() {
  const specials = await getData();

  return (
    <Layout>
      <div className={styles.container}>
        <h1>Today's Specials</h1>
        {specials && specials.length > 0 ? (
          <div className={styles.mealsGrid}>
            {specials.map((special) => (
              <MealCard key={special.meal?._id} meal={special.meal} />
            ))}
          </div>
        ) : (
          <p>No specials today. Check back tomorrow!</p>
        )}
      </div>
    </Layout>
  );
}