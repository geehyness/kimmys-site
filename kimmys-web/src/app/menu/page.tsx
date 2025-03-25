'use client'

import { useState, useEffect } from 'react'
import { client } from '@/lib/sanity'
import styles from './page.module.css'
import MealCard from '@/components/MealCard'
import { Meal, Category } from '@/types/meal'

// Client components
function CategoryFilters({ 
  categories,
  activeCategory,
  setActiveCategory 
}: { 
  categories: Category[]
  activeCategory: string | null
  setActiveCategory: (category: string | null) => void
}) {
  return (
    <div className={styles.categoryFilters}>
      <button
        className={`${styles.filterButton} ${!activeCategory ? styles.active : ''}`}
        onClick={() => setActiveCategory(null)}
      >
        All Items
      </button>
      
      {categories.map(category => (
        <button
          key={category._id}
          className={`${styles.filterButton} ${activeCategory === category._id ? styles.active : ''}`}
          onClick={() => setActiveCategory(category._id)}
        >
          {category.title}
        </button>
      ))}
    </div>
  )
}

function MealsGrid({ meals, activeCategory }: { meals: Meal[], activeCategory: string | null }) {
  const [filteredMeals, setFilteredMeals] = useState<Meal[]>(meals)

  useEffect(() => {
    if (!activeCategory) {
      setFilteredMeals(meals)
    } else {
      setFilteredMeals(meals.filter(meal => meal.category._id === activeCategory))
    }
  }, [activeCategory, meals])

  return (
    <div className={styles.mealsGrid}>
      {filteredMeals.length > 0 ? (
        filteredMeals.map(meal => (
          <MealCard key={meal._id} meal={meal} />
        ))
      ) : (
        <p className={styles.noItems}>No items found in this category</p>
      )}
    </div>
  )
}

// Server-side data fetching
async function getMenuData(): Promise<{ meals: Meal[], categories: Category[] }> {
  const mealQuery = `*[_type == "meal"] {
    _id,
    name,
    description,
    price,
    isAvailable,
    category->{
      _id,
      title,
      slug
    },
    image {
      asset-> {
        _id,
        url
      }
    }
  }`

  const categoriesQuery = `*[_type == "category"] | order(title asc) {
    _id,
    title,
    slug
  }`

  const [meals, categories] = await Promise.all([
    client.fetch<Meal[]>(mealQuery),
    client.fetch<Category[]>(categoriesQuery)
  ])

  return { meals, categories }
}

// Page component
export default async function MenuPage() {
  const { meals, categories } = await getMenuData()
  const availableMeals = meals.filter(meal => meal.isAvailable)

  return (
    <>
      <section className={styles.hero}>
        <div className="container">
          <h1>Our Full Menu</h1>
          <p>Filter by category or browse all items</p>
        </div>
      </section>

      <section className={`container ${styles.mealsSection}`}>
        <CategoryFilters 
          categories={categories} 
          activeCategory={null}
          setActiveCategory={() => {}}
        />
        <h2 className="text-center">Menu Items</h2>
        <MealsGrid meals={availableMeals} activeCategory={null} />
      </section>
    </>
  )
}