// src/components/MealCard.tsx
'use client';

import Image from 'next/image';
import { useShoppingCart } from '@/context/ShoppingCartContext';
import styles from './MealCard.module.css';

interface Meal {
  _id: string;
  name: string;
  description?: string;
  price: number;
  image?: {
    asset?: {
      url?: string;
    };
  };
}

export default function MealCard({ meal }: { meal: Meal }) {
  const { addToCart, getItemQuantity } = useShoppingCart();

  const handleAddToCart = () => {
    addToCart({
      _id: meal._id,
      name: meal.name,
      price: meal.price,
      image: meal.image
    });
  };

  return (
    <div className={styles.mealCard}>
      {meal.image?.asset?.url ? (
        <div className={styles.imageContainer}>
          <Image
            src={meal.image.asset.url}
            alt={meal.name}
            fill
            className={styles.image}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      ) : (
        <div className={styles.imagePlaceholder}>No Image</div>
      )}
      <div className={styles.content}>
        <h3>{meal.name}</h3>
        {meal.description && <p className={styles.description}>{meal.description}</p>}
        <div className={styles.footer}>
          <span className={styles.price}>R{meal.price.toFixed(2)}</span>
          <button 
            className={styles.addButton}
            onClick={handleAddToCart}
          >
            Add ({getItemQuantity(meal._id)})
          </button>
        </div>
      </div>
    </div>
  );
}