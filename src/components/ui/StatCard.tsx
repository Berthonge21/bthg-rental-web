'use client';

import {
  Box,
  Flex,
  Text,
  Icon,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import type { IconType } from 'react-icons';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: IconType;
  change?: number;
  changeLabel?: string;
  variant?: 'default' | 'gradient' | 'glass';
  gradientFrom?: string;
  gradientTo?: string;
}

export function StatCard({
  label,
  value,
  icon,
  change,
  changeLabel = 'vs last month',
  variant = 'default',
  gradientFrom = 'brand.500',
  gradientTo = 'mauve.500',
}: StatCardProps) {
  const defaultBg = useColorModeValue('white', 'gray.800');
  const defaultBorder = useColorModeValue('gray.100', 'gray.700');
  const labelColor = useColorModeValue('gray.500', 'gray.400');
  const valueColor = useColorModeValue('gray.900', 'white');

  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  if (variant === 'gradient') {
    return (
      <Box
        bgGradient={`linear(135deg, ${gradientFrom}, ${gradientTo})`}
        borderRadius="2xl"
        p={6}
        position="relative"
        overflow="hidden"
        boxShadow="0 10px 40px rgba(99, 102, 241, 0.3)"
        transition="all 0.3s"
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: '0 20px 50px rgba(99, 102, 241, 0.4)',
        }}
      >
        {/* Decorative circles */}
        <Box
          position="absolute"
          top="-20px"
          right="-20px"
          w="100px"
          h="100px"
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.1)"
        />
        <Box
          position="absolute"
          bottom="-30px"
          left="-30px"
          w="120px"
          h="120px"
          borderRadius="full"
          bg="rgba(255, 255, 255, 0.05)"
        />

        <Flex justify="space-between" align="flex-start" position="relative">
          <Box>
            <Text
              fontSize="sm"
              fontWeight="medium"
              color="whiteAlpha.800"
              mb={1}
            >
              {label}
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color="white">
              {value}
            </Text>
            {change !== undefined && (
              <HStack spacing={1} mt={2}>
                <Icon
                  as={isPositive ? FiTrendingUp : FiTrendingDown}
                  color={isPositive ? 'green.200' : 'red.200'}
                  boxSize={4}
                />
                <Text fontSize="sm" color="whiteAlpha.900" fontWeight="medium">
                  {isPositive ? '+' : ''}{change}%
                </Text>
                <Text fontSize="xs" color="whiteAlpha.700">
                  {changeLabel}
                </Text>
              </HStack>
            )}
          </Box>
          <Box
            p={3}
            bg="rgba(255, 255, 255, 0.2)"
            borderRadius="xl"
            backdropFilter="blur(10px)"
          >
            <Icon as={icon} boxSize={6} color="white" />
          </Box>
        </Flex>
      </Box>
    );
  }

  if (variant === 'glass') {
    return (
      <Box
        bg={useColorModeValue('rgba(255, 255, 255, 0.8)', 'rgba(30, 41, 59, 0.8)')}
        backdropFilter="blur(20px)"
        borderRadius="2xl"
        p={6}
        border="1px solid"
        borderColor={useColorModeValue('rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.1)')}
        transition="all 0.3s"
        _hover={{
          transform: 'translateY(-4px)',
          boxShadow: 'xl',
        }}
      >
        <Flex justify="space-between" align="flex-start">
          <Box>
            <Text fontSize="sm" fontWeight="medium" color={labelColor} mb={1}>
              {label}
            </Text>
            <Text fontSize="3xl" fontWeight="bold" color={valueColor}>
              {value}
            </Text>
            {change !== undefined && (
              <HStack spacing={1} mt={2}>
                <Icon
                  as={isPositive ? FiTrendingUp : FiTrendingDown}
                  color={isPositive ? 'green.500' : 'red.500'}
                  boxSize={4}
                />
                <Text
                  fontSize="sm"
                  color={isPositive ? 'green.500' : 'red.500'}
                  fontWeight="medium"
                >
                  {isPositive ? '+' : ''}{change}%
                </Text>
                <Text fontSize="xs" color={labelColor}>
                  {changeLabel}
                </Text>
              </HStack>
            )}
          </Box>
          <Box
            p={3}
            bgGradient={`linear(135deg, ${gradientFrom}, ${gradientTo})`}
            borderRadius="xl"
            boxShadow="0 4px 14px rgba(99, 102, 241, 0.3)"
          >
            <Icon as={icon} boxSize={6} color="white" />
          </Box>
        </Flex>
      </Box>
    );
  }

  // Default variant
  return (
    <Box
      bg={defaultBg}
      borderRadius="2xl"
      p={6}
      border="1px solid"
      borderColor={defaultBorder}
      boxShadow="sm"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-4px)',
        boxShadow: 'lg',
        borderColor: 'brand.200',
      }}
    >
      <Flex justify="space-between" align="flex-start">
        <Box>
          <Text fontSize="sm" fontWeight="medium" color={labelColor} mb={1}>
            {label}
          </Text>
          <Text fontSize="3xl" fontWeight="bold" color={valueColor}>
            {value}
          </Text>
          {change !== undefined && (
            <HStack spacing={1} mt={2}>
              <Icon
                as={isPositive ? FiTrendingUp : FiTrendingDown}
                color={isPositive ? 'green.500' : 'red.500'}
                boxSize={4}
              />
              <Text
                fontSize="sm"
                color={isPositive ? 'green.500' : 'red.500'}
                fontWeight="medium"
              >
                {isPositive ? '+' : ''}{change}%
              </Text>
              <Text fontSize="xs" color={labelColor}>
                {changeLabel}
              </Text>
            </HStack>
          )}
        </Box>
        <Box
          p={3}
          bg={useColorModeValue('brand.50', 'brand.900')}
          borderRadius="xl"
        >
          <Icon as={icon} boxSize={6} color="brand.500" />
        </Box>
      </Flex>
    </Box>
  );
}
