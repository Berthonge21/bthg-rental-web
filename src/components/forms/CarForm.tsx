'use client';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  Textarea,
  Select,
  SimpleGrid,
  Stack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Car } from '@bthgrentalcar/sdk';

const carSchema = z.object({
  brand: z.string().min(1, 'Brand is required').max(100),
  model: z.string().min(1, 'Model is required').max(100),
  year: z.coerce.number().min(1900, 'Invalid year').max(new Date().getFullYear() + 1),
  mileage: z.coerce.number().min(0, 'Mileage must be positive'),
  price: z.coerce.number().min(0, 'Price must be positive'),
  registration: z.string().min(1, 'Registration is required').max(20),
  fuel: z.string().min(1, 'Fuel type is required'),
  door: z.coerce.number().min(1, 'Number of doors is required'),
  gearBox: z.string().min(1, 'Gearbox type is required'),
  description: z.string().max(300).optional(),
  image: z.string().url().optional().or(z.literal('')),
});

type CarFormData = z.infer<typeof carSchema>;

interface CarFormProps {
  initialData?: Partial<Car>;
  onSubmit: (data: CarFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
}

const fuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'LPG'];
const gearboxTypes = ['Automatic', 'Manual', 'Semi-automatic'];

export function CarForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save',
}: CarFormProps) {
  const cardBg = useColorModeValue('white', 'gray.800');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CarFormData>({
    resolver: zodResolver(carSchema),
    defaultValues: {
      brand: initialData?.brand || '',
      model: initialData?.model || '',
      year: initialData?.year || new Date().getFullYear(),
      mileage: initialData?.mileage || 0,
      price: initialData?.price || 0,
      registration: initialData?.registration || '',
      fuel: initialData?.fuel || '',
      door: initialData?.door || 4,
      gearBox: initialData?.gearBox || '',
      description: initialData?.description || '',
      image: initialData?.image || '',
    },
  });

  return (
    <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={6}>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isInvalid={!!errors.brand}>
              <FormLabel>Brand</FormLabel>
              <Input placeholder="e.g., Toyota" {...register('brand')} />
              <FormErrorMessage>{errors.brand?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.model}>
              <FormLabel>Model</FormLabel>
              <Input placeholder="e.g., Camry" {...register('model')} />
              <FormErrorMessage>{errors.model?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
            <FormControl isInvalid={!!errors.year}>
              <FormLabel>Year</FormLabel>
              <Input type="number" {...register('year')} />
              <FormErrorMessage>{errors.year?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.mileage}>
              <FormLabel>Mileage (km)</FormLabel>
              <Input type="number" {...register('mileage')} />
              <FormErrorMessage>{errors.mileage?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.price}>
              <FormLabel>Price per Day ($)</FormLabel>
              <Input type="number" step="0.01" {...register('price')} />
              <FormErrorMessage>{errors.price?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isInvalid={!!errors.registration}>
              <FormLabel>Registration</FormLabel>
              <Input placeholder="e.g., ABC-1234" {...register('registration')} />
              <FormErrorMessage>{errors.registration?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.door}>
              <FormLabel>Number of Doors</FormLabel>
              <Select {...register('door')}>
                {[2, 3, 4, 5].map((num) => (
                  <option key={num} value={num}>
                    {num} doors
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.door?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
            <FormControl isInvalid={!!errors.fuel}>
              <FormLabel>Fuel Type</FormLabel>
              <Select placeholder="Select fuel type" {...register('fuel')}>
                {fuelTypes.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuel}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.fuel?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.gearBox}>
              <FormLabel>Gearbox</FormLabel>
              <Select placeholder="Select gearbox" {...register('gearBox')}>
                {gearboxTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
              <FormErrorMessage>{errors.gearBox?.message}</FormErrorMessage>
            </FormControl>
          </SimpleGrid>

          <FormControl isInvalid={!!errors.image}>
            <FormLabel>Image URL</FormLabel>
            <Input placeholder="https://..." {...register('image')} />
            <FormErrorMessage>{errors.image?.message}</FormErrorMessage>
          </FormControl>

          <FormControl isInvalid={!!errors.description}>
            <FormLabel>Description</FormLabel>
            <Textarea
              placeholder="Enter car description..."
              rows={3}
              {...register('description')}
            />
            <FormErrorMessage>{errors.description?.message}</FormErrorMessage>
          </FormControl>

          <Button type="submit" colorScheme="brand" size="lg" isLoading={isLoading}>
            {submitLabel}
          </Button>
        </Stack>
      </form>
    </Box>
  );
}
