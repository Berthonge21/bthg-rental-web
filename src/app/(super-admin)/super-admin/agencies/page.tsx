'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Button,
  HStack,
  IconButton,
  Text,
  Badge,
  VStack,
  useToast,
  useDisclosure,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiMoreVertical, FiEye } from 'react-icons/fi';
import { DataTable, LoadingSpinner, ConfirmDialog, type Column } from '@/components/ui';
import { useSuperAdminAgencies, useDeleteAgency } from '@/hooks';
import type { Agency, Status } from '@bthgrentalcar/sdk';

const statusColors: Record<Status, string> = {
  activate: 'green',
  deactivate: 'red',
};

export default function SuperAdminAgenciesPage() {
  const router = useRouter();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, isLoading } = useSuperAdminAgencies({ page, limit: 10 });
  const deleteMutation = useDeleteAgency();

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      toast({
        title: 'Agency deleted',
        status: 'success',
        duration: 3000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to delete agency',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const columns: Column<Agency>[] = [
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
      header: 'Address',
      accessor: (row) => <Text fontSize="sm">{row.address}</Text>,
    },
    {
      header: 'Phone',
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
              onClick={() => router.push(`/super-admin/agencies/${row.id}`)}
            >
              View
            </MenuItem>
            <MenuItem
              icon={<FiEdit2 />}
              onClick={() => router.push(`/super-admin/agencies/${row.id}`)}
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
        <Heading size="lg">Agencies</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          onClick={() => router.push('/super-admin/agencies/new')}
        >
          Add Agency
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
        searchPlaceholder="Search agencies..."
        keyExtractor={(row) => row.id}
        emptyMessage="No agencies found"
      />

      <ConfirmDialog
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={handleDelete}
        title="Delete Agency"
        message="Are you sure you want to delete this agency? This action cannot be undone."
        confirmText="Delete"
        isLoading={deleteMutation.isPending}
      />
    </Box>
  );
}
