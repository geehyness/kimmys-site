export interface Category {
  _id: string;
  _type: 'category';
  title: string;
  slug: {
    _type: 'slug';
    current: string;
  };
}

export interface Extra {
  _id: string;
  _type: 'extra';
  name: string;
  price: number;
  isAvailable?: boolean;
}

export interface Meal {
  _id: string;
  _type: 'meal';
  name: string;
  description?: string;
  price: number;
  isAvailable?: boolean;
  category?: {
    _id: string;
    title: string;
    slug: {
      current: string;
    };
  } | {
    _ref: string;
    _type: 'reference';
  };
  image?: {
    asset?: {
      _id?: string;
      url?: string;
      _ref?: string;
      _type?: 'reference';
    };
  };
  extras?: Extra[];
}

export interface CartItem extends Meal {
  quantity: number;
  selectedExtras: Extra[][];
}