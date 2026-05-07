"use client"

import { type ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { useAppState } from '@/components/providers/StateProvider';

const ALLOWED_UNREGISTERED_PATHS = ['/verify-email'];

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

    // If the user is not registered, we *still* allow rendering the current route.
    // The only automatic redirect here is to the verification page.
    // (Prevents unexpected redirects on first load for logged-out users.)
    if (!isRegistered && !isAllowedPath) {
      return;
    }

    // If a fully-registered user somehow lands on /complete-profile, send them home.
    if (isRegistered && pathname === '/complete-profile') {
      router.replace('/');
    }
  }, [hasCheckedProfile, isRegistered, isUserLoading, pathname, router, user, isLoading]);

  if (isUserLoading || isLoading) {
    return null;
  }

  if (user && !isRegistered && !ALLOWED_UNREGISTERED_PATHS.includes(pathname)) {
    // Don't block/redirect; let the page decide (e.g. /complete-profile itself).
    return <>{children}</>;
  }

  if (user && isRegistered && pathname === '/complete-profile') {
    return null;
  }

  return <>{children}</>;
}
