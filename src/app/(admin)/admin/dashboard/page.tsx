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

const statusIcons: Record<RentalStatus, typeof FiClock> = {
  reserved: FiClock,
  ongoing: FiActivity,
  completed: FiCheckCircle,
  cancelled: FiClock,
};

export default function AdminDashboardPage() {
  const { user } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useAdminDashboard();
  const { data: rentalsData, isLoading: rentalsLoading } = useAdminRentals({ limit: 5 });

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.100', 'gray.700');
  const textMuted = useColorModeValue('gray.500', 'gray.400');

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
            bg="linear-gradient(135deg, #6366f1, #d946ef)"
          />
          <VStack align="start" spacing={0}>
            <Text fontWeight="medium" fontSize="sm">
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
          <Text fontWeight="medium" fontSize="sm">
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
          <Text fontSize="sm">
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
          borderRadius="full"
          px={3}
          py={1}
          display="flex"
          alignItems="center"
          gap={1}
        >
          <Icon as={statusIcons[row.status]} boxSize={3} />
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Amount',
      accessor: (row) => (
        <Text fontWeight="bold" color="brand.500">
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
            borderRadius="full"
          />
        </Tooltip>
      ),
    },
  ];

  return (
    <Box>
      {/* Welcome Header */}
      <Box mb={8}>
        <Heading
          size="lg"
          bgGradient="linear(to-r, brand.500, mauve.500)"
          bgClip="text"
          mb={2}
        >
          Welcome back, {user?.firstname}!
        </Heading>
        <Text color={textMuted}>
          Here&apos;s what&apos;s happening with your agency today.
        </Text>
      </Box>

      {/* Primary Stats Grid - Mixed variants for visual interest */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={6} mb={8}>
        <StatCard
          label="Total Cars"
          value={stats?.totalCars || 0}
          icon={FiTruck}
          variant="gradient"
          gradientFrom="brand.500"
          gradientTo="ocean.500"
          change={12}
        />
        <StatCard
          label="Active Rentals"
          value={stats?.activeRentals || 0}
          icon={FiCalendar}
          variant="glass"
          gradientFrom="green.400"
          gradientTo="teal.400"
          change={8}
        />
        <StatCard
          label="Pending"
          value={stats?.pendingRentals || 0}
          icon={FiClock}
          variant="glass"
          gradientFrom="yellow.400"
          gradientTo="orange.400"
          change={-5}
        />
        <StatCard
          label="Monthly Revenue"
          value={`$${(stats?.monthlyRevenue || 0).toLocaleString()}`}
          icon={FiDollarSign}
          variant="gradient"
          gradientFrom="mauve.500"
          gradientTo="brand.500"
          change={24}
        />
      </SimpleGrid>

      {/* Secondary Stats Row */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        {/* Fleet Utilization */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="2xl"
          border="1px solid"
          borderColor={cardBorder}
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold">Fleet Utilization</Text>
            <Box
              p={2}
              bgGradient="linear(135deg, brand.500, mauve.500)"
              borderRadius="lg"
            >
              <Icon as={FiActivity} color="white" boxSize={4} />
            </Box>
          </Flex>
          <Text fontSize="3xl" fontWeight="bold" mb={2}>
            {utilizationRate}%
          </Text>
          <Progress
            value={utilizationRate}
            size="sm"
            borderRadius="full"
            colorScheme="brand"
            bg={useColorModeValue('gray.100', 'gray.700')}
          />
          <HStack mt={3} spacing={4}>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color={textMuted}>Available</Text>
              <Text fontWeight="semibold">{stats?.availableCars || 0}</Text>
            </VStack>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color={textMuted}>Rented</Text>
              <Text fontWeight="semibold">{(stats?.totalCars || 0) - (stats?.availableCars || 0)}</Text>
            </VStack>
          </HStack>
        </Box>

        {/* Total Revenue */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="2xl"
          border="1px solid"
          borderColor={cardBorder}
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold">Total Revenue</Text>
            <Box
              p={2}
              bgGradient="linear(135deg, green.400, teal.400)"
              borderRadius="lg"
            >
              <Icon as={FiTrendingUp} color="white" boxSize={4} />
            </Box>
          </Flex>
          <Text fontSize="3xl" fontWeight="bold" mb={1}>
            ${(stats?.totalRevenue || 0).toLocaleString()}
          </Text>
          <Text fontSize="sm" color={textMuted}>
            All time earnings
          </Text>
          <HStack mt={4} spacing={1}>
            <Icon as={FiTrendingUp} color="green.500" boxSize={4} />
            <Text fontSize="sm" color="green.500" fontWeight="medium">
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
          p={6}
          borderRadius="2xl"
          border="1px solid"
          borderColor={cardBorder}
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold">Completed Rentals</Text>
            <Box
              p={2}
              bgGradient="linear(135deg, blue.400, purple.400)"
              borderRadius="lg"
            >
              <Icon as={FiCheckCircle} color="white" boxSize={4} />
            </Box>
          </Flex>
          <Text fontSize="3xl" fontWeight="bold" mb={1}>
            {stats?.completedRentals || 0}
          </Text>
          <Text fontSize="sm" color={textMuted}>
            Successfully finished
          </Text>
          <Flex mt={4} gap={2} flexWrap="wrap">
            <Badge colorScheme="green" borderRadius="full" px={2}>
              High satisfaction
            </Badge>
            <Badge colorScheme="blue" borderRadius="full" px={2}>
              On-time returns
            </Badge>
          </Flex>
        </Box>
      </SimpleGrid>

      {/* Recent Rentals Table */}
      <Box
        bg={cardBg}
        borderRadius="2xl"
        border="1px solid"
        borderColor={cardBorder}
        overflow="hidden"
      >
        <Flex
          px={6}
          py={4}
          borderBottom="1px solid"
          borderColor={cardBorder}
          justify="space-between"
          align="center"
        >
          <Heading size="md">Recent Rentals</Heading>
          <Text
            as={NextLink}
            href="/admin/rentals"
            color="brand.500"
            fontSize="sm"
            fontWeight="medium"
            _hover={{ textDecoration: 'underline' }}
          >
            View all
          </Text>
        </Flex>
        <Box p={6}>
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
