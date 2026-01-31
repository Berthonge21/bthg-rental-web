'use client';

import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Badge,
  HStack,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiTruck, FiCalendar, FiDollarSign, FiClock } from 'react-icons/fi';
import { StatCard, DataTable, LoadingSpinner, type Column } from '@/components/ui';
import { useAdminDashboard, useAdminRentals } from '@/hooks';
import type { Rental, RentalStatus } from '@bthgrentalcar/sdk';
import { format } from 'date-fns';

const statusColors: Record<RentalStatus, string> = {
  reserved: 'yellow',
  ongoing: 'blue',
  completed: 'green',
  cancelled: 'red',
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useAdminDashboard();
  const { data: rentalsData, isLoading: rentalsLoading } = useAdminRentals({ limit: 5 });

  const cardBg = useColorModeValue('white', 'gray.800');

  if (statsLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const rentalColumns: Column<Rental>[] = [
    {
      header: 'Client',
      accessor: (row) => (
        <VStack align="start" spacing={0}>
          <Text fontWeight="medium">
            {row.client?.firstname} {row.client?.name}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {row.client?.email}
          </Text>
        </VStack>
      ),
    },
    {
      header: 'Car',
      accessor: (row) => (
        <Text>
          {row.car?.brand} {row.car?.model}
        </Text>
      ),
    },
    {
      header: 'Dates',
      accessor: (row) => (
        <VStack align="start" spacing={0}>
          <Text fontSize="sm">
            {format(new Date(row.startDate), 'MMM d, yyyy')}
          </Text>
          <Text fontSize="sm" color="gray.500">
            to {format(new Date(row.endDate), 'MMM d, yyyy')}
          </Text>
        </VStack>
      ),
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge colorScheme={statusColors[row.status]} textTransform="capitalize">
          {row.status}
        </Badge>
      ),
    },
    {
      header: 'Total',
      accessor: (row) => <Text fontWeight="medium">${row.total.toFixed(2)}</Text>,
    },
  ];

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Dashboard
      </Heading>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <StatCard
          label="Total Cars"
          value={stats?.totalCars || 0}
          icon={FiTruck}
          iconBg="blue.400"
        />
        <StatCard
          label="Active Rentals"
          value={stats?.activeRentals || 0}
          icon={FiCalendar}
          iconBg="green.400"
        />
        <StatCard
          label="Pending Rentals"
          value={stats?.pendingRentals || 0}
          icon={FiClock}
          iconBg="yellow.400"
        />
        <StatCard
          label="Monthly Revenue"
          value={`$${stats?.monthlyRevenue?.toFixed(2) || '0.00'}`}
          icon={FiDollarSign}
          iconBg="purple.400"
        />
      </SimpleGrid>

      {/* Quick Stats */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Text color="gray.500" fontSize="sm" mb={2}>
            Available Cars
          </Text>
          <HStack>
            <Text fontSize="2xl" fontWeight="bold">
              {stats?.availableCars || 0}
            </Text>
            <Text color="gray.500">/ {stats?.totalCars || 0}</Text>
          </HStack>
        </Box>
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Text color="gray.500" fontSize="sm" mb={2}>
            Completed Rentals
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {stats?.completedRentals || 0}
          </Text>
        </Box>
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Text color="gray.500" fontSize="sm" mb={2}>
            Total Revenue
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            ${stats?.totalRevenue?.toFixed(2) || '0.00'}
          </Text>
        </Box>
      </SimpleGrid>

      {/* Recent Rentals */}
      <Box>
        <Heading size="md" mb={4}>
          Recent Rentals
        </Heading>
        <DataTable
          columns={rentalColumns}
          data={rentalsData?.data || []}
          isLoading={rentalsLoading}
          keyExtractor={(row) => row.id}
          emptyMessage="No rentals yet"
        />
      </Box>
    </Box>
  );
}
