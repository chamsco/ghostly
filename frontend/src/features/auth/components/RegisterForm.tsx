/**
 * Register Form Component
 * 
 * A form component that handles new user registration with:
 * - Email/password validation
 * - Username and full name validation
 * - Password strength requirements
 * - Terms of service acceptance
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

/**
 * Password validation regex patterns
 */
const passwordPatterns = {
  hasUpperCase: /[A-Z]/,
  hasLowerCase: /[a-z]/,
  hasNumber: /[0-9]/,
  hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/
};

/**
 * Registration form validation schema
 */
const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(passwordPatterns.hasUpperCase, 'Password must contain at least one uppercase letter')
    .regex(passwordPatterns.hasLowerCase, 'Password must contain at least one lowercase letter')
    .regex(passwordPatterns.hasNumber, 'Password must contain at least one number')
    .regex(passwordPatterns.hasSpecialChar, 'Password must contain at least one special character'),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
});

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * RegisterForm component handles new user registration
 * 
 * @returns JSX.Element The registration form component
 */
export function RegisterForm() {
  // State and hooks
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  /**
   * Form configuration with validation
   */
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      acceptTerms: false
    }
  });

  /**
   * Handles form submission
   * Attempts to register the user and logs them in on success
   */
  const onSubmit = async (data: RegisterFormData) => {
    try {
      setIsLoading(true);
      await registerUser({
        fullName: data.fullName,
        username: data.username,
        email: data.email,
        password: data.password
      });
      
      toast({
        title: 'Registration successful',
        description: 'Welcome to Squadron! Please complete the onboarding process.'
      });

      // Add a small delay to show the success message
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      navigate('/onboarding');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="Full Name"
          {...register('fullName')}
          disabled={isLoading}
          className="h-11"
        />
        {errors.fullName && (
          <p className="text-xs text-destructive">{errors.fullName.message}</p>
        )}
      </div>

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
        <Input
          type="email"
          placeholder="you@example.com"
          {...register('email')}
          disabled={isLoading}
          className="h-11"
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Input
          type="password"
          placeholder="••••••••"
          {...register('password')}
          disabled={isLoading}
          className="h-11"
        />
        {errors.password && (
          <p className="text-xs text-destructive">{errors.password.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="acceptTerms"
            {...register('acceptTerms')}
            disabled={isLoading}
          />
          <label
            htmlFor="acceptTerms"
            className="text-xs text-muted-foreground leading-relaxed"
          >
            By creating an account, you agree to our{' '}
            <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
          </label>
        </div>
        {errors.acceptTerms && (
          <p className="text-xs text-destructive">{errors.acceptTerms.message}</p>
        )}
      </div>

      <Button 
        type="submit" 
        className="w-full h-11" 
        disabled={isLoading}
      >
        {isLoading ? 'Creating account...' : 'Create account'}
      </Button>
    </form>
  );
} 