'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import NextLink from 'next/link';
import { Logo } from '@/components/ui/Logo';

export default function ClientAuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box position="relative" minH="100vh" overflow="hidden">
      {/* Full-page background image */}
      <Image
        src="/img/test.jpg"
        alt="Background car"
        fill
        style={{ objectFit: 'cover' }}
        priority
      />

      {/* Dark overlay */}
      <Box position="absolute" inset={0} bg="rgba(0,0,0,0.78)" />

      {/* Diagonal gold accent lines */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.05}
        background="repeating-linear-gradient(-45deg, #FFD700 0px, #FFD700 1px, transparent 1px, transparent 48px)"
        pointerEvents="none"
      />

      {/* Content */}
      <Flex
        position="relative"
        minH="100vh"
        align="center"
        justify="center"
        direction="column"
        px={4}
      >
        {/* Logo */}
        <Box as={NextLink} href="/" mb={8} _hover={{ textDecoration: 'none' }}>
          <Logo size="md" />
        </Box>

        {children}

        {/* Footer */}
        <Text color="whiteAlpha.400" fontSize="xs" mt={8} letterSpacing="wider" textTransform="uppercase">
          &copy; {new Date().getFullYear()} BTHG Rental. All rights reserved.
        </Text>
      </Flex>
    </Box>
  );
}
