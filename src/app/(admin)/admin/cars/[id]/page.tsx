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
} from '@chakra-ui/react';
import { FiArrowLeft, FiEdit2, FiCalendar } from 'react-icons/fi';
import { LoadingSpinner } from '@/components/ui';
import { useCar } from '@/hooks';

export default function CarDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const carId = Number(params.id);

  const { data: car, isLoading } = useCar(carId);

  const cardBg = useColorModeValue('white', 'gray.800');

  if (isLoading) {
    return <LoadingSpinner text="Loading car details..." />;
  }

  if (!car) {
    return (
      <Box textAlign="center" py={10}>
        <Text>Car not found</Text>
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
            onClick={() => router.back()}
          >
            Back
          </Button>
          <Heading size="lg">
            {car.brand} {car.model}
          </Heading>
        </HStack>

        <HStack>
          <Button
            leftIcon={<FiCalendar />}
            colorScheme="green"
            variant="outline"
            onClick={() => router.push(`/admin/cars/${carId}/availability`)}
          >
            Manage Availability
          </Button>
          <Button
            leftIcon={<FiEdit2 />}
            colorScheme="brand"
            onClick={() => router.push(`/admin/cars/${carId}/edit`)}
          >
            Edit Car
          </Button>
        </HStack>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Car Image */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Image
            src={car.image || '/placeholder-car.jpg'}
            alt={`${car.brand} ${car.model}`}
            w="full"
            h="300px"
            objectFit="cover"
            borderRadius="lg"
            fallbackSrc="https://via.placeholder.com/400x300?text=No+Image"
          />
        </Box>

        {/* Car Info */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Heading size="md" mb={4}>
            Vehicle Information
          </Heading>
          <VStack align="start" spacing={4}>
            <HStack justify="space-between" w="full">
              <Text color="gray.500">Brand</Text>
              <Text fontWeight="medium">{car.brand}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between" w="full">
              <Text color="gray.500">Model</Text>
              <Text fontWeight="medium">{car.model}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between" w="full">
              <Text color="gray.500">Year</Text>
              <Text fontWeight="medium">{car.year}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between" w="full">
              <Text color="gray.500">Registration</Text>
              <Text fontWeight="medium">{car.registration}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between" w="full">
              <Text color="gray.500">Price per Day</Text>
              <Text fontWeight="bold" color="brand.500" fontSize="xl">
                ${car.price}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Technical Specs */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Heading size="md" mb={4}>
            Technical Specifications
          </Heading>
          <SimpleGrid columns={2} spacing={4}>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Fuel Type
              </Text>
              <Badge colorScheme="blue" mt={1}>
                {car.fuel}
              </Badge>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Transmission
              </Text>
              <Badge colorScheme="purple" mt={1}>
                {car.gearBox}
              </Badge>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Doors
              </Text>
              <Text fontWeight="medium">{car.door}</Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                Mileage
              </Text>
              <Text fontWeight="medium">{car.mileage.toLocaleString()} km</Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Description */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Heading size="md" mb={4}>
            Description
          </Heading>
          <Text color="gray.600">
            {car.description || 'No description available for this vehicle.'}
          </Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
