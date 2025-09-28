import { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { User, UserStatus, CreateUserRequest, UpdateUserRequest } from '../../types';

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createUser: (userData: CreateUserRequest) => Promise<void>;
  updateUser: (id: string, userData: UpdateUserRequest) => Promise<void>;
  updateUserStatus: (id: string, status: UserStatus) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useUsers = (): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.users.getAll();

      // Convertir les dates en objets Date
      const usersWithDates = data.map(user => ({
        ...user,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt)
      }));

      setUsers(usersWithDates);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (userData: CreateUserRequest) => {
    try {
      const newUser = await apiService.users.create(userData);
      const userWithDates = {
        ...newUser,
        createdAt: new Date(newUser.createdAt),
        updatedAt: new Date(newUser.updatedAt)
      };
      setUsers(prev => [...prev, userWithDates]);
    } catch (err) {
      console.error('Error creating user:', err);
      throw err;
    }
  };

  const updateUser = async (id: string, userData: UpdateUserRequest) => {
    try {
      const updatedUser = await apiService.users.update(id, userData);
      const userWithDates = {
        ...updatedUser,
        createdAt: new Date(updatedUser.createdAt),
        updatedAt: new Date(updatedUser.updatedAt)
      };

      setUsers(prev =>
        prev.map(user =>
          user.id === id ? userWithDates : user
        )
      );
    } catch (err) {
      console.error('Error updating user:', err);
      throw err;
    }
  };

  const updateUserStatus = async (id: string, status: UserStatus) => {
    try {
      // Pour l'instant, on utilise update générique car il n'y a pas d'endpoint spécifique pour le status
      const updatedUser = await apiService.users.update(id, { status } as any);
      const userWithDates = {
        ...updatedUser,
        createdAt: new Date(updatedUser.createdAt),
        updatedAt: new Date(updatedUser.updatedAt)
      };

      setUsers(prev =>
        prev.map(user =>
          user.id === id ? userWithDates : user
        )
      );
    } catch (err) {
      console.error('Error updating user status:', err);
      throw err;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await apiService.users.delete(id);
      setUsers(prev => prev.filter(user => user.id !== id));
    } catch (err) {
      console.error('Error deleting user:', err);
      throw err;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    createUser,
    updateUser,
    updateUserStatus,
    deleteUser,
  };
};