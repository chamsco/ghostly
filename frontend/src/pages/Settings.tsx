import { useAuth } from '@/contexts/auth.context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { Moon, Sun, Shield, AlertTriangle } from 'lucide-react';

export default function Settings() {
  const { user, updateAuthSettings, updatePassword } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleThemeChange = (checked: boolean) => {
    setIsDarkMode(checked);
    // Implement theme change logic here
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) return;

    setIsLoading(true);
    try {
      await updatePassword(oldPassword, newPassword);
      setOldPassword("");
      setNewPassword("");
    } catch (error) {
      console.error("Failed to update password:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSettingChange = async (checked: boolean) => {
    try {
      await updateAuthSettings(checked);
    } catch (error) {
      console.error("Failed to update auth settings:", error);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {/* Appearance */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Appearance</h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sun className="h-4 w-4" />
            <Label htmlFor="theme-toggle">Dark Mode</Label>
            <Moon className="h-4 w-4" />
          </div>
          <Switch
            id="theme-toggle"
            checked={isDarkMode}
            onCheckedChange={handleThemeChange}
          />
        </div>
      </Card>

      {/* Security Settings */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Security Settings</h2>
        
        {/* Password Change */}
        <form onSubmit={handlePasswordUpdate} className="space-y-4 mb-6">
          <div className="space-y-2">
            <Label htmlFor="old-password">Current Password</Label>
            <Input
              id="old-password"
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          <Button type="submit" disabled={isLoading || !oldPassword || !newPassword}>
            {isLoading ? "Updating..." : "Update Password"}
          </Button>
        </form>

        {/* Additional Authentication */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="space-y-0.5">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <Label>Require Additional Authentication</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Enable this for enhanced security on sensitive operations
            </p>
          </div>
          <Switch
            checked={user?.requiresAdditionalAuth}
            onCheckedChange={handleAuthSettingChange}
          />
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <Button variant="destructive">Delete Account</Button>
      </Card>
    </div>
  );
} 