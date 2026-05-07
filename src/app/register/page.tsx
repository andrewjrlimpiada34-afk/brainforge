"use client"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/firebase';
import { authenticatedFetch } from '@/lib/client-api';
import { createUserWithEmailAndPassword, deleteUser, sendEmailVerification } from 'firebase/auth';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Brain } from 'lucide-react';
import Link from 'next/link';
import { toast } from '@/hooks/use-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      try {
        await authenticatedFetch(user, '/api/profile/init', {
          method: 'POST',
          body: JSON.stringify({
            fullName: name,
            username,
          }),
        });
      } catch (profileError) {
        await deleteUser(user);
        throw profileError;
      }

      await sendEmailVerification(user);

      toast({
        title: "Welcome Operative",
        description: "Your profile is live. Check your inbox to verify your email."
      });
      router.push('/verify-email');
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description: err.message,
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
          <CardTitle className="text-3xl font-headline font-bold">Initialize Profile</CardTitle>
          <p className="text-muted-foreground">Register your neural signature with BRAINFORGE.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" placeholder="neural_knight" value={username} onChange={(e) => setUsername(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="name@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Security Protocol (Password)</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <Button type="submit" className="w-full bg-primary font-bold mt-4" disabled={loading}>
              {loading ? 'Synchronizing...' : 'Register Neural Profile'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            Already have a profile? <Link href="/login" className="text-primary hover:underline">Connect Terminal</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
