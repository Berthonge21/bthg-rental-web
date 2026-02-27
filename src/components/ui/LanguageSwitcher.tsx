'use client';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { HStack, Text, Box } from '@chakra-ui/react';
import { FiGlobe } from 'react-icons/fi';

const MotionHStack = motion.create(HStack);

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isEn = i18n.language?.startsWith('en');
  const toggle = () => i18n.changeLanguage(isEn ? 'fr' : 'en');

  return (
    <MotionHStack
      as="button"
      onClick={toggle}
      spacing={1.5}
      px={3}
      py={1}
      borderRadius="full"
      border="1px solid"
      borderColor="rgba(255,215,0,0.3)"
      bg="rgba(255,215,0,0.05)"
      color="brand.400"
      fontSize="xs"
      fontWeight="bold"
      letterSpacing="wider"
      cursor="pointer"
      _hover={{ borderColor: 'brand.400', bg: 'rgba(255,215,0,0.12)' }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Box as={FiGlobe} boxSize={3.5} />
      <Text>{isEn ? 'FR' : 'EN'}</Text>
    </MotionHStack>
  );
}
