'use client';

import { Box, Container, Flex, Icon, Text, VStack, useColorModeValue } from '@chakra-ui/react';
import { FiTruck, FiShield, FiClock, FiAward } from 'react-icons/fi';
import type { ReactNode } from 'react';

const features = [
  { icon: FiShield, text: 'Secure & Reliable' },
  { icon: FiClock, text: '24/7 Support' },
  { icon: FiAward, text: 'Premium Service' },
];

export default function AuthLayout({ children }: { children: ReactNode }) {
  const bgColor = useColorModeValue('surface.light', 'surface.dark');

  return (
    <Flex minH="100vh" bg={bgColor}>
      {/* Left side - Branding */}
      <Box
        display={{ base: 'none', lg: 'flex' }}
        w="50%"
        bgGradient="linear(135deg, brand.600, brand.500, mauve.500)"
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
      >
        {/* Decorative elements */}
        <Box
          position="absolute"
          top="-10%"
          right="-10%"
          w="400px"
          h="400px"
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.1)"
        />
        <Box
          position="absolute"
          bottom="-15%"
          left="-10%"
          w="500px"
          h="500px"
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.05)"
        />
        <Box
          position="absolute"
          top="30%"
          left="20%"
          w="200px"
          h="200px"
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.08)"
        />

        {/* Content */}
        <VStack position="relative" spacing={8} color="white" p={12} maxW="500px">
          {/* Logo */}
          <Box
            w={20}
            h={20}
            bg="rgba(255, 255, 255, 0.2)"
            backdropFilter="blur(10px)"
            borderRadius="2xl"
            display="flex"
            alignItems="center"
            justifyContent="center"
            border="1px solid rgba(255, 255, 255, 0.3)"
          >
            <Icon as={FiTruck} boxSize={10} />
          </Box>

          {/* Heading */}
          <VStack spacing={3}>
            <Text fontSize="4xl" fontWeight="bold" textAlign="center">
              BTHG Rental Car
            </Text>
            <Text fontSize="lg" opacity={0.9} textAlign="center">
              Your trusted partner for premium car rental services
            </Text>
          </VStack>

          {/* Features */}
          <Flex gap={6} mt={8}>
            {features.map((feature, index) => (
              <VStack
                key={index}
                p={4}
                bg="rgba(255, 255, 255, 0.1)"
                backdropFilter="blur(10px)"
                borderRadius="xl"
                border="1px solid rgba(255, 255, 255, 0.2)"
                minW="120px"
              >
                <Icon as={feature.icon} boxSize={6} />
                <Text fontSize="sm" fontWeight="medium" textAlign="center">
                  {feature.text}
                </Text>
              </VStack>
            ))}
          </Flex>

          {/* Stats */}
          <Flex gap={12} mt={8}>
            <VStack spacing={0}>
              <Text fontSize="3xl" fontWeight="bold">500+</Text>
              <Text fontSize="sm" opacity={0.8}>Vehicles</Text>
            </VStack>
            <VStack spacing={0}>
              <Text fontSize="3xl" fontWeight="bold">50+</Text>
              <Text fontSize="sm" opacity={0.8}>Agencies</Text>
            </VStack>
            <VStack spacing={0}>
              <Text fontSize="3xl" fontWeight="bold">10K+</Text>
              <Text fontSize="sm" opacity={0.8}>Clients</Text>
            </VStack>
          </Flex>
        </VStack>
      </Box>

      {/* Right side - Form */}
      <Flex
        w={{ base: '100%', lg: '50%' }}
        alignItems="center"
        justifyContent="center"
        p={{ base: 4, md: 8 }}
        position="relative"
      >
        {/* Background decoration for mobile */}
        <Box
          display={{ base: 'block', lg: 'none' }}
          position="absolute"
          top={0}
          left={0}
          right={0}
          h="200px"
          bgGradient="linear(135deg, brand.600, brand.500, mauve.500)"
          borderBottomRadius="3xl"
        />

        <Container maxW="md" position="relative">
          {children}
        </Container>
      </Flex>
    </Flex>
  );
}
