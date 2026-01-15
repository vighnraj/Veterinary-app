import { useEffect } from 'react';
import { router } from 'expo-router';
import useAuthStore from '../src/store/authStore';
import { Loading } from '../src/components/common';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/auth/login');
      }
    }
  }, [isAuthenticated, isLoading]);

  return <Loading fullScreen message="Checking authentication..." />;
}
