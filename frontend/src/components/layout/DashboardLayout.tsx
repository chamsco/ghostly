import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';
import { ThemeToggle } from '@/components/ui/theme-toggle';

interface NavItem {
  title: string;
  href: string;
  icon?: React.ReactNode;
  adminOnly?: boolean;
}

const navigation: NavItem[] = [
  { title: 'Dashboard', href: '/' },
  { title: 'Projects', href: '/projects' },
  { title: 'Deployments', href: '/deployments' },
  { title: 'Settings', href: '/settings' },
  { title: 'Admin', href: '/admin', adminOnly: true }
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const filteredNavigation = navigation.filter(
    item => !item.adminOnly || user?.roles?.includes('admin')
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card shadow-lg transition-transform duration-200 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-4">
            <h1 className="text-xl font-bold">Hostking</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-2 py-4">
            {filteredNavigation.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center rounded-lg px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>

          {/* User menu */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <ThemeToggle />
            </div>
            <button
              onClick={() => logout()}
              className="mt-4 w-full rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="sticky top-0 z-40 flex h-16 items-center gap-x-4 border-b bg-background px-4 shadow-sm md:hidden">
        <button
          onClick={toggleSidebar}
          className="text-muted-foreground hover:text-foreground"
        >
          <span className="sr-only">Open sidebar</span>
          {/* Add your menu icon here */}
        </button>

        <div className="flex flex-1 justify-end">
          <ThemeToggle />
        </div>
      </div>

      {/* Main content */}
      <main className="md:pl-64">
        {children}
      </main>
    </div>
  );
} 