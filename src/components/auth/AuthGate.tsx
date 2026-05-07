"use client"

import { type ReactNode, useEffect, useMemo } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useUser } from '@/firebase';

const PUBLIC_PATHS = ['/login', '/register'];
const VERIFICATION_PATH = '/verify-email';

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, isUserLoading } = useUser();
  const pathname = usePathname();
  const router = useRouter();

  const isPublicPath = useMemo(() => {
    return PUBLIC_PATHS.includes(pathname);
  }, [pathname]);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user && !isPublicPath && pathname !== VERIFICATION_PATH) {
      router.replace('/login');
      return;
    }

    if (user && !user.emailVerified && pathname !== VERIFICATION_PATH) {
      router.replace(VERIFICATION_PATH);
      return;
    }

    if (user && user.emailVerified && (isPublicPath || pathname === VERIFICATION_PATH)) {
      router.replace('/');
    }
  }, [isPublicPath, isUserLoading, pathname, router, user]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground">
          Synchronizing session...
        </p>
      </div>
    );
  }

  if (!user && !isPublicPath && pathname !== VERIFICATION_PATH) {
    return null;
  }

  if (user && !user.emailVerified && pathname !== VERIFICATION_PATH) {
    return null;
  }

  if (user && user.emailVerified && (isPublicPath || pathname === VERIFICATION_PATH)) {
    return null;
  }

  return <>{children}</>;
}
