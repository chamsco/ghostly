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
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
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
    formState: { errors },
    setError,
    watch
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
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
      // Only send the fields that the backend expects
      const { email, password, username, fullName } = data;
      await registerUser({ email, password, username, fullName });
      toast({
        title: "Success!",
        description: "Your account has been created successfully.",
      });
      navigate("/login");
    } catch (error: any) { // Type assertion for error
      if (error?.response?.status === 409) {
        const errorData = error.response?.data;
        if (errorData?.type === 'email') {
          setError('email', {
            type: 'manual',
            message: errorData.message
          });
        } else if (errorData?.type === 'username') {
          setError('username', {
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

      <div className="space-y-2">
        <Input
          type="password"
          placeholder="••••••••"
          {...register('confirmPassword')}
          disabled={isLoading}
          className="h-11"
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-start space-x-2">
          <Checkbox
            id="acceptTerms"
            checked={watch('acceptTerms')}
            onCheckedChange={(checked) => {
              const value = checked === true;
              const event = {
                target: {
                  name: 'acceptTerms',
                  value: value
                }
              };
              register('acceptTerms').onChange(event);
            }}
            disabled={isLoading}
            aria-describedby="terms-description"
          />
          <div className="grid gap-1.5 leading-none">
            <label
              htmlFor="acceptTerms"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Accept terms and conditions
            </label>
            <p id="terms-description" className="text-xs text-muted-foreground">
              By creating an account, you agree to our{' '}
              <a href="/terms" className="text-primary hover:underline">Terms of Service</a>
              {' '}and{' '}
              <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a>
            </p>
          </div>
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