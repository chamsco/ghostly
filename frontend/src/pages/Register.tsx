/**
 * Register Page
 * 
 * Displays the registration interface with:
 * - OAuth options (GitHub)
 * - SSO registration option
 * - Email/password registration form
 * - Link to login page
 */

import { RegisterForm } from '@/features/auth/components/RegisterForm';
import { Link } from 'react-router-dom';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export function Register() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Get started with Squadron
          </p>
        </div>

        {/* OAuth and SSO Options */}
        <div className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-2"
          >
            <Github className="h-4 w-4" />
            Continue with GitHub
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
          >
            Continue with SSO
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                or
              </span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <Card className="p-6">
          <RegisterForm />
        </Card>

        {/* Footer Links */}
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link 
            to="/login" 
            className="font-medium text-primary hover:underline"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
} 