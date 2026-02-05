'use client';

import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Badge,
  HStack,
  VStack,
  Flex,
  Icon,
  Progress,
  useColorModeValue,
  Avatar,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiTruck,
  FiCalendar,
  FiDollarSign,
  FiClock,
  FiTrendingUp,
  FiEye,
  FiCheckCircle,
  FiActivity,
} from 'react-icons/fi';
import NextLink from 'next/link';
import { StatCard, DataTable, LoadingSpinner, type Column } from '@/components/ui';
import { useAdminDashboard, useAdminRentals } from '@/hooks';
import { useAuthStore } from '@/stores/auth.store';
import type { Rental, RentalStatus } from '@bthgrentalcar/sdk';
import { format } from 'date-fns';

const statusColors: Record<RentalStatus, string> = {
  reserved: 'yellow',
  ongoing: 'blue',
  completed: 'green',
  cancelled: 'red',
};

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useAdminDashboard();
  const { data: rentalsData, isLoading: rentalsLoading } = useAdminRentals({ limit: 5 });

  const cardBg = useColorModeValue('white', 'navy.700');
  const cardBorder = useColorModeValue('gray.100', 'navy.600');
  const textMuted = useColorModeValue('text.muted', 'gray.400');

  if (statsLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  // Calculate utilization rate
  const utilizationRate = stats?.totalCars
    ? Math.round(((stats.totalCars - (stats.availableCars || 0)) / stats.totalCars) * 100)
    : 0;

  const rentalColumns: Column<Rental>[] = [
    {
      header: 'Client',
      accessor: (row) => (
        <HStack spacing={3}>
          <Avatar
            size="sm"
            name={`${row.client?.firstname} ${row.client?.name}`}
            bg="brand.400"
            color="white"
          />
          <VStack align="start" spacing={0}>
            <Text fontWeight="medium" fontSize="sm" color="text.primary">
              {row.client?.firstname} {row.client?.name}
            </Text>
            <Text fontSize="xs" color={textMuted}>
              {row.client?.email}
            </Text>
          </VStack>
        </HStack>
      ),
    },
    {
      header: 'Car',
      accessor: (row) => (
        <VStack align="start" spacing={0}>
          <Text fontWeight="medium" fontSize="sm" color="text.primary">
            {row.car?.brand} {row.car?.model}
          </Text>
          <Text fontSize="xs" color={textMuted}>
            {row.car?.year}
          </Text>
        </VStack>
      ),
    },
    {
      header: 'Period',
      accessor: (row) => (
        <VStack align="start" spacing={0}>
          <Text fontSize="sm" color="text.primary">
            {format(new Date(row.startDate), 'MMM d')} - {format(new Date(row.endDate), 'MMM d')}
          </Text>
          <Text fontSize="xs" color={textMuted}>
            {Math.ceil((new Date(row.endDate).getTime() - new Date(row.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
          </Text>
        </VStack>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge
          colorScheme={statusColors[row.status]}
          textTransform="capitalize"
          borderRadius="md"
          px={2}
          py={0.5}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <Text fontWeight="bold" color="brand.400">
          ${row.total.toFixed(2)}
        </Text>
      ),
    },
    {
      header: '',
      accessor: (row) => (
        <Tooltip label="View details" hasArrow>
          <IconButton
            as={NextLink}
            href={`/admin/rentals/${row.id}`}
            aria-label="View details"
            icon={<FiEye />}
            variant="ghost"
            size="sm"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      {/* Welcome Header */}
      <Box mb={8}>
        <Heading size="lg" color="text.primary" mb={1}>
          Welcome back, {user?.firstname}!
        </Heading>
        <Text color={textMuted}>
          Here&apos;s what&apos;s happening with your agency today.
        </Text>
      </Box>

      {/* Primary Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={5} mb={8}>
        <StatCard
          label="Total Cars"
          value={stats?.totalCars || 0}
          icon={FiTruck}
          iconBg="brand.400"
          change={12}
        />
        <StatCard
          label="Active Rentals"
          value={stats?.activeRentals || 0}
          icon={FiCalendar}
          iconBg="accent.400"
          change={8}
        />
        <StatCard
          label="Pending"
          value={stats?.pendingRentals || 0}
          icon={FiClock}
          iconBg="yellow.500"
          change={-5}
        />
        <StatCard
          label="Monthly Revenue"
          value={`$${(stats?.monthlyRevenue || 0).toLocaleString()}`}
          icon={FiDollarSign}
          iconBg="green.500"
          change={24}
        />
      </SimpleGrid>

      {/* Secondary Stats Row */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={5} mb={8}>
        {/* Fleet Utilization */}
        <Box
          bg={cardBg}
          p={5}
          borderRadius="xl"
          boxShadow="card"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold" color="text.primary">Fleet Utilization</Text>
            <Box p={2} bg="accent.400" borderRadius="lg">
              <Icon as={FiActivity} color="white" boxSize={4} />
            </Box>
          </Flex>
          <Text fontSize="2xl" fontWeight="bold" color="text.primary" mb={2}>
            {utilizationRate}%
          </Text>
          <Progress
            value={utilizationRate}
            size="sm"
            borderRadius="full"
            colorScheme="teal"
            bg={useColorModeValue('gray.100', 'navy.600')}
          />
          <HStack mt={3} spacing={4}>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color={textMuted}>Available</Text>
              <Text fontWeight="semibold" color="text.primary">{stats?.availableCars || 0}</Text>
            </VStack>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color={textMuted}>Rented</Text>
              <Text fontWeight="semibold" color="text.primary">{(stats?.totalCars || 0) - (stats?.availableCars || 0)}</Text>
            </VStack>
          </HStack>
        </Box>

        {/* Total Revenue */}
        <Box
          bg={cardBg}
          p={5}
          borderRadius="xl"
          boxShadow="card"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold" color="text.primary">Total Revenue</Text>
            <Box p={2} bg="green.500" borderRadius="lg">
              <Icon as={FiTrendingUp} color="white" boxSize={4} />
            </Box>
          </Flex>
          <Text fontSize="2xl" fontWeight="bold" color="text.primary" mb={1}>
            ${(stats?.totalRevenue || 0).toLocaleString()}
          </Text>
          <Text fontSize="sm" color={textMuted}>
            All time earnings
          </Text>
          <HStack mt={3} spacing={1}>
            <Icon as={FiTrendingUp} color="accent.400" boxSize={4} />
            <Text fontSize="sm" color="accent.400" fontWeight="medium">
              +18%
            </Text>
            <Text fontSize="sm" color={textMuted}>
              from last month
            </Text>
          </HStack>
        </Box>

        {/* Completed Rentals */}
        <Box
          bg={cardBg}
          p={5}
          borderRadius="xl"
          boxShadow="card"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold" color="text.primary">Completed Rentals</Text>
            <Box p={2} bg="blue.500" borderRadius="lg">
              <Icon as={FiCheckCircle} color="white" boxSize={4} />
            </Box>
          </Flex>
          <Text fontSize="2xl" fontWeight="bold" color="text.primary" mb={1}>
            {stats?.completedRentals || 0}
          </Text>
          <Text fontSize="sm" color={textMuted}>
            Successfully finished
          </Text>
          <Flex mt={3} gap={2} flexWrap="wrap">
            <Badge colorScheme="green" borderRadius="md">
              High satisfaction
            </Badge>
            <Badge colorScheme="blue" borderRadius="md">
              On-time returns
            </Badge>
          </Flex>
        </Box>
      </SimpleGrid>

      {/* Recent Rentals Table */}
      <Box
        bg={cardBg}
        borderRadius="xl"
        boxShadow="card"
        overflow="hidden"
      >
        <Flex
          px={5}
          py={4}
          borderBottom="1px solid"
          borderColor={cardBorder}
          justify="space-between"
          align="center"
        >
          <Heading size="md" color="text.primary">Recent Rentals</Heading>
          <Text
            as={NextLink}
            href="/admin/rentals"
            color="brand.400"
            fontSize="sm"
            fontWeight="medium"
            _hover={{ textDecoration: 'underline' }}
          >
            View all
          </Text>
        </Flex>
        <Box p={5}>
          <DataTable
            columns={rentalColumns}
            data={rentalsData?.data || []}
            isLoading={rentalsLoading}
            keyExtractor={(row) => row.id}
            emptyMessage="No rentals yet"
          />
        </Box>
      </Box>
    </Box>
  );
}
