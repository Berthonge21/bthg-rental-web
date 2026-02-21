'use client';

import { useRef, type ReactNode } from 'react';
import { Box } from '@chakra-ui/react';
import { motion, useInView } from 'framer-motion';

const MotionBox = motion.create(Box);

interface FadeInOnScrollProps {
  children: ReactNode;
  /** Delay in seconds before animation starts */
  delay?: number;
  /** Direction from which the element enters */
  direction?: 'up' | 'left' | 'right';
}

export function FadeInOnScroll({ children, delay = 0, direction = 'up' }: FadeInOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const initialOffset = 40;
  const initial = {
    opacity: 0,
    ...(direction === 'up' && { y: initialOffset }),
    ...(direction === 'left' && { x: initialOffset }),
    ...(direction === 'right' && { x: -initialOffset }),
  };

  const animate = isInView
    ? { opacity: 1, x: 0, y: 0 }
    : initial;

  return (
    <MotionBox
      ref={ref}
      initial={initial}
      animate={animate}
      transition={{
        duration: 0.6,
        ease: 'easeOut',
        delay,
      }}
    >
      {children}
    </MotionBox>
  );
}
