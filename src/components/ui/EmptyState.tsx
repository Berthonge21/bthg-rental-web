'use client';

import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { motion, type Variants } from 'framer-motion';
import Lottie from 'lottie-react';
import emptyAnimation from '@/assets/lottie/empty-state.json';

/* ─── Motion aliases ─────────────────────────────────────────── */
const MotionBox  = motion(Box);
const MotionFlex = motion(Flex);

/* ─── Types ──────────────────────────────────────────────────── */
export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export interface EmptyStateProps {
  /** Primary headline shown under the illustration */
  title: string;
  /** Supporting sentence (keep ≤ 2 lines) */
  description: string;
  /** Optional primary CTA button */
  action?: EmptyStateAction;
  /** Optional secondary / ghost CTA */
  secondaryAction?: EmptyStateAction;
}

/* ─── Entrance variants (stagger children) ───────────────────── */
// UX rule: entrance animation only — no infinite decorative loops
// Respect prefers-reduced-motion via Framer Motion's reducedMotion
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, staggerChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden:  { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
};

/* ─── EmptyState ─────────────────────────────────────────────── */
export function EmptyState({
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <MotionFlex
      as="section"
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      py={{ base: 14, md: 20 }}
      px={6}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Lottie illustration ─────────────────────────────── */}
      <MotionBox variants={itemVariants} mb={6}>
        {/* Subtle radial glow behind the animation */}
        <Box position="relative" w="180px" h="180px">
          <Box
            position="absolute"
            inset={0}
            borderRadius="full"
            background="radial-gradient(ellipse at center, rgba(255,215,0,0.10) 0%, transparent 70%)"
            pointerEvents="none"
          />
          <Lottie
            animationData={emptyAnimation}
            loop
            autoplay
            style={{ width: '100%', height: '100%' }}
            aria-hidden="true"
          />
        </Box>
      </MotionBox>

      {/* ── Title ───────────────────────────────────────────── */}
      <MotionBox variants={itemVariants} mb={2}>
        <Text
          fontSize={{ base: 'lg', md: 'xl' }}
          fontWeight="700"
          color="white"
          letterSpacing="-0.015em"
          lineHeight="1.3"
        >
          {title}
        </Text>
      </MotionBox>

      {/* ── Description ─────────────────────────────────────── */}
      <MotionBox variants={itemVariants}>
        <Text
          fontSize="sm"
          color="gray.400"
          maxW="290px"
          lineHeight="1.7"
        >
          {description}
        </Text>
      </MotionBox>

      {/* ── Actions ─────────────────────────────────────────── */}
      {(action || secondaryAction) && (
        <MotionBox variants={itemVariants} mt={7}>
          <Flex gap={3} align="center" justify="center" wrap="wrap">
            {action && (
              <Button
                onClick={action.onClick}
                bg="brand.400"
                color="#000000"
                fontWeight="700"
                fontSize="sm"
                px={6}
                h="38px"
                leftIcon={action.icon as any}
                _hover={{ bg: 'yellow.300', transform: 'translateY(-1px)', transition: 'all 0.18s ease' }}
                _active={{ transform: 'translateY(0)' }}
                cursor="pointer"
              >
                {action.label}
              </Button>
            )}
            {secondaryAction && (
              <Button
                onClick={secondaryAction.onClick}
                variant="outline"
                borderColor="rgba(255,215,0,0.22)"
                color="gray.300"
                fontWeight="600"
                fontSize="sm"
                px={6}
                h="38px"
                leftIcon={secondaryAction.icon as any}
                _hover={{
                  borderColor: 'brand.400',
                  color: 'white',
                  bg: 'rgba(255,215,0,0.05)',
                  transition: 'all 0.18s ease',
                }}
                cursor="pointer"
              >
                {secondaryAction.label}
              </Button>
            )}
          </Flex>
        </MotionBox>
      )}
    </MotionFlex>
  );
}
