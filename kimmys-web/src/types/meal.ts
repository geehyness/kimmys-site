export interface Category {
    _id: string
    _type: 'category'
    title: string
    slug: {
      _type: 'slug'
      current: string
    }
  }
  
  export interface Meal {
    _id: string
    _type: 'meal'
    name: string
    description?: string
    price: number
    image?: {
      asset: {
        _ref: string
        _type: 'reference'
      }
    }
    category: Category
    isAvailable: boolean
  }
  
  export interface MealCardProps {
    meal: Omit<Meal, '_type'> & {
      image?: {
        asset?: {
          url?: string
          _ref?: string
        }
      }
    }
  }