'use client';

import Image from 'next/image';
import { useShoppingCart } from '@/context/ShoppingCartContext';
import { urlFor } from '@/lib/sanity';
import styles from './MealCard.module.css';
import { useState } from 'react';
import { MealCardProps } from '@/types/meal';

// Helper type for expanded categories only (removed unused CategoryReference)
type ExpandedCategory = {
  _id: string;
  _type: 'category';
  title: string;
  slug: {
    current: string;
  };
};

export default function MealCard({ meal }: MealCardProps) {
  const { addToCart, getItemQuantity } = useShoppingCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const quantity = getItemQuantity(meal._id);

  const handleAddToCart = () => {
    if (!meal.isAvailable) return;
    
    addToCart({
      _id: meal._id,
      name: meal.name,
      price: meal.price,
      image: meal.image
    });
  };

  const getCategoryTitle = () => {
    if (!meal.category) return undefined;
    if ('title' in meal.category) {
      return (meal.category as ExpandedCategory).title;
    }
    return undefined;
  };

  const categoryTitle = getCategoryTitle();

  if (!meal.isAvailable) return null;

  return (
    <article 
      className={`${styles.mealCard} ${isHovered ? styles.hovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        {meal.image?.asset?.url && (
          <Image
            src={urlFor(meal.image).width(600).height(400).url()}
            alt={meal.name}
            fill
            className={`${styles.image} ${isImageLoading ? styles.loading : styles.loaded}`}
            onLoadingComplete={() => setIsImageLoading(false)}
          />
        )}
        {categoryTitle && (
          <span className={styles.categoryBadge}>
            {categoryTitle}
          </span>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{meal.name}</h3>
        {meal.description && (
          <p className={styles.description}>{meal.description}</p>
        )}
        <div className={styles.footer}>
          <span className={styles.price}>R{meal.price?.toFixed(2)}</span>
          <button 
            onClick={handleAddToCart}
            className={`${styles.addButton} ${quantity > 0 ? styles.hasQuantity : ''}`}
            disabled={!meal.isAvailable}
          >
            {quantity > 0 ? `(${quantity}) Add More` : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}