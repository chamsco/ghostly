import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Step {
  title: string;
  description: string;
  action?: () => Promise<void>;
  actionLabel?: string;
}

const steps: Step[] = [
  {
    title: 'Welcome to Hostking',
    description: 'Let\'s get you set up with your development environment.',
  },
  {
    title: 'Two-Factor Authentication',
    description: 'Secure your account with 2FA for enhanced security.',
    action: async () => {
      // Navigate to 2FA setup
      window.location.href = '/security/2fa';
    },
    actionLabel: 'Set up 2FA',
  },
  {
    title: 'Create Your First Project',
    description: 'Start by creating a new project to manage your services.',
    action: async () => {
      // Navigate to project creation
      window.location.href = '/projects/new';
    },
    actionLabel: 'Create Project',
  },
];

export function OnboardingFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = async () => {
    const step = steps[currentStep];
    if (step.action) {
      await step.action();
    } else if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      navigate('/dashboard');
    }
  };

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
              <CardTitle>{steps[currentStep].title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 dark:text-gray-400">
                {steps[currentStep].description}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(prev => prev - 1)}
                disabled={currentStep === 0}
              >
                Back
              </Button>
              <Button onClick={handleNext}>
                {steps[currentStep].actionLabel || 
                  (currentStep === steps.length - 1 ? 'Finish' : 'Next')}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
} 