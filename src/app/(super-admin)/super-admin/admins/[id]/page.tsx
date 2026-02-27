'use client';

import { useState } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import {
  Box,
  Heading,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  SimpleGrid,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Select,
  useToast,
  useColorModeValue,
  useDisclosure,
  Avatar,
  Divider,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiArrowLeft, FiSave, FiLink, FiUserCheck, FiUserX } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { LoadingSpinner, ConfirmDialog } from '@/components/ui';
import { useSuperAdminUsers, useSuperAdminAgencies, useAssignAgency, useUpdateUserStatus } from '@/hooks';
import { ProgressButton } from '@/components/ui/ProgressButton';
import { Status } from '@berthonge21/sdk';
import type { UserRole } from '@berthonge21/sdk';

const assignAgencySchema = z.object({
  agencyId: z.coerce.number().min(1, 'Please select an agency'),
});

type AssignAgencyFormData = z.infer<typeof assignAgencySchema>;

const roleColors: Record<UserRole, string> = {
  admin: 'blue',
  superAdmin: 'purple',
};

export default function AdminDetailsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const toast = useToast();
  const adminId = Number(params.id);
  const showAssignModal = searchParams.get('assign') === 'true';

  const [isAssigning, setIsAssigning] = useState(showAssignModal);
  const statusToggleDialog = useDisclosure();

  const { data: usersData, isLoading: usersLoading } = useSuperAdminUsers({ limit: 100 });
  const { data: agenciesData, isLoading: agenciesLoading } = useSuperAdminAgencies({ limit: 100 });
  const assignMutation = useAssignAgency();
  const updateStatusMutation = useUpdateUserStatus();

  const cardBg = useColorModeValue('white', 'gray.800');
  const textMuted = useColorModeValue('gray.500', 'gray.400');
  const dangerBg = useColorModeValue('red.50', 'rgba(254, 178, 178, 0.06)');
  const dangerBorder = useColorModeValue('red.200', 'red.800');

  // Find the admin user
  const admin = usersData?.data?.find((u) => u.id === adminId);

  // Filter agencies for assignment (only active ones)
  const availableAgencies = agenciesData?.data?.filter(
    (agency) => agency.status === 'activate'
  ) || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AssignAgencyFormData>({
    resolver: zodResolver(assignAgencySchema),
  });

  const onAssignAgency = async (data: AssignAgencyFormData) => {
    try {
      await assignMutation.mutateAsync({ userId: adminId, agencyId: data.agencyId });
      toast({
        title: t('admins.agencyAssigned'),
        description: t('admins.agencyAssignedDesc'),
        status: 'success',
        duration: 3000,
      });
      setIsAssigning(false);
      router.push('/super-admin/admins');
    } catch (error) {
      toast({
        title: t('admins.failedToAssignAgency'),
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  const handleStatusToggle = async () => {
    if (!admin) return;

    const newStatus =
      admin.status === Status.ACTIVATE ? Status.DEACTIVATE : Status.ACTIVATE;

    try {
      await updateStatusMutation.mutateAsync({
        userId: admin.id,
        status: newStatus,
      });
      toast({
        title: newStatus === Status.ACTIVATE ? t('admins.adminActivated') : t('admins.adminDeactivated'),
        description: t('admins.statusUpdateDesc', { name: `${admin.firstname} ${admin.name}`, action: newStatus === Status.ACTIVATE ? 'activated' : 'deactivated' }),
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: t('rentals.failedToUpdateStatus'),
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      statusToggleDialog.onClose();
    }
  };

  if (usersLoading) {
    return <LoadingSpinner text={t('admins.loadingAdmin')} />;
  }

  if (!admin) {
    return (
      <Box textAlign="center" py={10}>
        <Text>{t('admins.adminNotFound')}</Text>
        <Button mt={4} onClick={() => router.back()}>
          {t('common.goBack')}
        </Button>
      </Box>
    );
  }

  const isActive = admin.status === Status.ACTIVATE;
  const isAdminRole = admin.role === 'admin';

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <HStack>
          <Button
            variant="ghost"
            leftIcon={<FiArrowLeft />}
            onClick={() => router.push('/super-admin/admins')}
          >
            {t('common.back')}
          </Button>
          <Heading size="lg">{t('admins.adminDetails')}</Heading>
        </HStack>
        <HStack spacing={2}>
          {isAdminRole && !admin.agencyId && !isAssigning && (
            <Button leftIcon={<FiLink />} colorScheme="brand" onClick={() => setIsAssigning(true)}>
              {t('admins.assignAgency')}
            </Button>
          )}
          {/* Status toggle button -- only for non-superAdmin */}
          {isAdminRole && (
            <Button
              leftIcon={isActive ? <FiUserX /> : <FiUserCheck />}
              colorScheme={isActive ? 'red' : 'green'}
              variant="outline"
              onClick={statusToggleDialog.onOpen}
            >
              {isActive ? t('admins.deactivate') : t('admins.activate')}
            </Button>
          )}
        </HStack>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Admin Info Card */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <VStack spacing={6} align="center">
            <Avatar
              size="2xl"
              name={`${admin.firstname} ${admin.name}`}
              src={admin.image}
              bg="brand.400"
            />
            <VStack spacing={1}>
              <Heading size="md">{admin.firstname} {admin.name}</Heading>
              <Text color="gray.500">{admin.email}</Text>
              <HStack spacing={2} mt={2}>
                <Badge colorScheme={roleColors[admin.role]} textTransform="capitalize">
                  {admin.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
                </Badge>
                <Badge
                  colorScheme={isActive ? 'green' : 'red'}
                  variant="subtle"
                >
                  {isActive ? 'Active' : 'Deactivated'}
                </Badge>
              </HStack>
            </VStack>
          </VStack>

          <Divider my={6} />

          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text color={textMuted}>{t('admins.agency')}</Text>
              <Text fontWeight="medium">
                {admin.agency?.name || admin.agencyName || (
                  <Badge colorScheme="orange" variant="subtle">{t('admins.notAssigned')}</Badge>
                )}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color={textMuted}>Status</Text>
              <Text fontWeight="medium">
                {isActive ? t('common.status.active') : t('common.status.inactive')}
              </Text>
            </HStack>
            {admin.deactivatedAt && (
              <HStack justify="space-between">
                <Text color={textMuted}>{t('admins.deactivatedAt')}</Text>
                <Text fontWeight="medium" color="red.400">
                  {new Date(admin.deactivatedAt).toLocaleString()}
                </Text>
              </HStack>
            )}
            <HStack justify="space-between">
              <Text color={textMuted}>{t('admins.created')}</Text>
              <Text fontWeight="medium">
                {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Assign Agency Form */}
        {isAssigning && admin.role === 'admin' && (
          <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
            <Heading size="md" mb={6}>{t('admins.assignToAgency')}</Heading>

            {admin.agencyId ? (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                This admin is already assigned to {admin.agency?.name || 'an agency'}.
                Reassigning will move them to a different agency.
              </Alert>
            ) : null}

            <form onSubmit={handleSubmit(onAssignAgency)}>
              <VStack spacing={6} align="stretch" mt={admin.agencyId ? 4 : 0}>
                <FormControl isInvalid={!!errors.agencyId}>
                  <FormLabel>{t('admins.selectAgency')}</FormLabel>
                  <Select
                    {...register('agencyId')}
                    placeholder={t('admins.chooseAgency')}
                    isDisabled={agenciesLoading}
                  >
                    {availableAgencies.map((agency) => (
                      <option key={agency.id} value={agency.id}>
                        {agency.name} - {agency.address}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.agencyId?.message}</FormErrorMessage>
                  {availableAgencies.length === 0 && !agenciesLoading && (
                    <Text fontSize="sm" color="orange.500" mt={1}>
                      {t('admins.noActiveAgencies')}
                    </Text>
                  )}
                </FormControl>

                <HStack justify="flex-end">
                  <Button variant="ghost" onClick={() => setIsAssigning(false)}>
                    {t('common.cancel')}
                  </Button>
                  <ProgressButton
                    type="submit"
                    colorScheme="brand"
                    leftIcon={<FiSave />}
                    isLoading={assignMutation.isPending}
                    isDisabled={availableAgencies.length === 0}
                  >
                    {t('admins.assignAgency')}
                  </ProgressButton>
                </HStack>
              </VStack>
            </form>
          </Box>
        )}

        {/* Info when not assigning */}
        {!isAssigning && admin.role === 'superAdmin' && (
          <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              {t('admins.superAdminAccess')}
            </Alert>
          </Box>
        )}

        {!isAssigning && admin.role === 'admin' && admin.agencyId && (
          <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
            <Heading size="md" mb={4}>{t('admins.agencyInfo')}</Heading>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text color={textMuted}>{t('admins.agencyName')}</Text>
                <Text fontWeight="medium">{admin.agency?.name || admin.agencyName}</Text>
              </HStack>
              <Button
                variant="outline"
                colorScheme="brand"
                size="sm"
                onClick={() => router.push(`/super-admin/agencies/${admin.agencyId}`)}
              >
                {t('admins.viewAgencyDetails')}
              </Button>
            </VStack>
          </Box>
        )}
      </SimpleGrid>

      {/* Status Toggle Confirmation Dialog */}
      <ConfirmDialog
        isOpen={statusToggleDialog.isOpen}
        onClose={statusToggleDialog.onClose}
        onConfirm={handleStatusToggle}
        title={isActive ? t('admins.deactivateAdmin') : t('admins.activateAdmin')}
        message={
          isActive
            ? t('admins.deactivateAdminConfirm', { name: `${admin.firstname} ${admin.name}` })
            : t('admins.activateAdminConfirm', { name: `${admin.firstname} ${admin.name}` })
        }
        confirmText={isActive ? t('admins.deactivate') : t('admins.activate')}
        isLoading={updateStatusMutation.isPending}
        colorScheme={isActive ? 'red' : 'green'}
      />
    </Box>
  );
}
