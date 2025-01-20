import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, User, Shield, MoreVertical } from 'lucide-react';
import { api } from '@/lib/axios';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive';
  lastActive: string;
}

export function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <Button>
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
                  {user.role === 'admin' ? (
                    <Shield className="h-6 w-6 text-primary" />
                  ) : (
                    <User className="h-6 w-6 text-primary" />
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
                  <DropdownMenuItem>
                    Edit User
                  </DropdownMenuItem>
                  {user.status === 'active' ? (
                    <DropdownMenuItem className="text-yellow-500">
                      Deactivate User
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem className="text-green-500">
                      Activate User
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem className="text-destructive">
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

        {users.length === 0 && !loading && (
          <div className="col-span-3 flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <div className="rounded-lg bg-primary/10 p-3">
              <User className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No users yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add users to give them access to the platform.
            </p>
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </div>
        )}
      </div>
    </div>
  );
} 