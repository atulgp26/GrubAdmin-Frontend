'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const Home = () => {
  const router = useRouter();
  const { isAuthenticated, isInitialized, isLoading } = useAuth();

  useEffect(() => {
    if (!isInitialized || isLoading) return;

    if (isAuthenticated) {
      router.replace('/dashboard');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated, isInitialized, isLoading, router]);

  return null;
};

export default Home;
