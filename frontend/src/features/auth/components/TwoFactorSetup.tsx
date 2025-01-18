import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import type { TwoFactorResponse } from '@/types/auth';

const tokenSchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits'),
});

export function TwoFactorSetup() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [secret, setSecret] = useState<TwoFactorResponse>();

  const { register, handleSubmit } = useForm({
    resolver: zodResolver(tokenSchema),
  });

  const { refetch: generateSecret } = useQuery({
    queryKey: ['2fa-secret'],
    queryFn: () => api.post<TwoFactorResponse>('/auth/2fa/generate'),
    enabled: false,
    onSuccess: (response) => {
      setSecret(response.data);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to generate 2FA secret',
        description: error.response?.data?.message || 'Something went wrong',
        variant: 'destructive',
      });
    },
  });

  const enable2FAMutation = useMutation({
    mutationFn: (token: string) => 
      api.post('/auth/2fa/enable', { token }),
    onSuccess: () => {
      toast({
        title: '2FA Enabled',
        description: 'Two-factor authentication has been enabled for your account',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to enable 2FA',
        description: error.response?.data?.message || 'Invalid code',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = async (data: { token: string }) => {
    setIsLoading(true);
    try {
      await enable2FAMutation.mutateAsync(data.token);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {!secret ? (
        <Button onClick={() => generateSecret()} disabled={isLoading}>
          Setup Two-Factor Authentication
        </Button>
      ) : (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Scan QR Code</Label>
            <div className="flex justify-center">
              <img src={secret.qrCode} alt="2FA QR Code" />
            </div>
            <p className="text-sm text-gray-500">
              Scan this QR code with your authenticator app
            </p>
          </div>

          <div className="space-y-2">
            <Label>Manual Entry Code</Label>
            <Input
              value={secret.secret}
              readOnly
              onClick={(e) => e.currentTarget.select()}
            />
            <p className="text-sm text-gray-500">
              If you can't scan the QR code, enter this code manually
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="token">Verification Code</Label>
              <Input
                id="token"
                {...register('token')}
                placeholder="Enter 6-digit code"
                disabled={isLoading}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Enabling 2FA...' : 'Enable 2FA'}
            </Button>
          </form>
        </div>
      )}
    </div>
  );
} 