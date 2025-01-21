import { useAuth } from '@/contexts/auth.context';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Key, Shield, Fingerprint } from 'lucide-react';

export function Profile() {
  const { user, enable2FA, disable2FA, setupBiometrics, disableBiometrics } = useAuth();

  const handleTwoFactorToggle = async () => {
    try {
      if (user?.twoFactorEnabled) {
        await disable2FA();
      } else {
        await enable2FA();
      }
    } catch (error) {
      console.error('Failed to toggle 2FA:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Profile Settings</h1>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="rounded-full bg-primary/10 p-3">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{user?.fullName}</p>
                <p className="text-sm text-muted-foreground">@{user?.username}</p>
              </div>
              <Button variant="outline">Edit Profile</Button>
            </div>
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={user?.email} disabled />
              </div>
            </div>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Security Settings</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Key className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Change your account password
                  </p>
                </div>
              </div>
              <Button variant="outline">Change Password</Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={handleTwoFactorToggle}
              >
                {user?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Fingerprint className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Biometric Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Use your device's biometric features to sign in
                  </p>
                </div>
              </div>
              <Button 
                variant="outline"
                onClick={() => user?.isBiometricsEnabled ? disableBiometrics() : setupBiometrics()}
              >
                {user?.isBiometricsEnabled ? 'Disable Biometrics' : 'Enable Biometrics'}
              </Button>
            </div>
          </div>
        </Card>

        {/* Admin Settings */}
        {user?.isAdmin && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Administrative Settings</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-primary/10 p-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Admin Access</p>
                  <p className="text-sm text-muted-foreground">
                    You have administrative privileges
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
} 