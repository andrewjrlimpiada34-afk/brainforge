"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { BrainforgeLoadingScreen } from '@/components/layout/BrainforgeLoadingScreen';
import { useUser } from '@/firebase';
import { useAppState } from '@/components/providers/StateProvider';

/**
 * Global app loader to prevent blank screens during auth/profile loading and route transitions.
 */
export function GlobalLoadingProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isUserLoading } = useUser();
  const { isLoading: isProfileLoading } = useAppState();

  const [routeTransitioning, setRouteTransitioning] = useState(false);
  const [didMount, setDidMount] = useState(false);
  const lastPathRef = useRef<string | null>(null);

  useEffect(() => {
    setDidMount(true);
    lastPathRef.current = pathname;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!didMount) return;

    // When pathname changes, show loader briefly until React commits the new UI.
    // This also covers slow data fetching inside the next route.
    setRouteTransitioning(true);

    const t = window.setTimeout(() => {
      setRouteTransitioning(false);
    }, 650);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Also toggle loader when auth/profile are loading.
  const isLoading = useMemo(() => {
    return Boolean(isUserLoading || isProfileLoading || routeTransitioning);
  }, [isUserLoading, isProfileLoading, routeTransitioning]);

  // Improve UX: when loader is active, block scroll.
  useEffect(() => {
    if (!isLoading) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isLoading]);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <BrainforgeLoadingScreen
            isLoading={true}
            initialProgress={Math.max(8, isProfileLoading ? 45 : 18)}
            subtitle={user ? 'Forging Your Mind...' : 'Calibrating Access...'}
          />
        )}
      </AnimatePresence>
      <div aria-busy={isLoading ? 'true' : 'false'}>{children}</div>
    </>
  );
}

