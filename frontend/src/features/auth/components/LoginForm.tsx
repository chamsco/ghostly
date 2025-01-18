import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import type { LoginData, AuthResponse } from '@/types/auth';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const twoFactorSchema = z.object({
  token: z.string().length(6, 'Token must be 6 digits'),
});

export function LoginForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);

  const { register: registerLogin, handleSubmit: handleLoginSubmit } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const { register: register2FA, handleSubmit: handle2FASubmit } = useForm({
    resolver: zodResolver(twoFactorSchema),
  });

  const loginMutation = useMutation({
    mutationFn: (data: LoginData) => 
      api.post<AuthResponse>('/auth/login', data),
    onSuccess: (response) => {
      if (response.data.requiresTwoFactor) {
        setRequires2FA(true);
        toast({
          title: '2FA Required',
          description: 'Please enter your 2FA code',
        });
      } else {
        toast({
          title: 'Login successful',
          description: 'Welcome back!',
        });
        if (!localStorage.getItem('onboarding_completed')) {
          navigate('/onboarding');
        } else {
          navigate('/dashboard');
        }
      }
    },
    onError: (error: any) => {
      toast({
        title: 'Login failed',
        description: error.response?.data?.message || 'Invalid credentials',
        variant: 'destructive',
      });
    },
  });

  const verify2FAMutation = useMutation({
    mutationFn: (token: string) => 
      api.post<AuthResponse>('/auth/2fa/verify', { token }),
    onSuccess: () => {
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
      navigate('/dashboard');
    },
    onError: (error: any) => {
      toast({
        title: 'Verification failed',
        description: error.response?.data?.message || 'Invalid code',
        variant: 'destructive',
      });
    },
  });

  const onLoginSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      await loginMutation.mutateAsync(data);
    } finally {
      setIsLoading(false);
    }
  };

  const on2FASubmit = async (data: { token: string }) => {
    setIsLoading(true);
    try {
      await verify2FAMutation.mutateAsync(data.token);
    } finally {
      setIsLoading(false);
    }
  };

  if (requires2FA) {
    return (
      <form onSubmit={handle2FASubmit(on2FASubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="token">2FA Code</Label>
          <Input
            id="token"
            {...register2FA('token')}
            placeholder="Enter 6-digit code"
            disabled={isLoading}
          />
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Verifying...' : 'Verify'}
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          {...registerLogin('username')}
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          {...registerLogin('password')}
          disabled={isLoading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
} 