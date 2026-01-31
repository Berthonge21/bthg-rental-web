'use client';

import { Center, Spinner, Text, VStack } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullPage?: boolean;
}

export function LoadingSpinner({
  text = 'Loading...',
  size = 'lg',
  fullPage = false,
}: LoadingSpinnerProps) {
  const content = (
    <VStack spacing={4}>
      <Spinner size={size} color="brand.400" thickness="4px" />
      {text && <Text color="gray.500">{text}</Text>}
    </VStack>
  );

  if (fullPage) {
    return (
      <Center h="100vh" w="100%">
        {content}
      </Center>
    );
  }

  return (
    <Center py={12}>
      {content}
    </Center>
  );
}
