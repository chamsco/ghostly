import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/contexts/auth.context';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifying2FA, setIsVerifying2FA] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post('/auth/login', data);
      
      if (response.data.requiresTwoFactor) {
        setIsVerifying2FA(true);
        toast({
          title: '2FA Required',
          description: 'Please enter your 2FA code to continue.',
        });
      } else {
        await login(response.data);
        navigate('/');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid username or password',
        variant: 'destructive',
      });
    }
  };

  const verify2FA = async (data: { token: string }) => {
    try {
      const response = await api.post('/auth/2fa/verify', data);
      await login(response.data);
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid 2FA code',
        variant: 'destructive',
      });
    }
  };

  if (isVerifying2FA) {
    const {
      register: register2FA,
      handleSubmit: handleSubmit2FA,
      formState: { errors: errors2FA, isSubmitting: isSubmitting2FA },
    } = useForm<{ token: string }>({
      resolver: zodResolver(z.object({ token: z.string().min(6, '2FA code is required') })),
    });

    return (
      <form onSubmit={handleSubmit2FA(verify2FA)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="token">2FA Code</Label>
          <Input
            id="token"
            {...register2FA('token')}
            type="text"
            placeholder="Enter your 2FA code"
          />
          {errors2FA.token && (
            <p className="text-sm text-red-500">{errors2FA.token.message}</p>
          )}
        </div>
        <Button type="submit" disabled={isSubmitting2FA}>
          Verify
        </Button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          {...register('username')}
          type="text"
          placeholder="Enter your username"
        />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          {...register('password')}
          type="password"
          placeholder="Enter your password"
        />
        {errors.password && (
          <p className="text-sm text-red-500">{errors.password.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        Login
      </Button>
    </form>
  );
} 