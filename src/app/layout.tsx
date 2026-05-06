import type {Metadata} from 'next';
import './globals.css';
import { StateProvider } from '@/components/providers/StateProvider';
import { Toaster } from '@/components/ui/toaster';

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
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground min-h-screen">
        <StateProvider>
          {children}
          <Toaster />
        </StateProvider>
      </body>
    </html>
  );
}
