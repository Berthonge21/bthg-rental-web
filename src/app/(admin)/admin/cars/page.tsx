'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Button,
  HStack,
  IconButton,
  Image,
  Text,
  useToast,
  useDisclosure,
  Tooltip,
  Flex,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiCalendar } from 'react-icons/fi';
import { DataTable, LoadingSpinner, ConfirmDialog, type Column } from '@/components/ui';
import { useCars, useDeleteCar } from '@/hooks';
import { useAuthStore } from '@/stores/auth.store';
import type { Car } from '@bthgrentalcar/sdk';

export default function AdminCarsPage() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const cardBg = useColorModeValue('white', 'navy.700');
  const textMuted = useColorModeValue('text.muted', 'gray.400');

  // Filter by agency for admin users
  const agencyId = user?.role === 'superAdmin' ? undefined : user?.agency?.id;
  const { data, isLoading } = useCars({ page, limit: 10, agencyId });
  const deleteMutation = useDeleteCar();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast({
        title: 'Car deleted',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to delete car',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const columns: Column<Car>[] = [
    {
      header: 'Car',
      accessor: (row) => (
        <HStack spacing={3}>
          <Image
            src={row.image || '/placeholder-car.jpg'}
            alt={`${row.brand} ${row.model}`}
            boxSize="50px"
            objectFit="cover"
            borderRadius="lg"
            fallbackSrc="https://via.placeholder.com/50"
          />
          <Box>
            <Text fontWeight="semibold" color="text.primary">
              {row.brand} {row.model}
            </Text>
            <Text fontSize="sm" color={textMuted}>
              {row.year} • {row.registration}
            </Text>
          </Box>
        </HStack>
      ),
    },
    {
      header: 'Details',
      accessor: (row) => (
        <Box>
          <Text fontSize="sm" color="text.primary">{row.fuel}</Text>
          <Text fontSize="sm" color={textMuted}>
            {row.gearBox} • {row.door} doors
          </Text>
        </Box>
      ),
    },
    {
      header: 'Price',
      accessor: (row) => (
        <Text fontWeight="bold" color="brand.400">
          ${row.price}/day
        </Text>
      ),
    },
    {
      header: 'Mileage',
      accessor: (row) => (
        <Text color="text.secondary">{row.mileage.toLocaleString()} km</Text>
      ),
    },
    {
      header: 'Actions',
      width: '160px',
      accessor: (row) => (
        <HStack spacing={1}>
          <Tooltip label="View Details" hasArrow>
            <IconButton
              icon={<FiEye />}
              aria-label="View"
              variant="ghost"
              size="sm"
              colorScheme="gray"
              onClick={() => router.push(`/admin/cars/${row.id}`)}
            />
          </Tooltip>
          <Tooltip label="Manage Availability" hasArrow>
            <IconButton
              icon={<FiCalendar />}
              aria-label="Availability"
              variant="ghost"
              size="sm"
              colorScheme="teal"
              onClick={() => router.push(`/admin/cars/${row.id}/availability`)}
            />
          </Tooltip>
          <Tooltip label="Edit Car" hasArrow>
            <IconButton
              icon={<FiEdit2 />}
              aria-label="Edit"
              variant="ghost"
              size="sm"
              colorScheme="blue"
              onClick={() => router.push(`/admin/cars/${row.id}/edit`)}
            />
          </Tooltip>
          <Tooltip label="Delete Car" hasArrow>
            <IconButton
              icon={<FiTrash2 />}
              aria-label="Delete"
              variant="ghost"
              size="sm"
              colorScheme="red"
              onClick={() => {
                setDeleteId(row.id);
                onOpen();
              }}
            />
          </Tooltip>
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
          <Heading size="lg" color="text.primary">Cars</Heading>
          <Text color={textMuted} fontSize="sm" mt={1}>
            Manage your fleet of vehicles
          </Text>
        </Box>
        <Button
          leftIcon={<FiPlus />}
          bg="brand.400"
          color="white"
          _hover={{ bg: 'brand.500' }}
          onClick={() => router.push('/admin/cars/new')}
        >
          Add Car
        </Button>
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
          searchValue={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search cars..."
          keyExtractor={(row) => row.id}
          emptyMessage="No cars found"
        />
      </Box>

      <ConfirmDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleDelete}
        title="Delete Car"
        message="Are you sure you want to delete this car? This action cannot be undone."
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </Box>
  );
}
