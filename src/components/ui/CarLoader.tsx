'use client';

import { Box, Center, Icon, Text, VStack } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import { FiTruck } from 'react-icons/fi';

const MotionBox = motion(Box);

const sizeMap = {
  sm: 6,
  md: 8,
  lg: 10,
  xl: 12,
} as const;

interface CarLoaderProps {
  /** Icon size variant */
  size?: keyof typeof sizeMap;
  /** Whether to render as a full-screen overlay with navy background */
  fullScreen?: boolean;
  /** Optional loading text displayed below the icon */
  text?: string;
}

export function CarLoader({ size = 'xl', fullScreen = false, text }: CarLoaderProps) {
  const iconSize = sizeMap[size] ?? sizeMap.xl;

  const content = (
    <VStack spacing={4}>
      <MotionBox
        animate={{ y: [0, -16, 0] }}
        transition={{
          duration: 1.2,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      >
        <Icon as={FiTruck} boxSize={iconSize} color="brand.400" />
      </MotionBox>
      {text && (
        <Text fontSize="sm" color={fullScreen ? 'whiteAlpha.700' : 'gray.500'} fontWeight="medium">
          {text}
        </Text>
      )}
    </VStack>
  );

  if (fullScreen) {
    return (
      <Center h="100vh" bg="navy.800">
        {content}
      </Center>
    );
  }

  return (
    <Center h="100%" minH="200px">
      {content}
    </Center>
  );
}
