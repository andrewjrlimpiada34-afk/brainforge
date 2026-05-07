"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

type BrainforgeLoadingScreenProps = {
  /** Controls visibility. When true, loader overlays the viewport. */
  isLoading: boolean;
  /** Optional percent display (0-100). If omitted, simulated. */
  initialProgress?: number;
  /** Optional title override. */
  title?: string;
  /** Optional subtitle override. */
  subtitle?: string;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function BrainIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 128 128"
      role="img"
      aria-label="BrainForge"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bfg" x1="0" y1="0" x2="128" y2="128" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" />
          <stop offset="0.55" stopColor="#7C3AED" />
          <stop offset="1" stopColor="#60A5FA" />
        </linearGradient>
      </defs>
      <path
        d="M63.6 17.6c-18.3 0-33.2 13.9-33.2 31.1 0 7.1 2.4 13.7 6.4 18.9-2.7 3.3-4.3 7.4-4.3 11.9 0 9.8 8 17.8 17.9 17.8 2.7 0 5.3-.6 7.6-1.7 3.3 4.2 8.4 6.9 14.1 6.9 9.9 0 18-8 18-18 0-3-.8-5.9-2.1-8.4 6.8-5.7 11.1-14.2 11.1-23.6 0-17.2-14.9-31.1-33.5-31.1Z"
        stroke="url(#bfg)"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M46 47c-5 4-5 12 0 16"
        stroke="url(#bfg)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M70 40c-5 4-5 12 0 16"
        stroke="url(#bfg)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M66 74c-6 2-12-2-13-8"
        stroke="url(#bfg)"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <path
        d="M49 86c2 6 10 9 16 5"
        stroke="url(#bfg)"
        strokeWidth="4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Particles() {
  const particles = useMemo(() => {
    // Deterministic-ish layout for stable hydration (still visual only).
    const arr = Array.from({ length: 18 }).map((_, i) => {
      const x = (i * 47) % 100; // 0..99
      const delay = (i % 9) * 0.22;
      const dur = 3.2 + (i % 5) * 0.6;
      const size = 3 + (i % 4);
      return { x, delay, dur, size };
    });
    return arr;
  }, []);

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p, idx) => (
        <motion.span
          key={idx}
          className="absolute rounded-full bg-white/80"
          style={{ left: `${p.x}%`, width: p.size, height: p.size, top: '0%' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: [0, 0.8, 0], y: ['-20%', '120%'] }}
          transition={{
            delay: p.delay,
            duration: p.dur,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* subtle diagonal scan lines */}
      <div className="absolute inset-0 opacity-[0.10] bg-[linear-gradient(to_right,transparent_0%,rgba(124,58,237,0.55)_20%,transparent_40%,transparent_60%,rgba(34,211,238,0.55)_80%,transparent_100%)] [background-size:200%_100%] animate-[bf-scan_2.4s_linear_infinite]" />
    </div>
  );
}

export function BrainforgeLoadingScreen({
  isLoading,
  initialProgress = 12,
  title = 'Howdy, Mate',

  subtitle = 'Forging Your Mind... ',

}: BrainforgeLoadingScreenProps) {
  const [progress, setProgress] = useState(clamp(initialProgress, 0, 100));


  // While loading, keep progress moving (but don't fully complete until isLoading=false)
  useEffect(() => {
    if (!isLoading) return;
    setProgress((p) => clamp(Math.max(p, initialProgress), 0, 98));

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 1000;
      // Smooth ease: fast at start, slows down near 98.
      const target = 92 + 6 * (1 - Math.exp(-t / 2.4));
      setProgress((prev) => {
        const next = prev + (target - prev) * 0.08;
        return clamp(next, 0, 98);
      });
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [isLoading, initialProgress]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          key="bf-loader"
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#05060A]/80 backdrop-blur supports-[backdrop-filter]:bg-[#05060A]/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
        >
          <style jsx global>{`
            @keyframes bf-scan {
              0% { background-position: 0% 50%; }
              100% { background-position: 200% 50%; }
            }
          `}</style>

          <motion.div
            className="relative w-[min(560px,92vw)]"
            initial={{ scale: 0.98, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.98, y: -6, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="glass-card rounded-[2rem] p-7 md:p-10 border border-white/10 overflow-hidden glow-primary">
              <Particles />

              <div className="relative z-10 flex flex-col items-center text-center gap-5">
                <motion.div
                  className="relative"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                >
                  {/* Pulsing neon rings */}
                  <motion.div
                    className="absolute -inset-6 rounded-full border border-primary/30"
                    animate={{
                      scale: [0.95, 1.12, 0.98],
                      opacity: [0.55, 0.95, 0.65],
                    }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  <motion.div
                    className="absolute -inset-2 rounded-full border border-accent/25"
                    animate={{
                      scale: [0.9, 1.08, 1.0],
                      opacity: [0.45, 0.85, 0.55],
                    }}
                    transition={{ duration: 1.35, repeat: Infinity, ease: 'easeInOut' }}
                  />

                  <div className="w-24 h-24 md:w-28 md:h-28">
                    <motion.div
                      animate={{
                        filter: ['drop-shadow(0px 0px 0px rgba(124,58,237,0))', 'drop-shadow(0px 0px 22px rgba(124,58,237,0.35))'],
                      }}
                      transition={{ duration: 1.2, repeat: Infinity, repeatType: 'reverse' }}
                    >
                      <BrainIcon className="w-full h-full" />
                    </motion.div>
                  </div>
                </motion.div>

                <div className="space-y-1">
                  <motion.h2
                    className="text-xl md:text-2xl font-headline font-bold tracking-tight"
                    initial={{ y: 6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  >
                    {title}
                  </motion.h2>
                  <p className="text-sm md:text-base text-muted-foreground">
                    Register / Login / Signup • Continue with Google
                  </p>

                </div>

                <div className="w-full space-y-3 mt-2">
                  <div className="flex items-center justify-between text-[11px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    <span>Neural Sync</span>
                    <span className="text-primary">{Math.round(progress)}%</span>
                  </div>

                  <div className="relative h-2.5 md:h-3 rounded-full bg-white/5 overflow-hidden border border-white/10">
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-[linear-gradient(90deg,rgba(34,211,238,0.8),rgba(124,58,237,0.9),rgba(96,165,250,0.9))]"
                      style={{ width: `${progress}%` }}
                      initial={false}
                      transition={{ type: 'spring', stiffness: 120, damping: 18 }}
                    />
                    <motion.div
                      className="absolute inset-0"
                      initial={{ x: '-40%' }}
                      animate={{ x: '120%' }}
                      transition={{
                        duration: 1.6,
                        repeat: Infinity,
                        ease: 'linear',
                      }}
                      style={{
                        background:
                          'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 40%, rgba(255,255,255,0.0) 80%)',
                        opacity: 0.55,
                      }}
                    />
                  </div>

                  {/* Micro status strip */}
                  <div className="flex items-center justify-center gap-3 pt-1">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="w-2 h-2 rounded-full bg-accent/80" />
                    <span className="w-2 h-2 rounded-full bg-white/30" />
                    <span className="sr-only">Loading</span>
                  </div>
                </div>
              </div>
            </div>

            {/* subtle bottom fade */}
            <motion.div
              className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 w-[90%] h-20 bg-gradient-to-t from-[#05060A] to-transparent opacity-60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

