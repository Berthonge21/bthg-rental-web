'use client';

import { useState, useEffect } from 'react';
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
import { LoadingSpinner, useMinLoading } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import { useCar } from '@/hooks';
import { parseCarImages } from '@/lib/imageUtils';
import { CarPlaceholder } from '@/components/ui/CarPlaceholder';

const FALLBACK_IMAGE = 'https://via.placeholder.com/400x300?text=No+Image';

export default function CarDetailsPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const carId = Number(params.id);

  const { data: car, isLoading } = useCar(carId);
  const showLoading = useMinLoading(isLoading);

  // Prefetch likely navigation targets
  useEffect(() => {
    router.prefetch(`/admin/cars/${carId}/edit`);
    router.prefetch(`/admin/cars/${carId}/availability`);
    router.prefetch('/admin/cars');
  }, [router, carId]);

  // All useColorModeValue calls at the top, before any early returns
  const cardBg = useColorModeValue('white', 'gray.800');
  const thumbBorder = useColorModeValue('gray.200', 'navy.600');
  const thumbActiveBorder = useColorModeValue('brand.400', 'brand.400');
  const thumbBg = useColorModeValue('gray.50', 'navy.800');
  const descriptionColor = useColorModeValue('gray.600', 'gray.300');

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (showLoading) {
    return <LoadingSpinner text={t('cars.loadingCarDetails')} />;
  }

  if (!car) {
    return (
      <Box textAlign="center" py={10}>
        <Text>{t('cars.carNotFound')}</Text>
        <Button mt={4} onClick={() => router.back()}>
          {t('common.goBack')}
        </Button>
      </Box>
    );
  }

  const images = parseCarImages(car.image);
  const hasImages = images.length > 0;
  const mainImage = hasImages ? images[selectedIndex] ?? images[0] : FALLBACK_IMAGE;

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <HStack>
          <Button
            variant="ghost"
            leftIcon={<FiArrowLeft />}
            onClick={() => router.back()}
          >
            {t('common.back')}
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
            {t('cars.manageAvailability')}
          </Button>
          <Button
            leftIcon={<FiEdit2 />}
            colorScheme="brand"
            onClick={() => router.push(`/admin/cars/${carId}/edit`)}
          >
            {t('cars.editCar')}
          </Button>
        </HStack>
      </HStack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Car Image Gallery */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          {/* Main Image */}
          {hasImages ? (
            <Image
              src={mainImage}
              alt={`${car.brand} ${car.model}`}
              w="full"
              h="300px"
              objectFit="cover"
              borderRadius="lg"
              fallbackSrc={FALLBACK_IMAGE}
            />
          ) : (
            <CarPlaceholder h="300px" />
          )}

          {/* Thumbnail Strip -- only rendered when there are multiple images */}
          {images.length > 1 && (
            <HStack spacing={3} mt={4} overflowX="auto" pb={1}>
              {images.map((src, index) => {
                const isActive = index === selectedIndex;
                return (
                  <Box
                    key={index}
                    as="button"
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    flexShrink={0}
                    w="72px"
                    h="54px"
                    borderRadius="md"
                    overflow="hidden"
                    border="2px solid"
                    borderColor={isActive ? thumbActiveBorder : thumbBorder}
                    bg={thumbBg}
                    opacity={isActive ? 1 : 0.7}
                    transition="all 0.2s"
                    _hover={{ opacity: 1, borderColor: thumbActiveBorder }}
                    cursor="pointer"
                    aria-label={`View image ${index + 1}`}
                  >
                    <Image
                      src={src}
                      alt={`${car.brand} ${car.model} thumbnail ${index + 1}`}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                    />
                  </Box>
                );
              })}
            </HStack>
          )}
        </Box>

        {/* Car Info */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Heading size="md" mb={4}>
            {t('cars.vehicleInfo')}
          </Heading>
          <VStack align="start" spacing={4}>
            <HStack justify="space-between" w="full">
              <Text color="gray.500">{t('cars.brand')}</Text>
              <Text fontWeight="medium">{car.brand}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between" w="full">
              <Text color="gray.500">{t('cars.model')}</Text>
              <Text fontWeight="medium">{car.model}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between" w="full">
              <Text color="gray.500">{t('cars.year')}</Text>
              <Text fontWeight="medium">{car.year}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between" w="full">
              <Text color="gray.500">{t('cars.registration')}</Text>
              <Text fontWeight="medium">{car.registration}</Text>
            </HStack>
            <Divider />
            <HStack justify="space-between" w="full">
              <Text color="gray.500">{t('cars.pricePerDay')}</Text>
              <Text fontWeight="bold" color="brand.500" fontSize="xl">
                ${car.price}
              </Text>
            </HStack>
          </VStack>
        </Box>

        {/* Technical Specs */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Heading size="md" mb={4}>
            {t('cars.technicalSpecs')}
          </Heading>
          <SimpleGrid columns={2} spacing={4}>
            <Box>
              <Text color="gray.500" fontSize="sm">
                {t('cars.fuelType')}
              </Text>
              <Badge colorScheme="blue" mt={1}>
                {car.fuel}
              </Badge>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                {t('cars.transmission')}
              </Text>
              <Badge colorScheme="purple" mt={1}>
                {car.gearBox}
              </Badge>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                {t('cars.doors')}
              </Text>
              <Text fontWeight="medium">{car.door}</Text>
            </Box>
            <Box>
              <Text color="gray.500" fontSize="sm">
                {t('cars.mileage')}
              </Text>
              <Text fontWeight="medium">{car.mileage.toLocaleString()} km</Text>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Description */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
          <Heading size="md" mb={4}>
            {t('cars.description')}
          </Heading>
          <Text color={descriptionColor}>
            {car.description || t('cars.noDescription')}
          </Text>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
