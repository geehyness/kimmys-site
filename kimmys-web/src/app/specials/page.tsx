import { client } from '@/lib/sanity';
import styles from '../page.module.css';
import MealCard from '@/components/MealCard';
import { Meal } from '@/types/meal';

interface Special {
  _id: string;
  title: string;
  meal?: Meal;
}

async function getData(): Promise<Special[]> {  // Corrected to return array of Specials
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
    const data = await client.fetch<Special[]>(query);  // Corrected to expect array
    return data || [];  // Ensure we always return an array
  } catch (error) {
    console.error("Error fetching specials data from Sanity:", error);
    return [];  // Return empty array on error
  }
}

export default async function SpecialsPage() {
  const specials = await getData();

  return (
    <div className={styles.container}>
      <h1>Today&apos;s Specials</h1>
      {specials.length > 0 ? (  // Simplified check since we always get an array
        <div className={styles.mealsGrid}>
          {specials.map((special) => (
            special.meal && <MealCard key={special.meal._id} meal={special.meal} />
          ))}
        </div>
      ) : (
        <p>No specials today. Check back tomorrow!</p>
      )}
    </div>
  );
}