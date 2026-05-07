import type {Metadata} from 'next';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { StateProvider } from '@/components/providers/StateProvider';
import { Toaster } from '@/components/ui/toaster';
import { AuthGate } from '@/components/auth/AuthGate';
import { RegistrationGate } from '@/components/auth/RegistrationGate';

export const metadata: Metadata = {
  title: 'BRAINFORGE | Gamified Brain Training',
  description: 'Sharpen your cognitive skills with AI-powered personalized training.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen" suppressHydrationWarning>
        <FirebaseClientProvider>
          <AuthGate>
            <StateProvider>
              <RegistrationGate>
                {children}
                <Toaster />
              </RegistrationGate>
            </StateProvider>
          </AuthGate>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
