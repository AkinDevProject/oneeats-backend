import { useState, useEffect } from 'react';
import apiService from '../../services/api';
import { User } from '../../types';

interface UseUsersResult {
  users: User[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateUserStatus: (id: string, status: 'active' | 'inactive') => Promise<void>;
}

export const useUsers = (): UseUsersResult => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.admin.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (id: string, status: 'active' | 'inactive') => {
    try {
      const updatedUser = await apiService.admin.updateUserStatus(id, status);
      
      setUsers(prev =>
        prev.map(user =>
          user.id === id
            ? { ...user, status: updatedUser.status }
            : user
        )
      );
    } catch (err) {
      console.error('Error updating user status:', err);
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
    updateUserStatus,
  };
};