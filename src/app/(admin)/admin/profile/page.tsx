'use client';

import {
  Box,
  Heading,
  VStack,
  HStack,
  Avatar,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  SimpleGrid,
  useColorModeValue,
  useToast,
  Divider,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import { useState } from 'react';

interface ProfileFormData {
  firstname: string;
  name: string;
  telephone: string;
  address: string;
  city: string;
}

export default function ProfilePage() {
  const toast = useToast();
  const { user, fetchUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const cardBg = useColorModeValue('white', 'gray.800');

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstname: user?.firstname || '',
      name: user?.name || '',
      telephone: user?.telephone || '',
      address: user?.address || '',
      city: user?.city || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      await api.users.updateProfile(data);
      await fetchUser();
      toast({
        title: 'Profile updated',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Failed to update profile',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>
        Profile
      </Heading>

      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
        {/* Profile Card */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <VStack spacing={4}>
            <Avatar
              size="2xl"
              name={`${user?.firstname} ${user?.name}`}
              src={user?.image}
              bg="brand.400"
            />
            <VStack spacing={1}>
              <Text fontWeight="bold" fontSize="xl">
                {user?.firstname} {user?.name}
              </Text>
              <Text color="gray.500">{user?.email}</Text>
              <Text
                fontSize="sm"
                color="brand.500"
                fontWeight="medium"
                textTransform="capitalize"
              >
                {user?.role}
              </Text>
            </VStack>
          </VStack>
        </Box>

        {/* Edit Form */}
        <Box
          bg={cardBg}
          p={6}
          borderRadius="xl"
          boxShadow="sm"
          gridColumn={{ lg: 'span 2' }}
        >
          <Heading size="md" mb={6}>
            Edit Profile
          </Heading>

          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={6} align="stretch">
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                <FormControl>
                  <FormLabel>First Name</FormLabel>
                  <Input {...register('firstname')} />
                </FormControl>

                <FormControl>
                  <FormLabel>Last Name</FormLabel>
                  <Input {...register('name')} />
                </FormControl>
              </SimpleGrid>

              <FormControl>
                <FormLabel>Phone Number</FormLabel>
                <Input {...register('telephone')} />
              </FormControl>

              <FormControl>
                <FormLabel>Address</FormLabel>
                <Input {...register('address')} />
              </FormControl>

              <FormControl>
                <FormLabel>City</FormLabel>
                <Input {...register('city')} />
              </FormControl>

              <Divider />

              <HStack justify="flex-end">
                <Button
                  type="submit"
                  colorScheme="brand"
                  isLoading={isLoading}
                  isDisabled={!isDirty}
                >
                  Save Changes
                </Button>
              </HStack>
            </VStack>
          </form>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
