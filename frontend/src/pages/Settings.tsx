import { useAuth } from '@/contexts/auth.context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '@/contexts/theme.context';

export function Settings() {
  const { user, updateAuthSettings } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light');
  };

  const handleAuthSettingChange = (checked: boolean) => {
    updateAuthSettings(checked);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <div className="grid gap-6">
        {/* Appearance */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Appearance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-primary/10 p-3">
                  {theme === 'dark' ? (
                    <Moon className="h-6 w-6 text-primary" />
                  ) : (
                    <Sun className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark mode
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={handleThemeChange}
              />
            </div>
          </div>
        </Card>

        {/* Notifications */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Notifications</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Bell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for important updates
                  </p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </Card>

        {/* Security */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Security</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Additional Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Require additional authentication for new devices
                  </p>
                </div>
              </div>
              <Switch
                checked={user?.requiresAdditionalAuth}
                onCheckedChange={handleAuthSettingChange}
              />
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive p-6">
          <h2 className="text-xl font-semibold text-destructive mb-4">Danger Zone</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete Account</p>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button variant="destructive">Delete Account</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
} 