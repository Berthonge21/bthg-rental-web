'use client';

import {
  Box,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import type { IconType } from 'react-icons';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: IconType;
  change?: number;
  changeLabel?: string;
  iconBg?: string;
  iconColor?: string;
}

export function StatCard({
  label,
  value,
  icon,
  change,
  changeLabel,
  iconBg = 'brand.400',
  iconColor = 'white',
}: StatCardProps) {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');

  return (
    <Box
      bg={bg}
      borderRadius="xl"
      p={6}
      border="1px"
      borderColor={borderColor}
      boxShadow="sm"
      transition="all 0.2s"
      _hover={{
        boxShadow: 'md',
        transform: 'translateY(-2px)',
      }}
    >
      <Flex justify="space-between" align="flex-start">
        <Stat>
          <StatLabel color="gray.500" fontWeight="medium" mb={1}>
            {label}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold">
            {value}
          </StatNumber>
          {change !== undefined && (
            <StatHelpText mb={0}>
              <StatArrow type={change >= 0 ? 'increase' : 'decrease'} />
              {Math.abs(change)}% {changeLabel || 'from last month'}
            </StatHelpText>
          )}
        </Stat>
        <Flex
          w={12}
          h={12}
          bg={iconBg}
          borderRadius="lg"
          align="center"
          justify="center"
        >
          <Icon as={icon} color={iconColor} boxSize={6} />
        </Flex>
      </Flex>
    </Box>
  );
}
