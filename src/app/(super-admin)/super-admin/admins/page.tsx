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
  Tooltip,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiLink } from 'react-icons/fi';
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

  const { data, isLoading } = useSuperAdminUsers({ page, limit: 10, search: search || undefined });

  const filteredData = (data?.data || []).filter((admin) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      admin.firstname.toLowerCase().includes(q) ||
      admin.name.toLowerCase().includes(q) ||
      admin.email.toLowerCase().includes(q)
    );
  });

  const cardBg = useColorModeValue('white', 'navy.700');
  const cardBorder = useColorModeValue('gray.100', 'navy.600');
  const textMuted = useColorModeValue('text.muted', 'gray.400');

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
            <Text fontWeight="medium" color="text.primary">
              {row.firstname} {row.name}
            </Text>
            <Text fontSize="sm" color={textMuted}>
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
        <Text fontSize="sm" color={textMuted}>
          {row.agency?.name || row.agencyName || (
            <Badge colorScheme="orange" variant="subtle">
              Not assigned
            </Badge>
          )}
        </Text>
      ),
    },
    {
      header: 'Actions',
      width: '100px',
      accessor: (row) => (
        <HStack spacing={1}>
          <Tooltip label="Edit" hasArrow>
            <IconButton
              aria-label="Edit"
              icon={<FiEdit2 />}
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/super-admin/admins/${row.id}`)}
            />
          </Tooltip>
          {!row.agencyId && row.role === 'admin' && (
            <Tooltip label="Assign Agency" hasArrow>
              <IconButton
                aria-label="Assign Agency"
                icon={<FiLink />}
                variant="ghost"
                size="sm"
                colorScheme="blue"
                onClick={() => router.push(`/super-admin/admins/${row.id}?assign=true`)}
              />
            </Tooltip>
          )}
        </HStack>
      ),
    },
  ];

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg" color="text.primary">Admin Users</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="brand"
          onClick={() => router.push('/super-admin/admins/new')}
        >
          Create Admin
        </Button>
      </HStack>

      <Box
        bg={cardBg}
        borderRadius="2xl"
        border="1px"
        borderColor={cardBorder}
        boxShadow="sm"
        overflow="hidden"
        p={5}
      >
        <DataTable
          columns={columns}
          data={filteredData}
          isLoading={isLoading}
          page={page}
          totalPages={data?.meta.totalPages || 1}
          onPageChange={setPage}
          searchValue={search}
          onSearchChange={(value) => { setSearch(value); setPage(1); }}
          searchPlaceholder="Search admins..."
          keyExtractor={(row) => row.id}
          emptyMessage="No admin users found"
        />
      </Box>
    </Box>
  );
}
