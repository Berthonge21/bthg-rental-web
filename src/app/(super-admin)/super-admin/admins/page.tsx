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
  Avatar,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiMoreVertical, FiLink } from 'react-icons/fi';
import { DataTable, type Column } from '@/components/ui';
import { useSuperAdminUsers } from '@/hooks';
import type { AdminUser, UserRole } from '@bthgrentalcar/sdk';

const roleColors: Record<UserRole, string> = {
  admin: 'blue',
  superAdmin: 'purple',
};

export default function SuperAdminAdminsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useSuperAdminUsers({ page, limit: 10 });

  const columns: Column<AdminUser>[] = [
    {
      header: 'Admin',
      accessor: (row) => (
        <HStack spacing={3}>
          <Avatar
            size="sm"
            name={`${row.firstname} ${row.name}`}
            src={row.image}
            bg="brand.400"
          />
          <VStack align="start" spacing={0}>
            <Text fontWeight="medium">
              {row.firstname} {row.name}
            </Text>
            <Text fontSize="sm" color="gray.500">
              {row.email}
            </Text>
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
          {row.agencyName || (
            <Text as="span" color="gray.400" fontStyle="italic">
              Not assigned
            </Text>
          )}
        </Text>
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
              icon={<FiEdit2 />}
              onClick={() => router.push(`/super-admin/admins/${row.id}`)}
            >
              Edit
            </MenuItem>
            {!row.agencyId && row.role === 'admin' && (
              <MenuItem
                icon={<FiLink />}
                onClick={() => router.push(`/super-admin/admins/${row.id}?assign=true`)}
              >
                Assign Agency
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
        <Heading size="lg">Admin Users</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          onClick={() => router.push('/super-admin/admins/new')}
        >
          Create Admin
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
        searchPlaceholder="Search admins..."
        keyExtractor={(row) => row.id}
        emptyMessage="No admin users found"
      />
    </Box>
  );
}
