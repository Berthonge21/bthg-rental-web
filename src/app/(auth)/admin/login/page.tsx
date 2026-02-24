'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Center, Spinner } from '@chakra-ui/react';

export default function AdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/auth/login');
  }, [router]);

  return (
    <Center minH="100vh">
      <Spinner size="xl" color="brand.400" thickness="4px" />
    </Center>
  );
}
