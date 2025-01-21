/**
 * Dashboard Layout Component
 * 
 * Provides the main layout structure for authenticated pages including:
 * - Responsive sidebar navigation
 * - Header with user menu and theme toggle
 * - Main content area
 * - Mobile navigation handling
 * 
 * Features:
 * - Responsive design (mobile-first)
 * - Collapsible sidebar
 * - Role-based navigation items
 * - User session management
 * - Theme switching
 * - Device management
 * 
 * @example
 * ```tsx
 * <DashboardLayout>
 *   <Dashboard />
 * </DashboardLayout>
 * ```
 */

import { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { useTheme } from '@/components/theme-provider';
import {
  LayoutDashboard,
  Settings,
  Users,

  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  User
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
//import { Server, Shield } from 'lucide-react';

/**
 * Navigation item configuration
 */
interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

/**
 * Navigation items configuration
 * Defines all available navigation options in the sidebar
 */
const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    label: 'Users',
    path: '/users',
    icon: <Users className="h-5 w-5" />,
    adminOnly: true
  },
  {
    label: 'Profile',
    path: '/profile',
    icon: <User className="h-5 w-5" />
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: <Settings className="h-5 w-5" />
  }
];

export function DashboardLayout() {
  // State and hooks
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Handles user logout
   * Shows confirmation dialog and handles the logout process
   */
  const handleLogout = async () => {
    // Show confirmation dialog
    const confirmed = window.confirm('Are you sure you want to log out?');
    if (!confirmed) return;

    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        variant: 'destructive',
        title: 'Logout failed',
        description: 'Please try again'
      });
    }
  };

  /**
   * Toggles between light and dark theme
   */
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  /**
   * Filters navigation items based on user role
   * Removes admin-only items for non-admin users
   */
  const filteredNavItems = navItems.filter(item => 
    !item.adminOnly || user?.isAdmin
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        {isSidebarOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 w-64 h-screen transition-transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        <div className="h-full px-3 py-4 overflow-y-auto bg-card">
          {/* Navigation Links */}
          <nav className="space-y-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center px-4 py-3 rounded-lg
                  ${location.pathname === item.path
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent'
                  }
                `}
              >
                {item.icon}
                <span className="ml-3">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="absolute bottom-4 left-0 right-0 px-3 space-y-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-full flex items-center px-4 py-3 rounded-lg hover:bg-accent"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="ml-3">
                {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
              </span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              <span className="ml-3">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="p-4 md:ml-64">
        <div className="mt-14">
          <Outlet />
        </div>
      </div>
    </div>
  );
} 