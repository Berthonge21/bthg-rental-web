'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);
const MotionText = motion.create(Text);

export function LoadingScreen() {
  return (
    <MotionFlex
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
      position="fixed"
      inset={0}
      bg="#000000"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
    >
      <Box position="relative" display="flex" flexDirection="column" alignItems="center">

        {/* Background Glow — slow breathing */}
        <MotionBox
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{
            opacity: [0.12, 0.38, 0.12],
            scale: [0.85, 1.25, 0.85],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          position="absolute"
          w="320px"
          h="320px"
          bg="rgba(255,215,0,0.12)"
          borderRadius="full"
          filter="blur(90px)"
        />

        {/* Logo — gentle float up entrance */}
        <MotionBox
          initial={{ opacity: 0, y: 28, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          position="relative"
          zIndex={10}
        >
          {/* Pulsing gold halo — starts after entrance */}
          <MotionBox
            animate={{
              filter: [
                'drop-shadow(0 0 0px rgba(255, 215, 0, 0))',
                'drop-shadow(0 0 22px rgba(255, 215, 0, 0.42))',
                'drop-shadow(0 0 0px rgba(255, 215, 0, 0))',
              ],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 1.4,
            }}
          >
            <Image
              src="/img/logo.png"
              alt="BTHG Rental Logo"
              width={160}
              height={160}
              style={{ objectFit: 'contain' }}
              priority
            />
          </MotionBox>
        </MotionBox>

        {/* Brand name — slides in after logo settles */}
        <MotionText
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 0.9, y: 0 }}
          transition={{ duration: 1.1, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
          mt={8}
          fontSize="11px"
          textTransform="uppercase"
          fontWeight="black"
          letterSpacing="0.34em"
          color="rgba(255,255,255,0.88)"
          textAlign="center"
        >
          BTHG RENTAL
        </MotionText>

        {/* Gold tagline — appears just after brand name */}
        <MotionText
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.65, y: 0 }}
          transition={{ duration: 0.9, delay: 2.0, ease: 'easeOut' }}
          mt={1}
          fontSize="8px"
          textTransform="uppercase"
          fontWeight="semibold"
          letterSpacing="0.42em"
          color="brand.400"
          textAlign="center"
        >
          Premium Car Rental
        </MotionText>

        {/* Thin loader bar — slower sweep */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.7 }}
          mt={10}
          w="160px"
          h="1px"
          bg="rgba(255,255,255,0.07)"
          borderRadius="full"
          overflow="hidden"
          position="relative"
        >
          <MotionBox
            position="absolute"
            top={0}
            left={0}
            h="full"
            w="40%"
            bgGradient="linear(to-r, transparent, rgba(255,215,0,0.65), transparent)"
            animate={{ x: ['-100%', '280%'] }}
            transition={{
              duration: 2.2,
              repeat: Infinity,
              ease: 'easeInOut',
              repeatDelay: 0.4,
            }}
          />
        </MotionBox>
      </Box>
    </MotionFlex>
  );
}

export default LoadingScreen;
