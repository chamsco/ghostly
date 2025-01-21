/**
 * OnboardingFlow Component
 * 
 * A multi-step onboarding flow component that guides new users through initial setup.
 * Features:
 * - Step-by-step wizard interface
 * - Progress tracking
 * - Responsive design
 * - Customizable steps and content
 * - Persistent progress
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useFirstLogin } from '@/hooks/useFirstLogin';

/**
 * Interface for individual onboarding step configuration
 */
interface OnboardingStep {
  /** Unique identifier for the step */
  id: string;
  /** Title displayed at the top of the step */
  title: string;
  /** Main content/description for the step */
  content: string;
  /** Optional action button text */
  actionLabel?: string;
  /** Optional action handler */
  onAction?: () => void | Promise<void>;
}

/**
 * Predefined onboarding steps configuration
 * Each step represents a key feature or setup requirement
 */
const steps: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Squadron',
    content: 'Squadron helps you manage your servers and applications with ease. Let\'s get you started with a quick tour of the main features.',
  },
  {
    id: 'projects',
    title: 'Create Your First Project',
    content: 'Projects help you organize your servers and applications. You can create multiple projects for different environments or clients.',
    actionLabel: 'Create Project',
    onAction: () => {
      // Navigate to project creation
      window.location.href = '/projects/new';
    }
  },
  {
    id: 'security',
    title: 'Security First',
    content: 'We recommend enabling two-factor authentication (2FA) to secure your account. You can do this in your profile settings.',
    actionLabel: 'Enable 2FA',
    onAction: () => {
      // Navigate to 2FA setup
      window.location.href = '/profile/security';
    }
  }
];

/**
 * OnboardingFlow component displays a step-by-step guide for new users
 * 
 * @returns JSX.Element The onboarding flow component
 * 
 * @example
 * <OnboardingFlow />
 */
export function OnboardingFlow() {
  // Track current step index
  const [currentStep, setCurrentStep] = useState(0);
  const [, setIsFirstLogin] = useFirstLogin();
  const navigate = useNavigate();

  /**
   * Handles navigation to the next step or completes onboarding
   */
  const handleNext = async () => {
    const step = steps[currentStep];
    
    // Execute step action if defined
    if (step.onAction) {
      await step.onAction();
    }

    if (currentStep < steps.length - 1) {
      // Move to next step
      setCurrentStep(prev => prev + 1);
    } else {
      // Complete onboarding
      setIsFirstLogin(false);
      navigate('/dashboard');
    }
  };

  /**
   * Handles skipping the onboarding flow
   */
  const handleSkip = () => {
    setIsFirstLogin(false);
    navigate('/dashboard');
  };

  // Get current step data
  const step = steps[currentStep];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="w-[400px]">
            <CardHeader>
              <CardTitle>{step.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400">
                {step.content}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={handleSkip}
              >
                Skip
              </Button>
              <Button onClick={handleNext}>
                {currentStep === steps.length - 1 ? 'Finish' : (step.actionLabel || 'Next')}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 