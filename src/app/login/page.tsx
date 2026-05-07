"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Brain } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);

      if (!userCredential.user.emailVerified) {
        toast({
          title: "Verification Required",
          description: "Verify your email before accessing BRAINFORGE.",
        });
        router.push('/verify-email');
        return;
      }

      toast({ title: "Access Granted", description: "Neural session re-established." });
      router.push('/');
    } catch (err: any) {
      toast({ variant: "destructive", title: "Access Denied", description: err.message });
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
          <CardTitle className="text-3xl font-headline font-bold">Terminal Login</CardTitle>
          <p className="text-muted-foreground">Reconnect to the neural network.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-primary font-bold mt-4" disabled={loading}>
              {loading ? 'Connecting...' : 'Synchronize'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            New operative? <Link href="/register" className="text-primary hover:underline">Register Signature</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
