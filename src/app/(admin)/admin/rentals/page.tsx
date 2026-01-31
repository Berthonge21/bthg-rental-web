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
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useToast,
} from '@chakra-ui/react';
import { FiMoreVertical, FiEye, FiCheck, FiX, FiPlay } from 'react-icons/fi';
import { DataTable, LoadingSpinner, type Column } from '@/components/ui';
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
        <VStack align="start" spacing={0}>
          <Text fontWeight="medium">
            {row.car?.brand} {row.car?.model}
          </Text>
          <Text fontSize="sm" color="gray.500">
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
      accessor: (row) => (
        <Text fontWeight="semibold">${row.total.toFixed(2)}</Text>
      ),
    },
    {
      header: 'Actions',
      width: '80px',
      accessor: (row) => (
        <Menu>
          <MenuButton
            as={IconButton}
            icon={<FiMoreVertical />}
            variant="ghost"
            size="sm"
            aria-label="Actions"
          />
          <MenuList>
            <MenuItem
              icon={<FiEye />}
              onClick={() => router.push(`/admin/rentals/${row.id}`)}
            >
              View Details
            </MenuItem>
            {row.status === 'reserved' && (
              <>
                <MenuItem
                  icon={<FiPlay />}
                  onClick={() => handleStatusUpdate(row.id, 'ongoing' as RentalStatus)}
                >
                  Start Rental
                </MenuItem>
                <MenuItem
                  icon={<FiX />}
                  color="red.500"
                  onClick={() => handleStatusUpdate(row.id, 'cancelled' as RentalStatus)}
                >
                  Cancel
                </MenuItem>
              </>
            )}
            {row.status === 'ongoing' && (
              <MenuItem
                icon={<FiCheck />}
                color="green.500"
                onClick={() => handleStatusUpdate(row.id, 'completed' as RentalStatus)}
              >
                Complete
              </MenuItem>
            )}
          </MenuList>
        </Menu>
      ),
    },
  ];

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Rentals</Heading>
        <Select
          placeholder="All Statuses"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RentalStatus | '')}
          maxW="200px"
        >
          <option value="reserved">Reserved</option>
          <option value="ongoing">Ongoing</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </HStack>

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
  );
}
