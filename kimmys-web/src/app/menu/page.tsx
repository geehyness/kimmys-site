// app/menu/page.tsx
import { client } from '@/lib/sanity';
import Layout from '@/components/Layout';
import styles from '../page.module.css';
import MealCard from '@/components/MealCard';

async function getMenuItems() {
  const query = `*[_type == "meal" && isAvailable == true] | order(name asc) {
    _id,
    name,
    description,
    price,
    category,
    image {
      asset-> {
        _id,
        url
      }
    }
  }`;
  return await client.fetch(query);
}

export default async function MenuPage() {
  const menuItems = await getMenuItems();

  return (
    <Layout>
      <div className={styles.container}>
        <h1>Our Full Menu</h1>
        {menuItems.length > 0 ? (
          <div className={styles.mealsSection}>
            <div className={styles.mealsGrid}>
              {menuItems.map((item) => (
                <MealCard key={item._id} meal={item} />
              ))}
            </div>
          </div>
        ) : (
          <p>Our menu is currently being updated. Please check back soon!</p>
        )}
      </div>
    </Layout>
  );
}