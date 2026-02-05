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
  Flex,
  Icon,
  Progress,
  useColorModeValue,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import {
  FiGrid,
  FiTruck,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiUserCheck,
  FiPlus,
  FiTrendingUp,
  FiActivity,
  FiEye,
  FiAward,
} from 'react-icons/fi';
import NextLink from 'next/link';
import { StatCard, DataTable, LoadingSpinner, type Column } from '@/components/ui';
import { useSuperAdminDashboard, useSuperAdminAgencies, useSuperAdminUsers } from '@/hooks';
import { useAuthStore } from '@/stores/auth.store';
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
  const { user } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useSuperAdminDashboard();
  const { data: agenciesData, isLoading: agenciesLoading } = useSuperAdminAgencies({
    limit: 5,
  });
  const { data: adminsData, isLoading: adminsLoading } = useSuperAdminUsers({
    limit: 5,
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const cardBorder = useColorModeValue('gray.100', 'gray.700');
  const textMuted = useColorModeValue('gray.500', 'gray.400');

  if (statsLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  // Calculate platform growth (mock data for visual effect)
  const platformGrowth = 15;

  const agencyColumns: Column<Agency>[] = [
    {
      header: 'Agency',
      accessor: (row) => (
        <HStack spacing={3}>
          <Box
            w={10}
            h={10}
            borderRadius="xl"
            bgGradient="linear(135deg, brand.500, mauve.500)"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Icon as={FiGrid} color="white" boxSize={5} />
          </Box>
          <VStack align="start" spacing={0}>
            <Text fontWeight="medium" fontSize="sm">{row.name}</Text>
            <Text fontSize="xs" color={textMuted}>
              {row.email}
            </Text>
          </VStack>
        </HStack>
      ),
    },
    {
      header: 'Location',
      accessor: (row) => <Text fontSize="sm">{row.address}</Text>,
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
        >
          {row.status === 'activate' ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: '',
      accessor: (row) => (
        <Tooltip label="View details" hasArrow>
          <IconButton
            as={NextLink}
            href={`/super-admin/agencies/${row.id}`}
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

  const adminColumns: Column<AdminUser>[] = [
    {
      header: 'Admin',
      accessor: (row) => (
        <HStack spacing={3}>
          <Avatar
            size="sm"
            name={`${row.firstname} ${row.name}`}
            src={row.image}
            bg="linear-gradient(135deg, #6366f1, #d946ef)"
          />
          <VStack align="start" spacing={0}>
            <Text fontWeight="medium" fontSize="sm">{row.firstname} {row.name}</Text>
            <Text fontSize="xs" color={textMuted}>{row.email}</Text>
          </VStack>
        </HStack>
      ),
    },
    {
      header: 'Role',
      accessor: (row) => (
        <Badge
          colorScheme={roleColors[row.role]}
          textTransform="capitalize"
          borderRadius="full"
          px={3}
          py={1}
        >
          {row.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
        </Badge>
      ),
    },
    {
      header: 'Agency',
      accessor: (row) => (
        <Text fontSize="sm">
          {row.agency?.name || row.agencyName || (
            <Badge colorScheme="orange" variant="subtle" borderRadius="full">Not assigned</Badge>
          )}
        </Text>
      ),
    },
  ];

  return (
    <Box>
      {/* Header with Welcome and Quick Actions */}
      <Flex
        justify="space-between"
        align={{ base: 'flex-start', md: 'center' }}
        direction={{ base: 'column', md: 'row' }}
        gap={4}
        mb={8}
      >
        <Box>
          <Heading
            size="lg"
            bgGradient="linear(to-r, brand.500, mauve.500)"
            bgClip="text"
            mb={2}
          >
            Welcome back, {user?.firstname}!
          </Heading>
          <Text color={textMuted}>
            Platform overview and management dashboard.
          </Text>
        </Box>
        <HStack spacing={3}>
          <Button
            leftIcon={<FiPlus />}
            bgGradient="linear(135deg, brand.500, mauve.500)"
            color="white"
            _hover={{
              bgGradient: 'linear(135deg, brand.600, mauve.600)',
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            onClick={() => router.push('/super-admin/admins/new')}
          >
            Add Admin
          </Button>
          <Button
            leftIcon={<FiPlus />}
            variant="outline"
            borderColor="brand.500"
            color="brand.500"
            _hover={{
              bg: 'brand.50',
              transform: 'translateY(-2px)',
            }}
            onClick={() => router.push('/super-admin/agencies/new')}
          >
            Add Agency
          </Button>
        </HStack>
      </Flex>

      {/* Primary Stats Row */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={5} mb={8}>
        <StatCard
          label="Total Agencies"
          value={stats?.totalAgencies || 0}
          icon={FiGrid}
          iconBg="brand.400"
          change={platformGrowth}
        />
        <StatCard
          label="Total Cars"
          value={stats?.totalCars || 0}
          icon={FiTruck}
          iconBg="blue.500"
          change={8}
        />
        <StatCard
          label="Total Admins"
          value={stats?.totalAdmins || 0}
          icon={FiUserCheck}
          iconBg="orange.500"
          change={5}
        />
        <StatCard
          label="Total Revenue"
          value={`$${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={FiDollarSign}
          iconBg="green.500"
          change={24}
        />
      </SimpleGrid>

      {/* Secondary Stats Row */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
        {/* Active Agencies */}
        <Box
          bg={cardBg}
          p={5}
          borderRadius="xl"
          boxShadow="card"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold" color="text.primary">Active Agencies</Text>
            <Box p={2} bg="accent.400" borderRadius="lg">
              <Icon as={FiActivity} color="white" boxSize={4} />
            </Box>
          </Flex>
          <Text fontSize="2xl" fontWeight="bold" color="text.primary" mb={2}>
            {stats?.activeAgencies || 0}
          </Text>
          <Progress
            value={stats?.totalAgencies ? ((stats.activeAgencies || 0) / stats.totalAgencies) * 100 : 0}
            size="sm"
            borderRadius="full"
            colorScheme="teal"
            bg={useColorModeValue('gray.100', 'navy.600')}
          />
          <Text fontSize="xs" color={textMuted} mt={2}>
            {stats?.totalAgencies ? Math.round(((stats.activeAgencies || 0) / stats.totalAgencies) * 100) : 0}% of total agencies
          </Text>
        </Box>

        {/* Total Clients */}
        <Box
          bg={cardBg}
          p={5}
          borderRadius="xl"
          boxShadow="card"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold" color="text.primary">Total Clients</Text>
            <Box p={2} bg="blue.500" borderRadius="lg">
              <Icon as={FiUsers} color="white" boxSize={4} />
            </Box>
          </Flex>
          <Text fontSize="2xl" fontWeight="bold" color="text.primary" mb={1}>
            {stats?.totalClients || 0}
          </Text>
          <HStack mt={3} spacing={1}>
            <Icon as={FiTrendingUp} color="accent.400" boxSize={4} />
            <Text fontSize="sm" color="accent.400" fontWeight="medium">
              +12%
            </Text>
            <Text fontSize="sm" color={textMuted}>
              this month
            </Text>
          </HStack>
        </Box>

        {/* Rental Activity */}
        <Box
          bg={cardBg}
          p={5}
          borderRadius="xl"
          boxShadow="card"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold" color="text.primary">Rental Activity</Text>
            <Box p={2} bg="red.500" borderRadius="lg">
              <Icon as={FiCalendar} color="white" boxSize={4} />
            </Box>
          </Flex>
          <Text fontSize="2xl" fontWeight="bold" color="text.primary" mb={2}>
            {stats?.totalRentals || 0}
          </Text>
          <HStack spacing={4}>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color={textMuted}>Active</Text>
              <Text fontWeight="semibold" color="blue.500">{stats?.activeRentals || 0}</Text>
            </VStack>
            <VStack align="start" spacing={0}>
              <Text fontSize="xs" color={textMuted}>Pending</Text>
              <Text fontWeight="semibold" color="yellow.500">{stats?.pendingRentals || 0}</Text>
            </VStack>
          </HStack>
        </Box>

        {/* Monthly Revenue */}
        <Box
          bg={cardBg}
          p={5}
          borderRadius="xl"
          boxShadow="card"
        >
          <Flex justify="space-between" align="center" mb={4}>
            <Text fontWeight="semibold" color="text.primary">Monthly Revenue</Text>
            <Box p={2} bg="brand.400" borderRadius="lg">
              <Icon as={FiAward} color="white" boxSize={4} />
            </Box>
          </Flex>
          <Text fontSize="2xl" fontWeight="bold" color="text.primary" mb={1}>
            ${(stats?.monthlyRevenue || 0).toLocaleString()}
          </Text>
          <HStack mt={3} spacing={1}>
            <Icon as={FiTrendingUp} color="accent.400" boxSize={4} />
            <Text fontSize="sm" color="accent.400" fontWeight="medium">
              +18%
            </Text>
            <Text fontSize="sm" color={textMuted}>
              vs last month
            </Text>
          </HStack>
        </Box>
      </SimpleGrid>

      {/* Two Column Layout for Tables */}
      <SimpleGrid columns={{ base: 1, xl: 2 }} spacing={5}>
        {/* Recent Agencies */}
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
            <Heading size="md" color="text.primary">Recent Agencies</Heading>
            <Text
              as={NextLink}
              href="/super-admin/agencies"
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
              columns={agencyColumns}
              data={agenciesData?.data || []}
              isLoading={agenciesLoading}
              keyExtractor={(row) => row.id}
              emptyMessage="No agencies found"
            />
          </Box>
        </Box>

        {/* Admin Users */}
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
            <Heading size="md" color="text.primary">Admin Users</Heading>
            <Text
              as={NextLink}
              href="/super-admin/admins"
              color="brand.400"
              fontSize="sm"
              fontWeight="medium"
              _hover={{ textDecoration: 'underline' }}
            >
              View all
            </Text>
          </Flex>
          <Box p={6}>
            <DataTable
              columns={adminColumns}
              data={adminsData?.data || []}
              isLoading={adminsLoading}
              keyExtractor={(row) => row.id}
              emptyMessage="No admins found"
            />
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
