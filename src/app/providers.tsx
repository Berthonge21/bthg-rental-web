'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, type ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { theme } from '@/theme';
import { useAuthStore } from '@/stores/auth.store';
import { LoadingScreen } from '@/components/ui/LoadingScreen';

// Minimum time (ms) the loading screen stays visible so all animations
// fully play through — logo entrance (1.8s) + text reveal (2.9s) + breathing room
const MIN_SPLASH_MS = 4000;

function AuthInitializer({ children }: { children: ReactNode }) {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const isInitializing = useAuthStore((state) => state.isInitializing);
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    fetchUser();
    const t = setTimeout(() => setMinElapsed(true), MIN_SPLASH_MS);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep splash until BOTH auth is done AND minimum time has passed
  const showSplash = isInitializing || !minElapsed;

  return (
    <>
      <AnimatePresence>
        {showSplash && <LoadingScreen key="loading-screen" />}
      </AnimatePresence>
      {!showSplash && children}
    </>
  );
}

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        <QueryClientProvider client={queryClient}>
          <AuthInitializer>{children}</AuthInitializer>
        </QueryClientProvider>
      </ChakraProvider>
    </CacheProvider>
  );
}
