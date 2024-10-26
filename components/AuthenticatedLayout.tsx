'use client'

import { useUser } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import React from 'react';

export function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded || !isSignedIn) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
}
