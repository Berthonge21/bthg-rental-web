'use client';

import { Box, Container, Flex, Image, useColorModeValue } from '@chakra-ui/react';
import type { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Flex minH="100vh" bg={bgColor}>
      {/* Left side - Branding */}
      <Box
        display={{ base: 'none', lg: 'flex' }}
        w="50%"
        bg="brand.400"
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
      >
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-br, brand.400, brand.600)"
        />
        <Box position="relative" textAlign="center" color="white" p={8}>
          <Box fontSize="4xl" fontWeight="bold" mb={4}>
            BTHG Rental Car
          </Box>
          <Box fontSize="lg" opacity={0.9}>
            Your trusted car rental platform
          </Box>
        </Box>
      </Box>

      {/* Right side - Form */}
      <Flex
        w={{ base: '100%', lg: '50%' }}
        alignItems="center"
        justifyContent="center"
        p={8}
      >
        <Container maxW="md">{children}</Container>
      </Flex>
    </Flex>
  );
}
