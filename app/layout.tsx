import type { Metadata } from 'next';
import { Bricolage_Grotesque, Geist } from 'next/font/google';
import { Toaster } from 'sonner';
import { SmoothScrollProvider } from '@/components/providers/smooth-scroll-provider';
import './globals.css';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-bricolage',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Kyvo — One Link. Everywhere.',
  description: 'Create your personal page, share all your social media, portfolio, videos, stores and more in one beautiful place.',
  keywords: ['Linktree alternative', 'Link in bio', 'Neobrutalism', 'Kyvo', 'Portfolio', 'Social links'],
  authors: [{ name: 'Kyvo Team' }],
  metadataBase: new URL('https://kyvo.fun'),
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Kyvo — One Link. Everywhere.',
    description: 'Create your personal page, share all your social media, portfolio, videos, stores and more in one beautiful place.',
    url: 'https://kyvo.fun',
    siteName: 'Kyvo',
    locale: 'en_US',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body className="bg-[#F8F9FA] text-[#111111] antialiased selection:bg-[#FFD43B] selection:text-[#111111]">
        <SmoothScrollProvider>
          {children}
        </SmoothScrollProvider>
        <Toaster 
          position="bottom-right" 
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#111111',
              border: '3px solid #111111',
              boxShadow: '4px 4px 0px 0px #111111',
              borderRadius: '12px',
              fontWeight: '600',
            },
          }} 
        />
      </body>
    </html>
  );
}
