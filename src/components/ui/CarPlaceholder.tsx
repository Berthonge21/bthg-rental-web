'use client';

import { Box, Icon, Text, VStack } from '@chakra-ui/react';
import { FiTruck } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';

export function CarPlaceholder({ h = '200px' }: { h?: string }) {
  const { t } = useTranslation();

  return (
    <Box
      w="100%"
      h={h}
      bg="rgba(255,215,0,0.04)"
      border="1px dashed"
      borderColor="rgba(255,215,0,0.15)"
      borderRadius="inherit"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing={2}>
        <Icon as={FiTruck} boxSize={10} color="rgba(255,215,0,0.3)" />
        <Text fontSize="xs" color="rgba(255,255,255,0.2)" letterSpacing="wider" textTransform="uppercase">
          {t('common.noImage')}
        </Text>
      </VStack>
    </Box>
  );
}
