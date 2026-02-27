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
  useColorModeValue,
  Avatar,
  IconButton,
  Tooltip,
  Button,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import {
  FiTruck,
  FiCalendar,
  FiDollarSign,
  FiClock,
  FiEye,
  FiCheckCircle,
  FiDownload,
  FiMoreHorizontal,
} from 'react-icons/fi';
import NextLink from 'next/link';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { DataTable, LoadingSpinner, type Column } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { exportAdminDashboard } from '@/hooks/useExportDashboard';

import { useAdminDashboard, useAdminRentals, useCars } from '@/hooks';
import { useAuthStore } from '@/stores/auth.store';
import type { Rental, RentalStatus } from '@berthonge21/sdk';
import { format } from 'date-fns';
import { useMemo } from 'react';

const MotionBox = motion.create(Box);

const statusColors: Record<RentalStatus, string> = {
  reserved: 'yellow',
  ongoing: 'blue',
  completed: 'green',
  cancelled: 'red',
};

// Chart colors
const DONUT_COLORS = ['#C9A227', '#1BC5BD', '#0B1C2D', '#6366F1'];
const BAR_COLORS = {
  revenue: '#1BC5BD',
  rentals: '#C9A227',
};

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { data: stats, isLoading: statsLoading } = useAdminDashboard();
  const { data: rentalsData, isLoading: rentalsLoading } = useAdminRentals({ limit: 5 });
  const { data: carsData } = useCars();

  const cardBg = useColorModeValue('white', 'navy.700');
  const cardBorder = useColorModeValue('gray.100', 'navy.600');
  const textMuted = useColorModeValue('text.muted', 'gray.400');
  const gridStroke = useColorModeValue('#E2E8F0', '#2D3748');
  const axisTickColor = useColorModeValue('#718096', '#A0AEC0');

  // Calculate car type distribution from real data (by fuel type)
  const carTypeData = useMemo(() => {
    if (!carsData?.data?.length) return [];

    const fuelCounts: Record<string, number> = {};
    carsData.data.forEach((car) => {
      const fuel = car.fuel || 'Unknown';
      fuelCounts[fuel] = (fuelCounts[fuel] || 0) + 1;
    });

    return Object.entries(fuelCounts).map(([name, value], index) => ({
      name,
      value,
      color: DONUT_COLORS[index % DONUT_COLORS.length],
    }));
  }, [carsData]);

  // Calculate rental status from real stats
  const rentalStatusData = useMemo(() => {
    const data = [
      { name: 'Completed', value: stats?.completedRentals || 0, color: DONUT_COLORS[1] },
      { name: 'Ongoing', value: stats?.activeRentals || 0, color: DONUT_COLORS[0] },
      { name: 'Reserved', value: stats?.pendingRentals || 0, color: DONUT_COLORS[3] },
    ];
    return data.filter(item => item.value > 0);
  }, [stats]);

  // Revenue data - using stats or placeholder for months without data
  const revenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();

    // Create monthly data, showing current month with actual revenue
    return months.slice(0, currentMonth + 1).map((month, index) => ({
      month,
      revenue: index === currentMonth ? (stats?.monthlyRevenue || 0) : Math.floor(Math.random() * 15000) + 5000,
      rentals: index === currentMonth ? (stats?.totalRentals || 0) : Math.floor(Math.random() * 50) + 20,
    }));
  }, [stats]);

  // Derive stat-card change % from real data (no previous-period data in API)
  // active/available/pending → rate relative to fleet or total rentals
  // revenue → current month vs year-to-date monthly average
  const statChanges = useMemo(() => {
    const totalRentals = Math.max(stats?.totalRentals || 0, 1);
    const totalCars    = Math.max(stats?.totalCars    || 0, 1);
    const monthsElapsed = Math.max(new Date().getMonth() + 1, 1);
    const avgMonthly   = (stats?.totalRevenue || 0) / monthsElapsed;
    const revenueChange = avgMonthly > 0
      ? parseFloat((((stats?.monthlyRevenue || 0) - avgMonthly) / avgMonthly * 100).toFixed(1))
      : undefined;
    return {
      active:    parseFloat(((stats?.activeRentals  || 0) / totalRentals * 100).toFixed(1)),
      available: parseFloat(((stats?.availableCars  || 0) / totalCars    * 100).toFixed(1)),
      pending:   parseFloat(((stats?.pendingRentals || 0) / totalRentals * 100).toFixed(1)),
      revenue:   revenueChange,
    };
  }, [stats]);

  if (statsLoading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

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
          <Text fontWeight="medium" fontSize="sm" color="text.primary">
            {row.client?.firstname} {row.client?.name}
          </Text>
        </HStack>
      ),
    },
    {
      header: 'Car',
      accessor: (row) => (
        <Text fontSize="sm" color="text.primary">
          {row.car?.brand} {row.car?.model}
        </Text>
      ),
    },
    {
      header: 'Period',
      accessor: (row) => (
        <Text fontSize="sm" color="text.secondary">
          {format(new Date(row.startDate), 'MMM d')} - {format(new Date(row.endDate), 'MMM d')}
        </Text>
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
      header: 'Total',
      accessor: (row) => (
        <Text fontWeight="bold" color="text.primary">
          ${row.total.toFixed(0)}
        </Text>
      ),
    },
    {
      header: '',
      width: '50px',
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
      {/* Header Row */}
      <Flex justify="space-between" align="flex-end" mb={8} flexWrap="wrap" gap={4}>
        <Box>
          <Box w="32px" h="2px" bg="brand.400" mb={3} borderRadius="full" />
          <Text fontSize="xs" fontWeight="bold" color="brand.400" textTransform="uppercase" letterSpacing="widest" mb={1}>
            {t('dashboard.adminPanel')}
          </Text>
          <Text
            fontFamily="var(--font-display)"
            fontSize="3xl"
            fontWeight="black"
            letterSpacing="0.02em"
            textTransform="uppercase"
            color="gray.500"
          >
            {t('dashboard.welcome', { name: user?.firstname })}
          </Text>
          <Text fontSize="sm" color="gray.500" mt={1}>{t('dashboard.subtitle')}</Text>
        </Box>
        <Button
          size="sm"
          bg="brand.400"
          color="#000000"
          fontWeight="semibold"
          leftIcon={<FiDownload />}
          _hover={{ bg: 'lightGold.400' }}
          onClick={() => exportAdminDashboard({ rentals: rentalsData?.data ?? [], cars: carsData?.data ?? [], stats })}
        >
          {t('common.export')}
        </Button>
      </Flex>

      {/* Top Stats Row - 5 cards */}
      <SimpleGrid columns={{ base: 2, md: 3, lg: 5 }} spacing={4} mb={6}>
        {([
          { label: t('dashboard.totalCars'),      value: stats?.totalCars || 0,      icon: FiTruck,       iconColor: '#FFD700', iconBg: 'rgba(255,215,0,0.1)'    },
          { label: t('dashboard.activeRentals'),  value: stats?.activeRentals || 0,  icon: FiCalendar,    iconColor: '#1BC5BD', iconBg: 'rgba(27,197,189,0.1)',  change: statChanges.active },
          { label: t('dashboard.available'),       value: stats?.availableCars || 0,  icon: FiCheckCircle, iconColor: '#68D391', iconBg: 'rgba(104,211,145,0.1)', change: statChanges.available },
          { label: t('dashboard.pending'),         value: stats?.pendingRentals || 0, icon: FiClock,       iconColor: '#F6AD55', iconBg: 'rgba(246,173,85,0.1)',  change: statChanges.pending },
          { label: t('dashboard.monthlyRevenue'), value: `$${(stats?.monthlyRevenue || 0).toLocaleString()}`, icon: FiDollarSign, iconColor: '#6366F1', iconBg: 'rgba(99,102,241,0.1)', valueColor: 'accent.400', change: statChanges.revenue },
        ] as Array<{ label: string; value: string | number; icon: React.ElementType; iconColor: string; iconBg: string; change?: number; valueColor?: string }>).map((card, i) => (
          <MotionBox
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <StatCardMini
              label={card.label}
              value={card.value}
              icon={card.icon}
              change={card.change}
              cardBg={cardBg}
              textMuted={textMuted}
              valueColor={card.valueColor}
              iconColor={card.iconColor}
              iconBg={card.iconBg}
            />
          </MotionBox>
        ))}
      </SimpleGrid>

      {/* Charts Row - 3 columns */}
      <Grid templateColumns={{ base: '1fr', lg: '1fr 2fr 1fr' }} gap={4} mb={6}>
        {/* Car Types Donut Chart */}
        <GridItem>
          <Box bg={cardBg} borderRadius="xl" boxShadow="card" p={5} h="full">
            <Flex justify="space-between" align="center" mb={4}>
              <Text fontWeight="semibold" color="text.primary">{t('dashboard.carTypes')}</Text>
              <IconButton
                icon={<FiMoreHorizontal />}
                aria-label="More"
                variant="ghost"
                size="sm"
              />
            </Flex>
            <Box h="200px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={carTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {carTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <SimpleGrid columns={2} spacing={2} mt={4}>
              {carTypeData.map((item) => (
                <HStack key={item.name} spacing={2}>
                  <Box w={2} h={2} borderRadius="full" bg={item.color} />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="xs" color={textMuted}>{item.name}</Text>
                    <Text fontSize="sm" fontWeight="semibold" color="text.primary">{item.value}</Text>
                  </VStack>
                </HStack>
              ))}
            </SimpleGrid>
          </Box>
        </GridItem>

        {/* Revenue Overview Bar Chart */}
        <GridItem>
          <Box bg={cardBg} borderRadius="xl" boxShadow="card" p={5} h="full">
            <Flex justify="space-between" align="center" mb={4}>
              <Box>
                <Text fontWeight="semibold" color="text.primary" mb={1}>{t('dashboard.revenueOverview')}</Text>
                <HStack spacing={2}>
                  <Text fontSize="2xl" fontWeight="bold" color="text.primary">
                    ${(stats?.totalRevenue || 89483).toLocaleString()}
                  </Text>
                  <Badge colorScheme="red" fontSize="xs">-12%</Badge>
                </HStack>
              </Box>
              <HStack spacing={4} fontSize="xs">
                <HStack spacing={1}>
                  <Box w={2} h={2} borderRadius="full" bg={BAR_COLORS.revenue} />
                  <Text color={textMuted}>Revenue</Text>
                </HStack>
                <HStack spacing={1}>
                  <Box w={2} h={2} borderRadius="full" bg={BAR_COLORS.rentals} />
                  <Text color={textMuted}>Rentals</Text>
                </HStack>
              </HStack>
            </Flex>
            <Box h="220px">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} fontSize={12} tick={{ fill: axisTickColor }} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} tick={{ fill: axisTickColor }} />
                  <RechartsTooltip />
                  <Bar dataKey="revenue" fill={BAR_COLORS.revenue} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="rentals" fill={BAR_COLORS.rentals} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        </GridItem>

        {/* Rental Status Donut Chart */}
        <GridItem>
          <Box bg={cardBg} borderRadius="xl" boxShadow="card" p={5} h="full">
            <Text fontWeight="semibold" color="text.primary" mb={4}>{t('dashboard.rentalStatus')}</Text>
            <Box h="180px">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rentalStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {rentalStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </Box>
            <VStack spacing={2} align="stretch" mt={2}>
              {rentalStatusData.map((item) => (
                <Flex key={item.name} justify="space-between" align="center">
                  <HStack spacing={2}>
                    <Box w={2} h={2} borderRadius="full" bg={item.color} />
                    <Text fontSize="sm" color={textMuted}>{item.name}</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="semibold" color="text.primary">{item.value}</Text>
                </Flex>
              ))}
            </VStack>
          </Box>
        </GridItem>
      </Grid>

      {/* Action Center Table */}
      <Box bg={cardBg} borderRadius="xl" boxShadow="card" overflow="hidden">
        <Flex
          px={5}
          py={4}
          borderBottom="1px solid"
          borderColor={cardBorder}
          justify="space-between"
          align="center"
        >
          <Text fontWeight="semibold" color="text.primary" fontSize="lg">
            {t('dashboard.allRentals')}
          </Text>
          <Button
            as={NextLink}
            href="/admin/rentals"
            size="sm"
            variant="outline"
            borderColor={cardBorder}
          >
            {t('common.seeAll')}
          </Button>
        </Flex>
        <Box p={5}>
          <DataTable
            columns={rentalColumns}
            data={rentalsData?.data || []}
            isLoading={rentalsLoading}
            keyExtractor={(row) => row.id}
            emptyMessage="No recent rentals"
          />
        </Box>
      </Box>
    </Box>
  );
}

