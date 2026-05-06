"use client"

import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { PatternRecall } from '@/components/games/PatternRecall';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function GamePlayerPage() {
  const params = useParams();
  const id = params.id as string;

  const renderGame = () => {
    switch(id) {
      case 'memory-pattern':
        return <PatternRecall />;
      default:
        return (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold">Game Under Construction</h2>
            <p className="text-muted-foreground mt-2">The AI is currently calibrating this neural module.</p>
            <Button asChild className="mt-8 bg-primary">
              <Link href="/games">Back to Library</Link>
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8">
          <ChevronLeft size={16} /> Exit Module
        </Link>
        {renderGame()}
      </div>
    </div>
  );
}
