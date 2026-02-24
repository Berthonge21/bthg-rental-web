'use client';

import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { FiTruck } from 'react-icons/fi';
import Image from 'next/image';
import type { ReactNode } from 'react';
import NextLink from 'next/link';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <Box position="relative" minH="100vh" overflow="hidden">
      {/* Full-page background */}
      <Image
        src="/img/test.png"
        alt="Background car"
        fill
        style={{ objectFit: 'cover' }}
        priority
      />

      {/* Dark overlay */}
      <Box position="absolute" inset={0} bg="rgba(11,28,45,0.72)" />

      {/* Diagonal gold accent lines */}
      <Box
        position="absolute"
        inset={0}
        opacity={0.05}
        background="repeating-linear-gradient(-45deg, #C9A227 0px, #C9A227 1px, transparent 1px, transparent 48px)"
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
        py={10}
      >
        {/* Logo */}
        <HStack spacing={3} mb={8} as={NextLink} href="/" _hover={{ textDecoration: 'none' }}>
          <Box
            w={10}
            h={10}
            bg="brand.400"
            borderRadius="lg"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FiTruck} color="white" boxSize={5} />
          </Box>
          <Text fontFamily="var(--font-display)" fontSize="2xl" letterSpacing="0.06em" color="white">
            BTHG RENTAL
          </Text>
        </HStack>

        {children}

        <Text color="whiteAlpha.400" fontSize="xs" mt={8} letterSpacing="wider" textTransform="uppercase">
          &copy; {new Date().getFullYear()} BTHG Rental. All rights reserved.
        </Text>
      </Flex>
    </Box>
  );
}
