/**
 * Donnees de test pour les utilisateurs
 */
import { User } from '../../../src/types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Jean Dupont',
    email: 'jean.dupont@test.com',
    phone: '+33 6 12 34 56 78',
    avatar: 'https://example.com/avatar.jpg',
    favoriteRestaurants: ['resto-1', 'resto-2'],
    orders: [],
    isGuest: false
  },
  {
    id: 'user-2',
    name: 'Marie Martin',
    email: 'marie.martin@test.com',
    phone: '+33 6 98 76 54 32',
    favoriteRestaurants: ['resto-1'],
    orders: [],
    isGuest: false
  },
  {
    id: 'guest-1',
    name: 'Utilisateur Invite',
    email: 'guest@test.com',
    favoriteRestaurants: [],
    orders: [],
    isGuest: true
  }
];

export const mockApiUser = {
  id: '4ffe5398-4599-4c33-98ec-18a96fd9e200',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@oneeats.com',
  phone: '+33 6 00 00 00 00',
  role: 'USER',
  createdAt: '2025-01-01T00:00:00Z'
};

export const getUserById = (id: string): User | undefined => {
  return mockUsers.find(u => u.id === id);
};
