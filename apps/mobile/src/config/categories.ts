// Configuration des catégories de cuisine pour le filtrage UI
import { CuisineCategory } from '../types';

export const cuisineCategories: CuisineCategory[] = [
  { id: 'all', name: 'Toutes', icon: '🍽️' },
  { id: 'pizza', name: 'Pizza', icon: '🍕' },
  { id: 'kebab', name: 'Kebab', icon: '🥙' },
  { id: 'burger', name: 'Burger', icon: '🍔' },
  { id: 'brochette', name: 'Brochettes', icon: '🍢' },
  { id: 'tacos', name: 'Tacos', icon: '🌮' },
  { id: 'sushi', name: 'Sushi', icon: '🍣' },
  { id: 'healthy', name: 'Healthy', icon: '🥗' },
  { id: 'dessert', name: 'Desserts', icon: '🍰' },
];
