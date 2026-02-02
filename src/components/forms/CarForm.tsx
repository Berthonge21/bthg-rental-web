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
  Text,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Car, Agency } from '@bthgrentalcar/sdk';

// Base schema without agencyId (for regular admins)
const baseCarSchema = z.object({
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
  agencyId: z.coerce.number().optional(),
});

type CarFormData = z.infer<typeof baseCarSchema>;

interface CarFormProps {
  initialData?: Partial<Car>;
  onSubmit: (data: CarFormData) => Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  isSuperAdmin?: boolean;
  agencies?: Agency[];
  agenciesLoading?: boolean;
}

const fuelTypes = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'LPG'];
const gearboxTypes = ['Automatic', 'Manual', 'Semi-automatic'];

export function CarForm({
  initialData,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save',
  isSuperAdmin = false,
  agencies = [],
  agenciesLoading = false,
}: CarFormProps) {
  const cardBg = useColorModeValue('white', 'gray.800');

  // Create schema based on whether super admin needs to select agency
  const carSchema = isSuperAdmin && !initialData?.agencyId
    ? baseCarSchema.refine((data) => data.agencyId && data.agencyId > 0, {
        message: 'Please select an agency',
        path: ['agencyId'],
      })
    : baseCarSchema;

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
      agencyId: initialData?.agencyId,
    },
  });

  // Filter only active agencies
  const activeAgencies = agencies.filter((a) => a.status === 'activate');

  return (
    <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="sm">
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={6}>
          {/* Agency Selection for Super Admin */}
          {isSuperAdmin && (
            <FormControl isInvalid={!!errors.agencyId} isRequired={!initialData?.agencyId}>
              <FormLabel>Agency</FormLabel>
              {initialData?.agencyId ? (
                <>
                  <Input
                    value={initialData.Agency?.name || `Agency #${initialData.agencyId}`}
                    isReadOnly
                    bg="gray.50"
                  />
                  <Text fontSize="xs" color="gray.500" mt={1}>
                    Agency cannot be changed after creation
                  </Text>
                </>
              ) : (
                <>
                  <Select
                    placeholder="Select an agency"
                    {...register('agencyId')}
                    isDisabled={agenciesLoading}
                  >
                    {activeAgencies.map((agency) => (
                      <option key={agency.id} value={agency.id}>
                        {agency.name} - {agency.address}
                      </option>
                    ))}
                  </Select>
                  <FormErrorMessage>{errors.agencyId?.message}</FormErrorMessage>
                  {activeAgencies.length === 0 && !agenciesLoading && (
                    <Text fontSize="sm" color="orange.500" mt={1}>
                      No active agencies available. Create an agency first.
                    </Text>
                  )}
                </>
              )}
            </FormControl>
          )}

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
