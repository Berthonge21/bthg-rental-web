'use client';

import { useRouter, useParams } from 'next/navigation';
import {
  Box,
  Heading,
  Button,
  HStack,
  VStack,
  Text,
  Badge,
  SimpleGrid,
  Image,
  Divider,
  useColorModeValue,
  useToast,
} from '@chakra-ui/react';
import { FiArrowLeft, FiPlay, FiCheck, FiX } from 'react-icons/fi';
import { LoadingSpinner } from '@/components/ui';
import { useAdminRental, useUpdateRentalStatus } from '@/hooks';
import type { RentalStatus } from '@bthgrentalcar/sdk';
import { format } from 'date-fns';

const statusColors: Record<RentalStatus, string> = {
  reserved: 'yellow',
  ongoing: 'blue',
  completed: 'green',
  cancelled: 'red',
};

export default function RentalDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const rentalId = Number(params.id);

  const { data: rental, isLoading } = useAdminRental(rentalId);
  const updateStatusMutation = useUpdateRentalStatus();

  const cardBg = useColorModeValue('white', 'gray.800');

  const handleStatusUpdate = async (status: RentalStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: rentalId, status });
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

  if (isLoading) {
    return <LoadingSpinner text="Loading rental details..." />;
  }

  if (!rental) {
    return (
      <Box textAlign="center" py={10}>
        Rental not found
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
            onClick={() => router.back()}
          >
            Back
          </Button>
          <Heading size="lg">Rental #{rental.id}</Heading>
          <Badge colorScheme={statusColors[rental.status]} fontSize="md" px={3} py={1}>
            {rental.status}
          </Badge>
        </HStack>

        <HStack>
          {rental.status === 'reserved' && (
            <>
              <Button
                leftIcon={<FiPlay />}
                colorScheme="blue"
                onClick={() => handleStatusUpdate('ongoing' as RentalStatus)}
                isLoading={updateStatusMutation.isPending}
              >
                Start Rental
              </Button>
              <Button
                leftIcon={<FiX />}
                colorScheme="red"
                variant="outline"
                onClick={() => handleStatusUpdate('cancelled' as RentalStatus)}
                isLoading={updateStatusMutation.isPending}
              >
                Cancel
              </Button>
            </>
          )}
          {rental.status === 'ongoing' && (
            <Button
              leftIcon={<FiCheck />}
              colorScheme="green"
              onClick={() => handleStatusUpdate('completed' as RentalStatus)}
              isLoading={updateStatusMutation.isPending}
            >
              Complete Rental
            </Button>
          )}
        </HStack>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Client Info */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Heading size="md" mb={4}>
            Client Information
          </Heading>
          <VStack align="start" spacing={3}>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Name
              </Text>
              <Text fontWeight="medium">
                {rental.client?.firstname} {rental.client?.name}
              </Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Email
              </Text>
              <Text>{rental.client?.email}</Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Phone
              </Text>
              <Text>{rental.client?.telephone}</Text>
            </Box>
          </VStack>
        </Box>

        {/* Car Info */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Heading size="md" mb={4}>
            Car Information
          </Heading>
          <HStack spacing={4} align="start">
            <Image
              src={rental.car?.image || '/placeholder-car.jpg'}
              alt={`${rental.car?.brand} ${rental.car?.model}`}
              boxSize="100px"
              objectFit="cover"
              borderRadius="md"
              fallbackSrc="https://via.placeholder.com/100"
            />
            <VStack align="start" spacing={2}>
              <Text fontWeight="bold" fontSize="lg">
                {rental.car?.brand} {rental.car?.model}
              </Text>
              <Text color="gray.500">{rental.car?.year}</Text>
              <Text fontWeight="semibold" color="brand.500">
                ${rental.car?.price}/day
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Rental Details */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Heading size="md" mb={4}>
            Rental Period
          </Heading>
          <SimpleGrid columns={2} spacing={4}>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Start Date
              </Text>
              <Text fontWeight="medium">
                {format(new Date(rental.startDate), 'MMMM d, yyyy')}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {format(new Date(rental.startTime), 'h:mm a')}
              </Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                End Date
              </Text>
              <Text fontWeight="medium">
                {format(new Date(rental.endDate), 'MMMM d, yyyy')}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {format(new Date(rental.endTime), 'h:mm a')}
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Payment Info */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Heading size="md" mb={4}>
            Payment
          </Heading>
          <VStack align="start" spacing={3}>
            <HStack justify="space-between" w="full">
              <Text color="gray.500">Daily Rate</Text>
              <Text>${rental.car?.price}/day</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between" w="full">
              <Text fontWeight="bold">Total</Text>
              <Text fontWeight="bold" fontSize="xl" color="brand.500">
                ${rental.total.toFixed(2)}
              </Text>
            </HStack>
          </VStack>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
