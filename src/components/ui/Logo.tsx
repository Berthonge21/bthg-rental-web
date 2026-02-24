'use client';

import Image from 'next/image';
import { HStack, VStack, Text, Box } from '@chakra-ui/react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  hideText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { image: 36, fontSize: 'md', subFontSize: '6px', tracking: '0.15em', gap: 2 },
  md: { image: 48, fontSize: 'xl', subFontSize: '7px', tracking: '0.2em', gap: 3 },
  lg: { image: 64, fontSize: '2xl', subFontSize: '8px', tracking: '0.25em', gap: 3 },
} as const;

export function Logo({ size = 'md', hideText = false, className }: LogoProps) {
  const config = sizeMap[size];

  return (
    <HStack spacing={config.gap} className={className} align="center">
      <Box
        flexShrink={0}
        w={`${config.image}px`}
        h={`${config.image}px`}
        position="relative"
        borderRadius="lg"
        overflow="hidden"
      >
        <Image
          src="/img/logo.png"
          alt="BTHG Rental Logo"
          width={config.image}
          height={config.image}
          style={{ objectFit: 'cover', objectPosition: 'top' }}
          priority
        />
      </Box>
      {!hideText && (
        <VStack spacing={0} align="start" lineHeight="none">
          <Text
            fontFamily="var(--font-display)"
            fontWeight="black"
            fontSize={config.fontSize}
            letterSpacing="tight"
            color="white"
            textTransform="uppercase"
            lineHeight="1"
          >
            BTHG RENTAL
          </Text>
          <Text
            fontSize={config.subFontSize}
            letterSpacing={config.tracking}
            color="brand.400"
            textTransform="uppercase"
            fontWeight="bold"
            whiteSpace="nowrap"
            lineHeight="1.4"
          >
            CAR RENTAL
          </Text>
        </VStack>
      )}
    </HStack>
  );
}

export default Logo;
