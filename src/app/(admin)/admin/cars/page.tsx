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
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiMoreVertical, FiEye } from 'react-icons/fi';
import { DataTable, LoadingSpinner, ConfirmDialog, type Column } from '@/components/ui';
import { useCars, useDeleteCar } from '@/hooks';
import type { Car } from '@bthgrentalcar/sdk';

export default function AdminCarsPage() {
  const router = useRouter();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, isLoading } = useCars({ page, limit: 10 });
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
            borderRadius="md"
            fallbackSrc="https://via.placeholder.com/50"
          />
          <Box>
            <Text fontWeight="medium">
              {row.brand} {row.model}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {row.year} - {row.registration}
            </Text>
          </Box>
        </HStack>
      ),
    },
    {
      header: 'Details',
      accessor: (row) => (
        <Box>
          <Text fontSize="sm">{row.fuel}</Text>
          <Text fontSize="sm" color="gray.500">
            {row.gearBox} - {row.door} doors
          </Text>
        </Box>
      ),
    },
    {
      header: 'Price',
      accessor: (row) => (
        <Text fontWeight="semibold" color="brand.500">
          ${row.price}/day
        </Text>
      ),
    },
    {
      header: 'Mileage',
      accessor: (row) => <Text>{row.mileage.toLocaleString()} km</Text>,
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
              onClick={() => router.push(`/admin/cars/${row.id}`)}
            >
              View
            </MenuItem>
            <MenuItem
              icon={<FiEdit2 />}
              onClick={() => router.push(`/admin/cars/${row.id}/edit`)}
            >
              Edit
            </MenuItem>
            <MenuItem
              icon={<FiTrash2 />}
              color="red.500"
              onClick={() => {
                setDeleteId(row.id);
                onOpen();
              }}
            >
              Delete
            </MenuItem>
          </MenuList>
        </Menu>
      ),
    },
  ];

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Cars</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          onClick={() => router.push('/admin/cars/new')}
        >
          Add Car
        </Button>
      </HStack>

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
