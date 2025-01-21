/**
 * useFirstLogin Hook
 * 
 * A custom React hook that tracks whether a user is logging in for the first time.
 * This is useful for showing onboarding flows, welcome messages, or initial setup screens.
 * The state persists across page refreshes using localStorage.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';

/**
 * Returns a tuple containing the first login state and a function to update it.
 * The state is initially read from localStorage and can be updated, which also updates localStorage.
 * 
 * @returns [boolean, (value: boolean) => void] First login state and setter function
 * 
 * @example
 * const [isFirstLogin, setIsFirstLogin] = useFirstLogin();
 * if (isFirstLogin) {
 *   // Show onboarding flow
 *   setIsFirstLogin(false); // Mark onboarding as complete
 * }
 */
export function useFirstLogin(): [boolean, (value: boolean) => void] {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFirstLogin, setIsFirstLoginState] = useState<boolean>(() => {
    const stored = localStorage.getItem('squadron:firstLogin');
    return stored === null ? true : JSON.parse(stored);
  });

  const setIsFirstLogin = (value: boolean) => {
    setIsFirstLoginState(value);
    localStorage.setItem('squadron:firstLogin', JSON.stringify(value));
  };

  useEffect(() => {
    if (user && !localStorage.getItem('onboarding_completed')) {
      navigate('/onboarding');
    }
  }, [user, navigate]);

  return [isFirstLogin, setIsFirstLogin];
} 