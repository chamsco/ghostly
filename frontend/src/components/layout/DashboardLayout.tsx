import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth.context';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  Menu,
  LogOut,
  Settings,
  User,
  LayoutDashboard,
  Users,
  Activity
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 transform bg-card transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col justify-between border-r">
          <div className="px-4 py-6">
            <h2 className="mb-6 text-2xl font-semibold">squadron.host</h2>
            <nav className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate('/dashboard')}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate('/projects')}
              >
                <Activity className="mr-2 h-4 w-4" />
                Projects
              </Button>

              {user?.isAdmin && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => navigate('/users')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Users
                </Button>
              )}

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate('/profile')}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>

              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </nav>
          </div>

          <div className="border-t p-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`min-h-screen ${isSidebarOpen ? 'pl-64' : 'pl-0'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
          </div>
        </header>

        {/* Page content */}
        <main className="container mx-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 