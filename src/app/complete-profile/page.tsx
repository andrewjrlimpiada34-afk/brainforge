"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Brain } from 'lucide-react';
import { useUser } from '@/firebase';
import { authenticatedFetch } from '@/lib/client-api';
import { useAppState } from '@/components/providers/StateProvider';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

type ProfileInitResponse = {
  username: string;
  fullName: string;
  email: string;
  photoURL: string;
  level: number;
  xp: number;
  streak: number;
  gamesPlayed: number;
  unlockedGames: string[];
  stats: {
    memory: number;
    logic: number;
    speed: number;
    accuracy: number;
    math: number;
  };
};

export default function CompleteProfilePage() {
  const { user: authUser } = useUser();
  const { applyLocalProfile } = useAppState();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState(authUser?.email?.split('@')[0] || '');
  const [loading, setLoading] = useState(false);

  const handleCompleteProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!authUser) return;

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      toast({
        variant: "destructive",
        title: "Username Too Short",
        description: "Choose a username with at least 3 characters.",
      });
      return;
    }

    setLoading(true);
    try {
      const profile = await authenticatedFetch<ProfileInitResponse>(authUser, '/api/profile/init', {
        method: 'POST',
        body: JSON.stringify({
          fullName,
          username: trimmedUsername,
        }),
      });

      applyLocalProfile({
        fullName: profile.fullName,
        username: profile.username,
        photoURL: profile.photoURL,
      });

      toast({
        title: "Registration Complete",
        description: "Your player profile is now active.",
      });
      router.replace('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Incomplete",
        description: error.message || 'Unable to create your player profile.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="glass-card w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center glow-primary mx-auto">
            <Brain className="text-primary-foreground h-7 w-7" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold">Complete Registration</CardTitle>
          <p className="text-muted-foreground">Before you can play, we need to activate your player profile in BRAINFORGE.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCompleteProfile} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={(event) => setUsername(event.target.value)} placeholder="neural_knight" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Verified Email</Label>
              <Input id="email" value={authUser?.email || ''} disabled />
            </div>
            <Button type="submit" className="w-full bg-primary font-bold mt-4" disabled={loading}>
              {loading ? 'Activating...' : 'Activate Player Profile'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Your email is authenticated, but gameplay stays locked until this profile is created.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
