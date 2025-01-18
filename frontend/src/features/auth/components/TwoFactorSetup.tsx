import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { api } from '@/lib/axios';

const tokenSchema = z.object({
  token: z.string().min(6, '2FA code must be at least 6 characters'),
});

type TokenFormData = z.infer<typeof tokenSchema>;

export function TwoFactorSetup() {
  const [qrCode, setQrCode] = useState<string>('');
  const [secret, setSecret] = useState<string>('');
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TokenFormData>({
    resolver: zodResolver(tokenSchema),
  });

  const generateSecret = async () => {
    try {
      const response = await api.post('/auth/2fa/generate');
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to generate 2FA secret',
        variant: 'destructive',
      });
    }
  };

  const onSubmit = async (data: TokenFormData) => {
    try {
      await api.post('/auth/2fa/enable', data);
      toast({
        title: 'Success',
        description: '2FA has been enabled for your account',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid 2FA code',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Two-Factor Authentication Setup</h2>
        <p className="text-sm text-muted-foreground">
          Enhance your account security by enabling two-factor authentication.
        </p>
      </div>

      {!qrCode && (
        <Button onClick={generateSecret}>Generate 2FA Secret</Button>
      )}

      {qrCode && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Scan QR Code</Label>
            <div
              className="qr-code"
              dangerouslySetInnerHTML={{ __html: qrCode }}
            />
          </div>

          <div className="space-y-2">
            <Label>Manual Entry Code</Label>
            <p className="text-sm font-mono bg-muted p-2 rounded">{secret}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Verification Code</Label>
              <Input
                id="token"
                {...register('token')}
                type="text"
                placeholder="Enter the 6-digit code"
              />
              {errors.token && (
                <p className="text-sm text-red-500">{errors.token.message}</p>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting}>
              Enable 2FA
            </Button>
          </form>
        </div>
      )}
    </div>
  );
} 