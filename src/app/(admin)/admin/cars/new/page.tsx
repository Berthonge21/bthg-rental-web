'use client';

import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Button,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { FiArrowLeft } from 'react-icons/fi';
import { CarForm } from '@/components/forms/CarForm';
import { useCreateCar } from '@/hooks';
import { useAuthStore } from '@/stores/auth.store';

export default function NewCarPage() {
  const router = useRouter();
  const toast = useToast();
  const { user } = useAuthStore();
  const createMutation = useCreateCar();

  const handleSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync({
        ...data,
        agencyId: user?.agencyId || 1, // Use the admin's agency ID
      });
      toast({
        title: 'Car created',
        description: 'The car has been added successfully',
        status: 'success',
        duration: 3000,
      });
      router.push('/admin/cars');
    } catch (error) {
      toast({
        title: 'Failed to create car',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Box>
      <HStack mb={6}>
        <Button
          variant="ghost"
          leftIcon={<FiArrowLeft />}
          onClick={() => router.back()}
        >
          Back
        </Button>
        <Heading size="lg">Add New Car</Heading>
      </HStack>

      <CarForm
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending}
        submitLabel="Create Car"
      />
    </Box>
  );
}
