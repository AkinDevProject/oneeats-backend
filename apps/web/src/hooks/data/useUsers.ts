import { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { User, UserStatus, CreateUserRequest, UpdateUserRequest, SuspendUserRequest } from '../../types';

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createUser: (userData: CreateUserRequest) => Promise<void>;
  updateUser: (id: string, userData: UpdateUserRequest) => Promise<void>;
  updateUserStatus: (id: string, status: UserStatus) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  suspendUser: (id: string, data: SuspendUserRequest) => Promise<void>;
  reactivateUser: (id: string) => Promise<void>;
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
      // Utiliser le nouvel endpoint spécialisé pour le statut
      const updatedUser = await apiService.users.updateStatus(id, status);
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

  const suspendUser = async (id: string, data: SuspendUserRequest) => {
    try {
      const updatedUser = await apiService.users.suspend(id, data);
      const userWithDates = {
        ...updatedUser,
        createdAt: new Date(updatedUser.createdAt),
        updatedAt: new Date(updatedUser.updatedAt),
        suspendedAt: updatedUser.suspendedAt ? new Date(updatedUser.suspendedAt) : undefined,
        suspendedUntil: updatedUser.suspendedUntil ? new Date(updatedUser.suspendedUntil) : undefined,
      };

      setUsers(prev =>
        prev.map(user =>
          user.id === id ? userWithDates : user
        )
      );
    } catch (err) {
      console.error('Error suspending user:', err);
      throw err;
    }
  };

  const reactivateUser = async (id: string) => {
    try {
      const updatedUser = await apiService.users.reactivate(id);
      const userWithDates = {
        ...updatedUser,
        createdAt: new Date(updatedUser.createdAt),
        updatedAt: new Date(updatedUser.updatedAt),
        suspendedAt: undefined,
        suspendedUntil: undefined,
        suspensionReason: undefined,
      };

      setUsers(prev =>
        prev.map(user =>
          user.id === id ? userWithDates : user
        )
      );
    } catch (err) {
      console.error('Error reactivating user:', err);
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
    suspendUser,
    reactivateUser,
  };
};