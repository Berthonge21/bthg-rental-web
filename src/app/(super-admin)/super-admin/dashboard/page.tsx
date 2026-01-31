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
import {
  FiGrid,
  FiTruck,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiUserCheck,
} from 'react-icons/fi';
import { StatCard, DataTable, LoadingSpinner, type Column } from '@/components/ui';
import { useSuperAdminDashboard, useSuperAdminAgencies } from '@/hooks';
import type { Agency, Status } from '@bthgrentalcar/sdk';

const statusColors: Record<Status, string> = {
  activate: 'green',
  deactivate: 'red',
};

export default function SuperAdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useSuperAdminDashboard();
  const { data: agenciesData, isLoading: agenciesLoading } = useSuperAdminAgencies({
    limit: 5,
  });

  const cardBg = useColorModeValue('white', 'gray.800');

  if (statsLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  const agencyColumns: Column<Agency>[] = [
    {
      header: 'Agency',
      accessor: (row) => (
        <VStack align="start" spacing={0}>
          <Text fontWeight="medium">{row.name}</Text>
          <Text fontSize="sm" color="gray.500">
            {row.email}
          </Text>
        </VStack>
      ),
    },
    {
      header: 'Location',
      accessor: (row) => <Text fontSize="sm">{row.address}</Text>,
    },
    {
      header: 'Contact',
      accessor: (row) => <Text fontSize="sm">{row.telephone}</Text>,
    },
    {
      header: 'Status',
      accessor: (row) => (
        <Badge colorScheme={statusColors[row.status]} textTransform="capitalize">
          {row.status}
        </Badge>
      ),
    },
  ];

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Super Admin Dashboard
      </Heading>

      {/* Stats Grid */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3, xl: 6 }} spacing={4} mb={8}>
        <StatCard
          label="Total Agencies"
          value={stats?.totalAgencies || 0}
          icon={FiGrid}
          iconBg="purple.400"
        />
        <StatCard
          label="Active Agencies"
          value={stats?.activeAgencies || 0}
          icon={FiGrid}
          iconBg="green.400"
        />
        <StatCard
          label="Total Cars"
          value={stats?.totalCars || 0}
          icon={FiTruck}
          iconBg="blue.400"
        />
        <StatCard
          label="Total Admins"
          value={stats?.totalAdmins || 0}
          icon={FiUserCheck}
          iconBg="orange.400"
        />
        <StatCard
          label="Total Clients"
          value={stats?.totalClients || 0}
          icon={FiUsers}
          iconBg="teal.400"
        />
        <StatCard
          label="Total Rentals"
          value={stats?.totalRentals || 0}
          icon={FiCalendar}
          iconBg="pink.400"
        />
      </SimpleGrid>

      {/* Revenue Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Text color="gray.500" fontSize="sm" mb={2}>
            Pending Rentals
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="yellow.500">
            {stats?.pendingRentals || 0}
          </Text>
        </Box>
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Text color="gray.500" fontSize="sm" mb={2}>
            Active Rentals
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="blue.500">
            {stats?.activeRentals || 0}
          </Text>
        </Box>
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Text color="gray.500" fontSize="sm" mb={2}>
            Monthly Revenue
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="green.500">
            ${stats?.monthlyRevenue?.toFixed(2) || '0.00'}
          </Text>
        </Box>
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Text color="gray.500" fontSize="sm" mb={2}>
            Total Revenue
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="purple.500">
            ${stats?.totalRevenue?.toFixed(2) || '0.00'}
          </Text>
        </Box>
      </SimpleGrid>

      {/* Recent Agencies */}
      <Box>
        <Heading size="md" mb={4}>
          Recent Agencies
        </Heading>
        <DataTable
          columns={agencyColumns}
          data={agenciesData?.data || []}
          isLoading={agenciesLoading}
          keyExtractor={(row) => row.id}
          emptyMessage="No agencies found"
        />
      </Box>
    </Box>
  );
}
