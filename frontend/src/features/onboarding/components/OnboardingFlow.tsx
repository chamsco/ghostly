/**
 * Onboarding Flow Component
 * 
 * A multi-step onboarding process with:
 * - 4 slides of content
 * - Next/Previous navigation
 * - Skip option
 * - Progress indicator
 * - Completion button
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const TOTAL_SLIDES = 4;

const slides = [
  {
    title: 'Welcome to Squadron',
    content: 'Your new project management experience begins here. Let\'s get you set up in just a few steps.'
  },
  {
    title: 'Create Your First Project',
    content: 'Start by creating a project. You can add team members, set milestones, and track progress all in one place.'
  },
  {
    title: 'Invite Your Team',
    content: 'Collaboration is key. Invite your team members to join your projects and work together seamlessly.'
  },
  {
    title: 'Ready to Launch',
    content: 'You\'re all set! Start managing your projects with Squadron\'s powerful tools and features.'
  }
];

export function OnboardingFlow() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (currentSlide < TOTAL_SLIDES - 1) {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  const handleComplete = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            {slides[currentSlide].title}
          </CardTitle>
          <div className="flex gap-1 mt-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  index <= currentSlide ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </CardHeader>
        <CardContent className="min-h-[200px] flex items-center justify-center p-6">
          <p className="text-lg text-center text-muted-foreground">
            {slides[currentSlide].content}
          </p>
        </CardContent>
        <CardFooter className="flex justify-between border-t p-6">
          <div className="flex gap-2">
            {currentSlide > 0 && (
              <Button
                variant="outline"
                onClick={handlePrevious}
              >
                Previous
              </Button>
            )}
            {currentSlide < TOTAL_SLIDES - 1 && (
              <Button
                variant="ghost"
                onClick={handleSkip}
              >
                Skip
              </Button>
            )}
          </div>
          <div>
            {currentSlide < TOTAL_SLIDES - 1 ? (
              <Button onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button onClick={handleComplete}>
                Get Started
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
} 