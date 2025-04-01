'use client';

import Image from 'next/image';
import { useShoppingCart } from '@/context/ShoppingCartContext';
import { urlFor } from '@/lib/sanity';
import styles from './MealCard.module.css';
import { useState, useEffect } from 'react';
import { Meal } from '@/types/meal';

export default function MealCard({ meal }: { meal: Meal }) {
  const { addToCart, getItemQuantity } = useShoppingCart();
  const [isHovered, setIsHovered] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [quantity, setQuantity] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setQuantity(getItemQuantity(meal._id));
  }, [getItemQuantity, meal._id]);

  const handleAddToCart = async () => {
    if (!meal.isAvailable || isAdding) return;

    setIsAdding(true);
    try {
      await addToCart({
        _id: meal._id,
        _type: meal._type || 'meal',
        name: meal.name,
        price: meal.price,
        image: meal.image,
        extras: meal.extras || [],
        isAvailable: meal.isAvailable,
        ...(meal.category && { category: meal.category })
      });
    } finally {
      setIsAdding(false);
    }
  };

  const getCategoryTitle = () => {
    if (!meal.category) return undefined;
    return '_ref' in meal.category ? undefined : meal.category.title;
  };

  if (!meal.isAvailable) return null;

  return (
    <article
      className={`${styles.mealCard} ${isHovered ? styles.hovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        {meal.image?.asset?.url ? (
          <Image
            src={urlFor(meal.image).width(600).height(400).url()}
            alt={meal.name}
            fill
            className={`${styles.image} ${isImageLoading ? styles.loading : styles.loaded}`}
            onLoadingComplete={() => setIsImageLoading(false)}
            priority
          />
        ) : (
          <div className={styles.imagePlaceholder}>
            <div className={styles.spinner}></div>
          </div>
        )}
        {getCategoryTitle() && (
          <span className={styles.categoryBadge}>
            {getCategoryTitle()}
          </span>
        )}
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{meal.name}</h3>
        {meal.description && (
          <p className={styles.description}>{meal.description}</p>
        )}

        {/* Extras Section */}
        {meal.extras && meal.extras.length > 0 && (
          <div className={styles.extrasSection}>
            <h4 className={styles.extrasTitle}>Available Extras:</h4>
            <ul className={styles.extrasList}>
              {meal.extras.map(extra => (
                <li key={extra._id} className={styles.extraItem}>
                  {extra.name} (+R{extra.price.toFixed(2)})
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className={styles.footer}>
          <span className={styles.price}>R{meal.price?.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            className={`${styles.addButton} ${
              quantity > 0 ? styles.hasQuantity : ''
            } ${isAdding ? styles.isAdding : ''}`}
            disabled={!meal.isAvailable || isAdding}
            aria-label={`Add ${meal.name} to cart`}
          >
            {quantity > 0 ? `(${quantity}) Add More` : 'Add to Cart'}
          </button>
        </div>
      </div>
    </article>
  );
}