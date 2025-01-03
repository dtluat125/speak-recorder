import type { Metadata } from 'next';
import './globals.css';
import ConvexClientProvider from './ConvexClientProvider';
import Footer from '@/components/ui/Footer';
import { Toaster } from 'react-hot-toast';
import PlausibleProvider from 'next-plausible';

let title = 'TalkieeAI - Practice English Speaking with AI';
let description =
  'Boost your English speaking skills with personalized AI feedback and tailored practice exercises.';
let url = 'https://talkieeai.com';
let ogimage = 'https://talkieeai.com/images/og-image.png';
let sitename = process.env.NEXT_PUBLIC_SITE_NAME;

export const metadata: Metadata = {
  metadataBase: new URL(url),
  title,
  description,
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    images: [ogimage],
    title,
    description,
    url: url,
    siteName: sitename,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    images: [ogimage],
    title,
    description,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <PlausibleProvider domain={process.env.NEXT_PUBLIC_DOMAIN || ''} />
      </head>
      <body>
        <ConvexClientProvider>
          <div className="flex min-h-screen flex-col">
            <div className="flex-1">{children}</div>
            {/* <Footer /> */}
          </div>
          <Toaster position="bottom-left" reverseOrder={false} />
        </ConvexClientProvider>
      </body>
    </html>
  );
}
