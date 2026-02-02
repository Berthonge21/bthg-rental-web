'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  Avatar,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  FiGrid,
  FiTruck,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiUserCheck,
  FiPlus,
} from 'react-icons/fi';
import { StatCard, DataTable, LoadingSpinner, type Column } from '@/components/ui';
import { useSuperAdminDashboard, useSuperAdminAgencies, useSuperAdminUsers } from '@/hooks';
import type { Agency, AdminUser, Status, UserRole } from '@bthgrentalcar/sdk';

const statusColors: Record<Status, string> = {
  activate: 'green',
  deactivate: 'red',
};

const roleColors: Record<UserRole, string> = {
  admin: 'blue',
  superAdmin: 'purple',
};

export default function SuperAdminDashboardPage() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = useSuperAdminDashboard();
  const { data: agenciesData, isLoading: agenciesLoading } = useSuperAdminAgencies({
    limit: 5,
  });
  const { data: adminsData, isLoading: adminsLoading } = useSuperAdminUsers({
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

  const adminColumns: Column<AdminUser>[] = [
    {
      header: 'Admin',
      accessor: (row) => (
        <HStack spacing={3}>
          <Avatar size="sm" name={`${row.firstname} ${row.name}`} src={row.image} bg="brand.400" />
          <VStack align="start" spacing={0}>
            <Text fontWeight="medium">{row.firstname} {row.name}</Text>
            <Text fontSize="sm" color="gray.500">{row.email}</Text>
          </VStack>
        </HStack>
      ),
    },
    {
      header: 'Role',
      accessor: (row) => (
        <Badge colorScheme={roleColors[row.role]} textTransform="capitalize">
          {row.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
        </Badge>
      ),
    },
    {
      header: 'Agency',
      accessor: (row) => (
        <Text fontSize="sm">
          {row.agency?.name || row.agencyName || (
            <Badge colorScheme="orange" variant="subtle">Not assigned</Badge>
          )}
        </Text>
      ),
    },
  ];

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Super Admin Dashboard</Heading>
        <HStack spacing={3}>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="brand"
            onClick={() => router.push('/super-admin/admins/new')}
          >
            Add Admin
          </Button>
          <Button
            leftIcon={<FiPlus />}
            colorScheme="green"
            variant="outline"
            onClick={() => router.push('/super-admin/agencies/new')}
          >
            Add Agency
          </Button>
        </HStack>
      </HStack>

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

      {/* Two Column Layout for Lists */}
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={6}>
        {/* Recent Agencies */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Recent Agencies</Heading>
            <Button size="sm" variant="link" colorScheme="brand" onClick={() => router.push('/super-admin/agencies')}>
              View All
            </Button>
          </HStack>
          <DataTable
            columns={agencyColumns}
            data={agenciesData?.data || []}
            isLoading={agenciesLoading}
            keyExtractor={(row) => row.id}
            emptyMessage="No agencies found"
          />
        </Box>

        {/* Admin Users */}
        <Box>
          <HStack justify="space-between" mb={4}>
            <Heading size="md">Admin Users</Heading>
            <Button size="sm" variant="link" colorScheme="brand" onClick={() => router.push('/super-admin/admins')}>
              View All
            </Button>
          </HStack>
          <DataTable
            columns={adminColumns}
            data={adminsData?.data || []}
            isLoading={adminsLoading}
            keyExtractor={(row) => row.id}
            emptyMessage="No admins found"
          />
        </Box>
      </SimpleGrid>
    </Box>
  );
}