// Mini stat card component
function StatCardMini({
  label,
  value,
  icon,
  change,
  cardBg,
  textMuted,
  valueColor = 'text.primary',
  iconColor = '#FFD700',
  iconBg = 'rgba(255,215,0,0.1)',
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  change?: number;
  cardBg: string;
  textMuted: string;
  valueColor?: string;
  iconColor?: string;
  iconBg?: string;
}) {
  const isPositive = change && change > 0;

  return (
    <Box
      bg={cardBg}
      borderRadius="xl"
      boxShadow="card"
      p={4}
      position="relative"
      overflow="hidden"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'cardHover' }}
    >
      <Box position="absolute" left={0} top={0} bottom={0} w="3px" bg={iconColor} borderLeftRadius="xl" />
      <Flex justify="space-between" align="flex-start" mb={3}>
        <Text fontSize="sm" color={textMuted} fontWeight="medium">
          {label}
        </Text>
        <Box
          w={8} h={8}
          borderRadius="lg"
          bg={iconBg}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexShrink={0}
        >
          <Icon as={icon} color={iconColor} boxSize={4} />
        </Box>
      </Flex>
      <HStack spacing={2} align="baseline">
        <Text fontSize="2xl" fontWeight="bold" color={valueColor}>
          {value}
        </Text>
        {change !== undefined && (
          <Text
            fontSize="xs"
            color={isPositive ? 'green.500' : 'red.500'}
            fontWeight="medium"
          >
            {isPositive ? '+' : ''}{change}%
          </Text>
        )}
      </HStack>
    </Box>
  );
}
