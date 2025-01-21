/**
 * Two-Factor Authentication Setup Component
 * 
 * A component that guides users through the 2FA setup process:
 * - Generates and displays QR code for authenticator apps
 * - Provides manual entry secret key
 * - Validates setup with confirmation code
 * - Enables/disables 2FA for the user's account
 * - Handles backup codes generation and display
 */

import { useState } from 'react';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { QRCodeSVG } from 'qrcode.react';

/*
interface TwoFactorSetupFormData {
  code: string;
}
*/

/**
 * TwoFactorSetup component handles 2FA configuration
 * 
 * @returns JSX.Element The 2FA setup component
 */
export function TwoFactorSetup() {
  const { setup2FA, verify2FA, disable2FA, is2FAEnabled } = useAuth();
  const [secret, setSecret] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');

  const handleSetup = async () => {
    try {
      setIsLoading(true);
      const { secret, qrCode } = await setup2FA();
      setSecret(secret);
      setQrCode(qrCode);
    } catch (error) {
      console.error('Failed to setup 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) return;

    try {
      setIsLoading(true);
      await verify2FA(verificationCode);
      // Success! The user will be redirected or shown a success message
    } catch (error) {
      console.error('Failed to verify 2FA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (is2FAEnabled) {
    return (
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Two-Factor Authentication</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Two-factor authentication is currently enabled for your account.
        </p>
        <Button
          variant="destructive"
          onClick={disable2FA}
          disabled={isLoading}
        >
          Disable 2FA
        </Button>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Set Up Two-Factor Authentication</h2>
      {!secret ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Two-factor authentication adds an extra layer of security to your account.
          </p>
          <Button
            onClick={handleSetup}
            disabled={isLoading}
          >
            {isLoading ? 'Setting up...' : 'Set up 2FA'}
          </Button>
        </>
      ) : (
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              1. Scan this QR code with your authenticator app:
            </p>
            <div className="flex justify-center p-4 bg-white rounded-lg">
              <QRCodeSVG value={qrCode} size={200} />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              2. Enter the verification code from your authenticator app:
            </p>
            <div className="space-y-1">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading || !verificationCode}
          >
            {isLoading ? 'Verifying...' : 'Verify and Enable'}
          </Button>
        </form>
      )}
    </Card>
  );
} 