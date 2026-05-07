"use client"

import { type ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useAppState } from '@/components/providers/StateProvider';

const ALLOWED_UNREGISTERED_PATHS = ['/complete-profile', '/verify-email'];

export function RegistrationGate({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const { isRegistered, isLoading, hasCheckedProfile } = useAppState();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (isUserLoading) return;
    if (!user) return;

    // Only redirect after the initial profile fetch has completed.
    if (!hasCheckedProfile) return;

    const isAllowedPath = ALLOWED_UNREGISTERED_PATHS.includes(pathname);

    if (!isRegistered && !isAllowedPath) {
      router.replace('/complete-profile');
      return;
    }

    if (isRegistered && pathname === '/complete-profile') {
      router.replace('/');
    }
  }, [hasCheckedProfile, isRegistered, isUserLoading, pathname, router, user, isLoading]);

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
