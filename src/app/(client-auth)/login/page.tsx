'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Center, Spinner } from '@chakra-ui/react';

function LoginRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirect = searchParams.get('redirect');
    router.replace(redirect ? `/auth/login?redirect=${encodeURIComponent(redirect)}` : '/auth/login');
  }, [router, searchParams]);

  return (
    <Center minH="100vh">
      <Spinner size="xl" color="brand.400" thickness="4px" />
    </Center>
  );
}

export default function OldLoginPage() {
  return (
    <Suspense fallback={<Center minH="100vh"><Spinner size="xl" color="brand.400" thickness="4px" /></Center>}>
      <LoginRedirect />
    </Suspense>
  );
}
