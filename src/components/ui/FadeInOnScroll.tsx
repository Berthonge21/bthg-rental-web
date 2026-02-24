'use client';

import { type ReactNode, useRef } from 'react';
import { Box } from '@chakra-ui/react';
import { motion, useScroll, useSpring, useInView } from 'framer-motion';

const MotionBox = motion.create(Box);

/* ── Scroll progress bar ── */
export function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <MotionBox
      position="fixed"
      top={0}
      left={0}
      right={0}
      h="3px"
      bg="brand.400"
      transformOrigin="0%"
      zIndex={9999}
      style={{ scaleX }}
      boxShadow="0 0 8px rgba(201,162,39,0.6)"
    />
  );
}

/* ── FadeInOnScroll ── */
interface FadeInOnScrollProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'clip';
  distance?: number;
}

export function FadeInOnScroll({
  children,
  delay = 0,
  direction = 'up',
  distance = 48,
}: FadeInOnScrollProps) {
  /* clip mode: text rises from behind a mask — premium reveal */
  if (direction === 'clip') {
    return (
      <Box overflow="hidden" display="inline-block">
        <MotionBox
          initial={{ y: '110%', opacity: 0 }}
          whileInView={{ y: '0%', opacity: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
        >
          {children}
        </MotionBox>
      </Box>
    );
  }

  const hidden = {
    opacity: 0,
    ...(direction === 'up'    && { y:  distance }),
    ...(direction === 'down'  && { y: -distance }),
    ...(direction === 'left'  && { x:  distance }),
    ...(direction === 'right' && { x: -distance }),
  };

  const visible = {
    opacity: 1,
    y: 0,
    x: 0,
  };

  return (
    <MotionBox
      initial={hidden}
      whileInView={visible}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        type: 'spring',
        damping: 22,
        stiffness: 180,
        mass: 0.7,
        delay,
      }}
    >
      {children}
    </MotionBox>
  );
}

/* ── StaggerGrid: wraps a list and staggers children in on scroll ── */
interface StaggerGridProps {
  children: ReactNode[];
  staggerDelay?: number;
}

export function StaggerGrid({ children, staggerDelay = 0.08 }: StaggerGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <Box ref={ref}>
      {children.map((child, i) => (
        <MotionBox
          key={i}
          initial={{ opacity: 0, y: 36 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 36 }}
          transition={{
            type: 'spring',
            damping: 20,
            stiffness: 160,
            delay: i * staggerDelay,
          }}
          display="contents"
        >
          {child}
        </MotionBox>
      ))}
    </Box>
  );
}
