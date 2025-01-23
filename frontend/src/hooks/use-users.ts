import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { User } from '@/types/user';
import { apiInstance } from '@/lib/axios';

export function useUsers() {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await apiInstance.get<User[]>('/users');
      // Ensure we always return an array
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  // Ensure users is always an array
  const users = Array.isArray(data) ? data : [];

  const updateUserStatusMutation = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      await apiInstance.patch(`/users/${userId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await apiInstance.delete(`/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  return {
    users,
    isLoading,
    error,
    refetch,
    updateUserStatus: updateUserStatusMutation.mutateAsync,
    deleteUser: deleteUserMutation.mutateAsync,
  };
} 