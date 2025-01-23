//import { useState } from 'react';
import {  useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, User as UserIcon, Shield, MoreVertical } from 'lucide-react';
//import { projectsApi } from '@/services/api.service';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
//import { User } from '@/types/user';
import { useAuth } from '@/contexts/auth.context';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
//import { UserStatus } from '@/types/user';
import { useUsers } from '@/hooks/use-users';

// Create a users API instance
const usersApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://168.119.111.140:3001',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token
usersApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
usersApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export function Users() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { users, isLoading, updateUserStatus, deleteUser } = useUsers();

  useEffect(() => {
    // Redirect non-admin users
    if (user && !user.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to view this page.",
        variant: "destructive"
      });
      navigate('/dashboard');
      return;
    }
  }, [user, navigate, toast]);

  const handleAddUser = () => {
    navigate('/register', { state: { isAdminCreating: true } });
  };

  const handleEditUser = (userId: string) => {
    const userToEdit = users.find(u => u.id === userId);
    if (!userToEdit) return;

    navigate(`/users/${userId}/edit`, { state: { user: userToEdit } });
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateUserStatus({ userId, status: newStatus });
      
      toast({
        title: "Success",
        description: `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully.`,
      });
    } catch (err) {
      console.error('Failed to toggle user status:', err);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again later.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      
      toast({
        title: "Success",
        description: "User deleted successfully.",
      });
    } catch (err) {
      console.error('Failed to delete user:', err);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again later.",
        variant: "destructive"
      });
    }
  };

  if (!user?.isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <Button onClick={handleAddUser}>
          <Plus className="mr-2 h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                <div className="rounded-lg bg-primary/10 p-2">
                  {user.isAdmin ? (
                    <Shield className="h-6 w-6 text-primary" />
                  ) : (
                    <UserIcon className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold">{user.fullName}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <p className="text-xs text-muted-foreground">@{user.username}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleEditUser(user.id)}>
                    Edit User
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleToggleUserStatus(user.id, user.status)}
                    className={user.status === 'active' ? 'text-yellow-500' : 'text-green-500'}
                  >
                    {user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteUser(user.id)}
                    className="text-destructive"
                  >
                    Delete User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className={`capitalize ${
                  user.status === 'active' ? 'text-green-500' : 'text-yellow-500'
                }`}>
                  {user.status}
                </span>
                <span className="text-muted-foreground">
                  Last active: {user.lastActive ? new Date(user.lastActive).toLocaleDateString() : 'Never'}
                </span>
              </div>
            </div>
          </Card>
        ))}

        {users.length === 0 && !isLoading && (
          <div className="col-span-3 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="rounded-lg bg-primary/10 p-3">
              <UserIcon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No users yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add users to give them access to the platform.
            </p>
            <Button className="mt-4" onClick={handleAddUser}>
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 