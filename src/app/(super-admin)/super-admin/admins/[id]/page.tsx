'use client';

import { useState, useEffect } from 'react';
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
  Avatar,
  Divider,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiArrowLeft, FiSave, FiLink } from 'react-icons/fi';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LoadingSpinner } from '@/components/ui';
import { useSuperAdminUsers, useSuperAdminAgencies, useAssignAgency } from '@/hooks';
import type { UserRole } from '@bthgrentalcar/sdk';

const assignAgencySchema = z.object({
  agencyId: z.coerce.number().min(1, 'Please select an agency'),
});

type AssignAgencyFormData = z.infer<typeof assignAgencySchema>;

const roleColors: Record<UserRole, string> = {
  admin: 'blue',
  superAdmin: 'purple',
};

export default function AdminDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const toast = useToast();
  const adminId = Number(params.id);
  const showAssignModal = searchParams.get('assign') === 'true';

  const [isAssigning, setIsAssigning] = useState(showAssignModal);

  const { data: usersData, isLoading: usersLoading } = useSuperAdminUsers({ limit: 100 });
  const { data: agenciesData, isLoading: agenciesLoading } = useSuperAdminAgencies({ limit: 100 });
  const assignMutation = useAssignAgency();

  const cardBg = useColorModeValue('white', 'gray.800');

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
        title: 'Agency assigned',
        description: 'The admin has been assigned to the agency successfully',
        status: 'success',
        duration: 3000,
      });
      setIsAssigning(false);
      router.push('/super-admin/admins');
    } catch (error) {
      toast({
        title: 'Failed to assign agency',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  if (usersLoading) {
    return <LoadingSpinner text="Loading admin..." />;
  }

  if (!admin) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Admin not found</Text>
        <Button mt={4} onClick={() => router.back()}>
          Go Back
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <HStack>
          <Button
            variant="ghost"
            leftIcon={<FiArrowLeft />}
            onClick={() => router.push('/super-admin/admins')}
          >
            Back
          </Button>
          <Heading size="lg">Admin Details</Heading>
        </HStack>
        {admin.role === 'admin' && !admin.agencyId && !isAssigning && (
          <Button leftIcon={<FiLink />} colorScheme="brand" onClick={() => setIsAssigning(true)}>
            Assign Agency
          </Button>
        )}
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
              <Badge colorScheme={roleColors[admin.role]} textTransform="capitalize" mt={2}>
                {admin.role === 'superAdmin' ? 'Super Admin' : 'Admin'}
              </Badge>
            </VStack>
          </VStack>

          <Divider my={6} />

          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Text color="gray.500">Agency</Text>
              <Text fontWeight="medium">
                {admin.agency?.name || admin.agencyName || (
                  <Badge colorScheme="orange" variant="subtle">Not assigned</Badge>
                )}
              </Text>
            </HStack>
            <HStack justify="space-between">
              <Text color="gray.500">Created</Text>
              <Text fontWeight="medium">
                {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Assign Agency Form */}
        {isAssigning && admin.role === 'admin' && (
          <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
            <Heading size="md" mb={6}>Assign to Agency</Heading>

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
                  <FormLabel>Select Agency</FormLabel>
                  <Select
                    {...register('agencyId')}
                    placeholder="Choose an agency"
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
                      No active agencies available. Create an agency first.
                    </Text>
                  )}
                </FormControl>

                <HStack justify="flex-end">
                  <Button variant="ghost" onClick={() => setIsAssigning(false)}>
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    colorScheme="brand"
                    leftIcon={<FiSave />}
                    isLoading={assignMutation.isPending}
                    isDisabled={availableAgencies.length === 0}
                  >
                    Assign Agency
                  </Button>
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
              Super Admins have access to all agencies and do not need to be assigned to a specific one.
            </Alert>
          </Box>
        )}

        {!isAssigning && admin.role === 'admin' && admin.agencyId && (
          <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
            <Heading size="md" mb={4}>Agency Information</Heading>
            <VStack spacing={3} align="stretch">
              <HStack justify="space-between">
                <Text color="gray.500">Agency Name</Text>
                <Text fontWeight="medium">{admin.agency?.name || admin.agencyName}</Text>
              </HStack>
              <Button
                variant="outline"
                colorScheme="brand"
                size="sm"
                onClick={() => router.push(`/super-admin/agencies/${admin.agencyId}`)}
              >
                View Agency Details
              </Button>
            </VStack>
          </Box>
        )}
      </SimpleGrid>
    </Box>
  );
}
