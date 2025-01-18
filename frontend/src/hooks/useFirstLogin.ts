import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth.context';

export function useFirstLogin() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !localStorage.getItem('onboarding_completed')) {
      navigate('/onboarding');
    }
  }, [user, navigate]);
} 