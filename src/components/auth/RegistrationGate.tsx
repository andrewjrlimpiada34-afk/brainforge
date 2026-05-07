"use client"

import { type ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useAppState } from '@/components/providers/StateProvider';

const ALLOWED_UNREGISTERED_PATHS = ['/complete-profile', '/verify-email'];

export function RegistrationGate({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const { isRegistered, isLoading } = useAppState();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading || isLoading) return;
    if (!user) return;

    const isAllowedPath = ALLOWED_UNREGISTERED_PATHS.includes(pathname);

    if (!isRegistered && !isAllowedPath) {
      router.replace('/complete-profile');
      return;
    }

    if (isRegistered && pathname === '/complete-profile') {
      router.replace('/');
    }
  }, [isLoading, isRegistered, isUserLoading, pathname, router, user]);

  if (isUserLoading || isLoading) {
    return null;
  }

  if (user && !isRegistered && !ALLOWED_UNREGISTERED_PATHS.includes(pathname)) {
    return null;
  }

  if (user && isRegistered && pathname === '/complete-profile') {
    return null;
  }

  return <>{children}</>;
}
