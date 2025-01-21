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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Validation schema for 2FA verification code
 */
const verifySchema = z.object({
  code: z.string().length(6, 'Verification code must be 6 digits')
});

type VerifyFormData = z.infer<typeof verifySchema>;

/**
 * TwoFactorSetup component handles 2FA configuration
 * 
 * @returns JSX.Element The 2FA setup component
 */
export function TwoFactorSetup() {
  // State and hooks
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const { setup2FA, verify2FA, disable2FA, is2FAEnabled } = useAuth();
  const { toast } = useToast();

  /**
   * Form configuration with validation
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema)
  });

  /**
   * Initiates 2FA setup process
   * Generates QR code and secret key
   */
  const handleSetup = async () => {
    try {
      setIsLoading(true);
      const { qrCode, secret } = await setup2FA();
      setQrCode(qrCode);
      setSecret(secret);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: '2FA Setup Failed',
        description: error.message || 'Failed to initialize 2FA setup'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles verification code submission
   * Completes 2FA setup if code is valid
   */
  const onSubmit = async (data: VerifyFormData) => {
    try {
      setIsLoading(true);
      const { backupCodes } = await verify2FA(data.code);
      setBackupCodes(backupCodes);
      
      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been enabled for your account'
      });
      
      reset();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Verification Failed',
        description: error.message || 'Invalid verification code'
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles 2FA disabling
   */
  const handleDisable = async () => {
    try {
      setIsLoading(true);
      await disable2FA();
      
      setQrCode(null);
      setSecret(null);
      setBackupCodes(null);
      
      toast({
        title: '2FA Disabled',
        description: 'Two-factor authentication has been disabled for your account'
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to disable 2FA'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Show backup codes if 2FA was just enabled
  if (backupCodes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Save Your Backup Codes</CardTitle>
          <CardDescription>
            Store these codes in a safe place. You can use them to access your account if you lose your authenticator device.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {backupCodes.map((code, index) => (
              <code key={index} className="p-2 bg-muted rounded">
                {code}
              </code>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => setBackupCodes(null)}
            className="w-full"
          >
            I've Saved These Codes
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // Show setup form if 2FA is not enabled
  if (!is2FAEnabled) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Enable Two-Factor Authentication</CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by requiring a verification code in addition to your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {qrCode ? (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={qrCode}
                  alt="QR Code for 2FA setup"
                  className="w-48 h-48"
                />
              </div>
              {secret && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    If you can't scan the QR code, enter this code manually:
                  </p>
                  <code className="p-2 bg-muted rounded">
                    {secret}
                  </code>
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter 6-digit code"
                    {...register('code')}
                    disabled={isLoading}
                  />
                  {errors.code && (
                    <p className="text-sm text-destructive">{errors.code.message}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Verifying...' : 'Verify & Enable 2FA'}
                </Button>
              </form>
            </div>
          ) : (
            <Button
              onClick={handleSetup}
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : 'Begin Setup'}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // Show disable option if 2FA is enabled
  return (
    <Card>
      <CardHeader>
        <CardTitle>Two-Factor Authentication Enabled</CardTitle>
        <CardDescription>
          Your account is currently protected with two-factor authentication.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button
          variant="destructive"
          onClick={handleDisable}
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Disabling...' : 'Disable 2FA'}
        </Button>
      </CardContent>
    </Card>
  );
} 