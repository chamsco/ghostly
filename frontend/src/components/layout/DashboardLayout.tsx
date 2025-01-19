import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`bg-background border-r w-64 p-4 ${isSidebarOpen ? 'block' : 'hidden'} md:block`}>
        <nav className="space-y-2">
          <Link to="/" className="block p-2 hover:bg-accent rounded-lg">
            Dashboard
          </Link>
          {user?.isAdmin && (
            <>
              <Link to="/projects" className="block p-2 hover:bg-accent rounded-lg">
                Projects
              </Link>
              <Link to="/users" className="block p-2 hover:bg-accent rounded-lg">
                Users
              </Link>
              <Link to="/settings" className="block p-2 hover:bg-accent rounded-lg">
                Settings
              </Link>
            </>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1">
        {/* Header */}
        <header className="bg-background border-b p-4 flex justify-between items-center">
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            Menu
          </Button>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" onClick={logout}>
              Logout
            </Button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 