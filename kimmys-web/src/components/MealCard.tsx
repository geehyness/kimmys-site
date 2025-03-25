'use client'

import Image from 'next/image'
import { useShoppingCart } from '@/context/ShoppingCartContext'
import { urlFor } from '@/lib/sanity'
import styles from './MealCard.module.css'
import { useState } from 'react'
import { MealCardProps } from '@/types/meal'

export default function MealCard({ meal }: MealCardProps) {
  const { addToCart, getItemQuantity } = useShoppingCart()
  const [isHovered, setIsHovered] = useState(false)

  const handleAddToCart = () => {
    addToCart({
      _id: meal._id,
      name: meal.name,
      price: meal.price,
      image: meal.image
    })
  }

  const imageUrl = meal.image?.asset?.url 
    ? meal.image.asset.url 
    : meal.image?.asset?._ref 
      ? urlFor(meal.image).url() 
      : null

  return (
    <div 
      className={styles.mealCard}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.imageContainer}>
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={meal.name}
            fill
            className={`${styles.image} ${isHovered ? styles.imageHover : ''}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className={styles.imagePlaceholder}>No Image</div>
        )}
        {meal.category && (
          <span className={styles.categoryBadge}>
            {meal.category.title}
          </span>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{meal.name}</h3>
        {meal.description && (
          <p className={styles.description}>{meal.description}</p>
        )}
        <div className={styles.footer}>
          <span className={styles.price}>R{meal.price.toFixed(2)}</span>
          <button 
            className={`${styles.addButton} ${isHovered ? styles.addButtonHover : ''}`}
            onClick={handleAddToCart}
            aria-label={`Add ${meal.name} to cart`}
          >
            Add ({getItemQuantity(meal._id)})
          </button>
        </div>
      </div>
    </div>
  )
}