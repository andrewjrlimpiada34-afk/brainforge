"use client";

import React from 'react';

export function Header({
  kicker,
  title,
}: {
  kicker?: string;
  title: string;
}) {
  return (
    <div className="space-y-2 text-center">
      {kicker ? (
        <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">{kicker}</p>
      ) : null}
      <h1 className="text-3xl md:text-4xl font-headline font-bold tracking-tight">{title}</h1>
    </div>
  );
}

