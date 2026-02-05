'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  HStack,
  Badge,
  Text,
  VStack,
  Select,
  IconButton,
  useToast,
  Tooltip,
  Flex,
  Avatar,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiEye, FiCheck, FiX, FiPlay } from 'react-icons/fi';
import { DataTable, type Column } from '@/components/ui';
import { useAdminRentals, useUpdateRentalStatus } from '@/hooks';
import type { Rental, RentalStatus } from '@bthgrentalcar/sdk';
import { format } from 'date-fns';

const statusColors: Record<RentalStatus, string> = {
  reserved: 'yellow',
  ongoing: 'blue',
  completed: 'green',
  cancelled: 'red',
};

export default function AdminRentalsPage() {
  const router = useRouter();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<RentalStatus | ''>('');

  const cardBg = useColorModeValue('white', 'navy.700');
  const textMuted = useColorModeValue('text.muted', 'gray.400');

  const { data, isLoading } = useAdminRentals({
    page,
    limit: 10,
    status: statusFilter || undefined,
  });
  const updateStatusMutation = useUpdateRentalStatus();

  const handleStatusUpdate = async (id: number, status: RentalStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id, status });
      toast({
        title: 'Status updated',
        status: 'success',
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: 'Failed to update status',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const columns: Column<Rental>[] = [
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
            <Text fontWeight="semibold" color="text.primary" fontSize="sm">
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
          <Text fontWeight="medium" color="text.primary" fontSize="sm">
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
            {format(new Date(row.startDate), 'MMM d')} - {format(new Date(row.endDate), 'MMM d, yyyy')}
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
      header: 'Total',
      accessor: (row) => (
        <Text fontWeight="bold" color="brand.400">
          ${row.total.toFixed(2)}
        </Text>
      ),
    },
    {
      header: 'Actions',
      width: '140px',
      accessor: (row) => (
        <HStack spacing={1}>
          <Tooltip label="View Details" hasArrow>
            <IconButton
              icon={<FiEye />}
              aria-label="View Details"
              variant="ghost"
              size="sm"
              colorScheme="gray"
              onClick={() => router.push(`/admin/rentals/${row.id}`)}
            />
          </Tooltip>
          {row.status === 'reserved' && (
            <>
              <Tooltip label="Start Rental" hasArrow>
                <IconButton
                  icon={<FiPlay />}
                  aria-label="Start Rental"
                  variant="ghost"
                  size="sm"
                  colorScheme="blue"
                  onClick={() => handleStatusUpdate(row.id, 'ongoing' as RentalStatus)}
                  isLoading={updateStatusMutation.isPending}
                />
              </Tooltip>
              <Tooltip label="Cancel Rental" hasArrow>
                <IconButton
                  icon={<FiX />}
                  aria-label="Cancel"
                  variant="ghost"
                  size="sm"
                  colorScheme="red"
                  onClick={() => handleStatusUpdate(row.id, 'cancelled' as RentalStatus)}
                  isLoading={updateStatusMutation.isPending}
                />
              </Tooltip>
            </>
          )}
          {row.status === 'ongoing' && (
            <Tooltip label="Complete Rental" hasArrow>
              <IconButton
                icon={<FiCheck />}
                aria-label="Complete"
                variant="ghost"
                size="sm"
                colorScheme="green"
                onClick={() => handleStatusUpdate(row.id, 'completed' as RentalStatus)}
                isLoading={updateStatusMutation.isPending}
              />
            </Tooltip>
          )}
        </HStack>
      ),
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Flex
        justify="space-between"
        align="center"
        mb={6}
        flexWrap="wrap"
        gap={4}
      >
        <Box>
          <Heading size="lg" color="text.primary">Rentals</Heading>
          <Text color={textMuted} fontSize="sm" mt={1}>
            Manage and track all rental bookings
          </Text>
        </Box>
        <Select
          placeholder="All Statuses"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RentalStatus | '')}
          maxW="180px"
          bg={cardBg}
          borderRadius="lg"
          size="md"
        >
          <option value="reserved">Reserved</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </Flex>

      {/* Data Table */}
      <Box bg={cardBg} borderRadius="xl" boxShadow="card" overflow="hidden">
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          page={page}
          totalPages={data?.meta.totalPages || 1}
          onPageChange={setPage}
          keyExtractor={(row) => row.id}
          emptyMessage="No rentals found"
        />
      </Box>
    </Box>
  );
}
