"use client"

import { type ChangeEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { BadgeCheck, Calendar, Camera, ChevronRight, LogOut, Save, Settings, Shield, User } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { useAppState } from '@/components/providers/StateProvider';
import { useAuth, useUser } from '@/firebase';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
  const { user, updateProfile, applyLocalProfile } = useAppState();
  const { user: authUser } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [username, setUsername] = useState(user.username);
  const [fullName, setFullName] = useState(user.fullName);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const xpProgress = (user.xp / (user.level * 1000)) * 100;
  const isEmailVerified = authUser?.emailVerified === true;
  const avatarFallback = (user.username || 'OP').slice(0, 2).toUpperCase();
  const hasUnsavedChanges = username.trim() !== user.username || fullName.trim() !== user.fullName;

  useEffect(() => {
    setUsername(user.username);
    setFullName(user.fullName);
  }, [user.fullName, user.username]);

  const handleSignOut = async () => {
    await signOut(auth);
    router.replace('/login');
  };

  const handleProfileSave = async () => {
    const nextUsername = username.trim();

    if (nextUsername.length < 3) {
      toast({
        variant: "destructive",
        title: "Username Too Short",
        description: "Choose a username with at least 3 characters.",
      });
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({ username: nextUsername, fullName });
      toast({
        title: "Profile Updated",
        description: "Your identity changes are now live.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: error.message || 'Unable to save your profile.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid File",
        description: "Please upload an image file.",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "File Too Large",
        description: "Choose an image smaller than 5MB.",
      });
      return;
    }

    setIsUploading(true);
    try {
      if (!authUser) {
        throw new Error('You must be logged in to update your avatar.');
      }

      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      const token = await authUser.getIdToken();
      const response = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      const uploaded = await response.json();
      if (!response.ok) {
        throw new Error(uploaded.error || 'Unable to upload your profile image.');
      }

      applyLocalProfile({ photoURL: uploaded.secureUrl });
      toast({
        title: "Avatar Updated",
        description: "Your new profile photo has been synced.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Upload Failed",
        description: error.message || 'Unable to upload your profile image.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <Navbar />
      <main className="container mx-auto px-4 pt-12 max-w-5xl space-y-8">
        <section className="glass-card p-6 md:p-10 rounded-3xl flex flex-col md:flex-row items-center gap-10 relative overflow-hidden border-white/10">
          <div className="absolute -top-10 -right-10 p-8 opacity-5 select-none pointer-events-none">
            <Shield size={240} />
          </div>

          <div className="relative group shrink-0">
            <Avatar className="w-32 h-32 md:w-40 md:h-40 rounded-3xl border-2 border-primary/30 bg-primary/10 glow-primary overflow-hidden transition-all duration-300 group-hover:scale-105">
              <AvatarImage src={user.photoURL} alt={`${user.username} avatar`} className="object-cover" />
              <AvatarFallback className="rounded-3xl bg-primary/10 text-primary">
                {user.photoURL ? avatarFallback : <User size={64} className="md:w-20 md:h-20" />}
              </AvatarFallback>
            </Avatar>
            <Button
              size="sm"
              className="absolute -bottom-4 left-1/2 -translate-x-1/2 rounded-full px-4 shadow-lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Camera className="mr-2 h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Photo'}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <Badge className="absolute -top-3 right-0 bg-accent text-accent-foreground border-none font-black py-1 px-4 text-xs tracking-wider shadow-lg">
              LVL {user.level}
            </Badge>
          </div>

          <div className="flex-1 text-center md:text-left space-y-6 w-full">
            <div className="space-y-1">
              <h1 className="text-3xl md:text-5xl font-headline font-bold tracking-tight">{user.username}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse-primary" />
                <p className="text-muted-foreground text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                  Active Neural Operative
                </p>
                <span className="inline-flex items-center gap-1 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-primary">
                  <BadgeCheck size={12} />
                  {isEmailVerified ? 'Email Verified' : 'Email Pending'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                <span>Neural Experience</span>
                <span className="text-primary">{user.xp} / {user.level * 1000} XP</span>
              </div>
              <Progress value={xpProgress} className="h-2.5 bg-white/5" />
            </div>

            <div className="flex flex-wrap justify-center md:justify-start gap-3 md:gap-4 pt-2">
              <ProfileStat label="Sessions" value={`${user.gamesPlayed}`} />
              <ProfileStat label="Streak" value={`${user.streak} Days`} icon={<Calendar size={18} />} />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="glass-card lg:col-span-2 border-white/10">
            <CardHeader className="border-b border-white/5">
              <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-primary">Identity Control</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-8 px-6 md:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Optional display name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Choose a unique handle"
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
                <p className="font-bold text-foreground">{authUser?.email}</p>
                <p className="mt-1">Your login email is managed by Firebase Auth. Username and profile photo can be updated here anytime.</p>
              </div>

              <Button className="font-bold" onClick={handleProfileSave} disabled={isSaving || !hasUnsavedChanges}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="glass-card border-white/10">
              <CardHeader className="border-b border-white/5">
                <CardTitle className="text-sm font-black uppercase tracking-[0.3em] text-accent">Terminal Control</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-6">
                <Button variant="outline" className="w-full justify-between h-12 border-white/10 hover:bg-white/10 font-bold group" disabled>
                  <div className="flex items-center gap-3">
                    <Settings size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    Additional Settings
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground" />
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-between h-12 border-destructive/20 text-destructive hover:bg-destructive/10 font-bold group"
                  onClick={handleSignOut}
                >
                  <div className="flex items-center gap-3">
                    <LogOut size={18} />
                    Decouple Session
                  </div>
                  <ChevronRight size={16} />
                </Button>
              </CardContent>
            </Card>

            <div className="glass-card p-6 rounded-2xl bg-primary/5 border-primary/20">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-2">Fresh profile</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                New accounts now start clean. Your stats, streak, and avatar only change when you actually use the app.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function ProfileStat({ label, value, icon }: { label: string; value: string; icon?: ReactNode }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10 backdrop-blur-sm group hover:bg-white/10 transition-all duration-300">
      {icon ? <span className="text-primary group-hover:scale-110 transition-transform">{icon}</span> : null}
      <div className="flex flex-col">
        <span className="text-[8px] font-black uppercase text-muted-foreground tracking-widest leading-none mb-1">{label}</span>
        <span className="text-sm font-bold tracking-tight">{value}</span>
      </div>
    </div>
  );
}
