'use client';
import { ReactNode } from 'react';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import { ClerkProvider, useAuth } from '@clerk/nextjs';
import { AppProgressBar as ProgressBar } from 'next-nprogress-bar';

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
        <ProgressBar
          height="2px"
          color={'#003EB6'}
          options={{ showSpinner: false }}
          shallowRouting
        />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
