"use client"

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { sendEmailVerification, signOut } from 'firebase/auth';
import { Brain, MailCheck, RefreshCw, LogOut } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

export default function VerifyEmailPage() {
  const auth = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const email = user?.email ?? 'your inbox';

  const handleRefreshStatus = async () => {
    if (!user) {
      router.replace('/login');
      return;
    }

    setIsRefreshing(true);
    try {
      await user.reload();

      if (auth.currentUser?.emailVerified) {
        toast({ title: "Verification Complete", description: "Access to BRAINFORGE is now unlocked." });
        router.replace('/');
        return;
      }

      toast({
        title: "Still Waiting",
        description: "Your email is not verified yet. Finish the inbox step, then try again.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Refresh Failed",
        description: err.message,
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleResendEmail = async () => {
    if (!user) {
      router.replace('/login');
      return;
    }

    setIsResending(true);
    try {
      await sendEmailVerification(user);
      toast({ title: "Verification Sent", description: `A new verification link was sent to ${email}.` });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Resend Failed",
        description: err.message,
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut(auth);
      router.replace('/login');
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Sign Out Failed",
        description: err.message,
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="glass-card w-full max-w-lg">
        <CardHeader className="text-center space-y-4">
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center glow-primary mx-auto">
            <Brain className="text-primary-foreground h-7 w-7" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold">Verify Your Email</CardTitle>
          <p className="text-muted-foreground">
            We sent a verification link to <span className="text-foreground font-semibold">{email}</span>.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground leading-relaxed">
            Open the email, click the verification link, then return here and refresh your status. Until that step is complete, access to the app stays locked.
          </div>
          <Button className="w-full font-bold" onClick={handleRefreshStatus} disabled={isRefreshing}>
            <MailCheck className="mr-2 h-4 w-4" />
            {isRefreshing ? 'Checking Verification...' : 'I Verified My Email'}
          </Button>
          <Button variant="outline" className="w-full font-bold" onClick={handleResendEmail} disabled={isResending}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {isResending ? 'Resending...' : 'Resend Verification Email'}
          </Button>
        </CardContent>
        <CardFooter className="flex-col gap-3">
          <Button
            variant="ghost"
            className="w-full font-bold text-muted-foreground"
            onClick={handleSignOut}
            disabled={isSigningOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            {isSigningOut ? 'Signing Out...' : 'Back to Login'}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Already verified in another tab? <Link href="/login" className="text-primary hover:underline">Return to login</Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
