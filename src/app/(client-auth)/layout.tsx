'use client';

import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react';
import { FiTruck } from 'react-icons/fi';
import Image from 'next/image';
import type { ReactNode } from 'react';
import NextLink from 'next/link';

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
      <Box position="absolute" inset={0} bg="rgba(11,28,45,0.65)" />

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
            <Text fontSize="xl" fontWeight="bold" color="white">
              BTHG Rental
            </Text>
          </HStack>

        {children}

        {/* Footer */}
        <Text color="whiteAlpha.500" fontSize="sm" mt={8}>
          &copy; {new Date().getFullYear()} BTHG Rental. All rights reserved.
        </Text>
      </Flex>
    </Box>
  );
}
