'use client';

import { Box, Flex, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import Image from 'next/image';

const MotionBox = motion.create(Box);
const MotionFlex = motion.create(Flex);

export function LoadingScreen() {
  return (
    <MotionFlex
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeInOut' }}
      position="fixed"
      inset={0}
      bg="#000000"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      zIndex={9999}
    >
      <Box position="relative" display="flex" flexDirection="column" alignItems="center">
        {/* Background Glow */}
        <MotionBox
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          position="absolute"
          w="256px"
          h="256px"
          bg="rgba(255,215,0,0.1)"
          borderRadius="full"
          filter="blur(80px)"
        />

        {/* Pulsing Logo Container */}
        <MotionBox
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          position="relative"
          zIndex={10}
        >
          <MotionBox
            animate={{
              filter: [
                'drop-shadow(0 0 0px rgba(255, 215, 0, 0))',
                'drop-shadow(0 0 15px rgba(255, 215, 0, 0.4))',
                'drop-shadow(0 0 0px rgba(255, 215, 0, 0))',
              ],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          >
            <Image
              src="/img/logo.png"
              alt="BTHG Rental Logo"
              width={192}
              height={192}
              style={{ objectFit: 'contain' }}
              priority
            />
          </MotionBox>
        </MotionBox>

        {/* Refined Loader Bar */}
        <Box
          mt={12}
          w="192px"
          h="2px"
          bg="rgba(255,255,255,0.05)"
          borderRadius="full"
          overflow="hidden"
          position="relative"
        >
          <MotionBox
            position="absolute"
            top={0}
            left={0}
            h="full"
            w="full"
            bgGradient="linear(to-r, transparent, brand.400, transparent)"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </Box>

        {/* Brand Text */}
        <MotionBox
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 1, duration: 1 }}
        >
          <Text
            mt={6}
            fontSize="10px"
            textTransform="uppercase"
            fontWeight="black"
            letterSpacing="0.4em"
            color="rgba(255,255,255,0.6)"
            textAlign="center"
          >
            BTHG RENTAL
          </Text>
        </MotionBox>
      </Box>
    </MotionFlex>
  );
}

export default LoadingScreen;
