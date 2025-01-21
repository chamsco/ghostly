import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, User as UserIcon, Shield, MoreVertical } from 'lucide-react';
import { baseApi } from '@/lib/axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/types/user';
import { useAuth } from '@/contexts/auth.context';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

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

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await baseApi.get<User[]>('/users');
        setUsers(response.data);
      } catch (err) {
        console.error('Failed to fetch users:', err);
        toast({
          title: "Error",
          description: "Failed to fetch users. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.isAdmin) {
      fetchUsers();
    }
  }, [user, navigate, toast]);

  const handleAddUser = () => {
    // TODO: Implement add user functionality
    toast({
      title: "Coming Soon",
      description: "Add user functionality will be available soon.",
    });
  };

  const handleEditUser = (userId: string) => {
    // TODO: Implement edit user functionality
    toast({
      title: "Coming Soon",
      description: "Edit user functionality will be available soon.",
    });
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    // TODO: Implement toggle user status functionality
    toast({
      title: "Coming Soon",
      description: "User status toggle functionality will be available soon.",
    });
  };

  const handleDeleteUser = async (userId: string) => {
    // TODO: Implement delete user functionality
    toast({
      title: "Coming Soon",
      description: "Delete user functionality will be available soon.",
    });
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
                  Last active: {new Date(user.lastActive).toLocaleDateString()}
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