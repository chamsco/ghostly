/**
 * Login Form Component
 * 
 * A form component that handles user authentication with:
 * - Email/password login
 * - Remember me functionality
 * - Error handling and validation
 * - Loading states
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/auth.context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/components/ui/use-toast';
import { Link } from 'react-router-dom';

/**
 * Login form validation schema
 */
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().default(false)
});

type LoginFormData = z.infer<typeof loginSchema>;

/**
 * LoginForm component handles user authentication
 * 
 * @returns JSX.Element The login form component
 */
export function LoginForm() {
  // State and hooks
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * Form configuration with validation
   */
  const {
    register,
    handleSubmit,
    formState: { errors },
    setError: setFormError
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false
    }
  });

  /**
   * Handles form submission
   * Attempts to log in the user and redirects on success
   */
  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      await login(data);
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      navigate("/dashboard");
    } catch (error: any) { // Type assertion for error
      if (error?.response?.status === 401) {
        const errorData = error.response?.data;
        if (errorData?.type === 'username') {
          setFormError('username', {
            type: 'manual',
            message: errorData.message
          });
        } else if (errorData?.type === 'password') {
          setFormError('password', {
            type: 'manual',
            message: errorData.message
          });
        }
      } else {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Username"
          {...register('username')}
          disabled={isLoading}
          className="h-11"
        />
        {errors.username && (
          <p className="text-xs text-destructive">{errors.username.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <div className="relative">
          <Input
            type="password"
            placeholder="••••••••"
            {...register('password')}
            disabled={isLoading}
            className="h-11"
          />
          <Link
            to="/forgot-password"
            className="absolute right-0 top-0 h-11 px-3 flex items-center text-xs text-primary hover:underline"
          >
            Forgot Password?
          </Link>
        </div>
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="rememberMe"
          {...register('rememberMe')}
          disabled={isLoading}
        />
        <label
          htmlFor="rememberMe"
          className="text-xs text-muted-foreground cursor-pointer"
        >
          Remember me
        </label>
      </div>

      <Button 
        type="submit" 
        className="w-full h-11" 
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
} 