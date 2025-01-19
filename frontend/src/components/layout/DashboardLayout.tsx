import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Search } from 'lucide-react';
import {
  LayoutDashboard,
  Box,
  Server,
  Database,
  KeyRound,
  Settings,
  Users,
  Bell,
  Menu,
} from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside 
        className={`
          fixed md:static
          bg-background border-r border-purple-800/20
          w-64 h-full transition-transform duration-200 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-6">
            <Box className="w-8 h-8 text-purple-500" />
            <span className="text-xl font-bold">Ghostly</span>
          </div>
          
          <nav className="space-y-1">
            <Link to="/" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent/50 text-foreground/80 hover:text-foreground">
              <LayoutDashboard className="w-5 h-5" />
              <span>Dashboard</span>
            </Link>

            {user?.isAdmin && (
              <>
                <Link to="/projects" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent/50 text-foreground/80 hover:text-foreground">
                  <Box className="w-5 h-5" />
                  <span>Projects</span>
                </Link>
                <Link to="/servers" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent/50 text-foreground/80 hover:text-foreground">
                  <Server className="w-5 h-5" />
                  <span>Servers</span>
                </Link>
                <Link to="/databases" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent/50 text-foreground/80 hover:text-foreground">
                  <Database className="w-5 h-5" />
                  <span>Databases</span>
                </Link>
                <Link to="/users" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent/50 text-foreground/80 hover:text-foreground">
                  <Users className="w-5 h-5" />
                  <span>Users</span>
                </Link>
                <Link to="/settings" className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-accent/50 text-foreground/80 hover:text-foreground">
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-purple-800/20 px-4 flex items-center justify-between bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="hidden md:flex items-center space-x-2 bg-muted/50 rounded-full px-3 py-1.5">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search resources..."
                className="bg-transparent border-none focus:outline-none text-sm w-64"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />
            </Button>
            <ThemeToggle />
            <Button 
              variant="ghost" 
              onClick={logout}
              className="text-sm font-medium"
            >
              Logout
            </Button>
            <div className="h-8 w-8 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
              {user?.fullName?.[0] || 'U'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
} 