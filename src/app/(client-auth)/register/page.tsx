'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import {
  Box,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  InputGroup,
  InputRightElement,
  IconButton,
  Stack,
  Text,
  Link,
  SimpleGrid,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuthStore } from '@/stores/auth.store';
import { ProgressButton } from '@/components/ui/ProgressButton';

const registerSchema = z
  .object({
    firstname: z.string().min(2, 'First name must be at least 2 characters'),
    name: z.string().min(2, 'Last name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
    telephone: z.string().min(8, 'Phone number is required'),
    numPermis: z.string().min(5, 'Driver license number is required'),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const inputStyles = {
  bg: 'white',
  border: '1px solid',
  borderColor: 'gray.200',
  borderRadius: 'lg',
  h: 10,
  _focus: {
    borderColor: 'brand.400',
    boxShadow: '0 0 0 1px var(--chakra-colors-brand-400)',
  },
  _placeholder: { color: 'gray.400' },
};

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, ...registerData } = data;
      await registerUser(registerData);
      toast({
        title: 'Account created!',
        description: 'Welcome to BTHG Rental Car',
        status: 'success',
        duration: 3000,
      });
      router.push('/');
    } catch (error) {
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'An error occurred',
        status: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Box
      maxW="520px"
      w="full"
      bg="white"
      borderRadius="2xl"
      p={8}
      boxShadow="2xl"
      overflow="hidden"
      position="relative"
    >
      {/* Top accent strip */}
      <Box
        h="4px"
        bg="brand.400"
        position="absolute"
        top={0}
        left={0}
        right={0}
      />

      <VStack spacing={6}>
        {/* Header */}
        <VStack spacing={1}>
          <Heading size="lg" color="navy.800">
            Create Account
          </Heading>
          <Text color="gray.500" fontSize="sm">
            Sign up to get started with BTHG Rental
          </Text>
        </VStack>

        {/* Form */}
        <Box as="form" onSubmit={handleSubmit(onSubmit)} w="full">
          <Stack spacing={4}>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.firstname}>
                <FormLabel fontWeight="medium" fontSize="sm" color="navy.800">
                  First Name
                </FormLabel>
                <Input placeholder="John" {...inputStyles} {...register('firstname')} />
                <FormErrorMessage>{errors.firstname?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.name}>
                <FormLabel fontWeight="medium" fontSize="sm" color="navy.800">
                  Last Name
                </FormLabel>
                <Input placeholder="Doe" {...inputStyles} {...register('name')} />
                <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <FormControl isInvalid={!!errors.email}>
              <FormLabel fontWeight="medium" fontSize="sm" color="navy.800">
                Email
              </FormLabel>
              <Input
                type="email"
                placeholder="john@example.com"
                {...inputStyles}
                {...register('email')}
              />
              <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
            </FormControl>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.password}>
                <FormLabel fontWeight="medium" fontSize="sm" color="navy.800">
                  Password
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    {...inputStyles}
                    {...register('password')}
                  />
                  <InputRightElement h="full">
                    <IconButton
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      icon={showPassword ? <FiEyeOff /> : <FiEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPassword(!showPassword)}
                      color="gray.400"
                      _hover={{ color: 'brand.400' }}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel fontWeight="medium" fontSize="sm" color="navy.800">
                  Confirm Password
                </FormLabel>
                <InputGroup>
                  <Input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    {...inputStyles}
                    {...register('confirmPassword')}
                  />
                  <InputRightElement h="full">
                    <IconButton
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      icon={showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      color="gray.400"
                      _hover={{ color: 'brand.400' }}
                    />
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <FormControl isInvalid={!!errors.telephone}>
                <FormLabel fontWeight="medium" fontSize="sm" color="navy.800">
                  Phone Number
                </FormLabel>
                <Input
                  placeholder="+1 234 567 8900"
                  {...inputStyles}
                  {...register('telephone')}
                />
                <FormErrorMessage>{errors.telephone?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.numPermis}>
                <FormLabel fontWeight="medium" fontSize="sm" color="navy.800">
                  Driver License
                </FormLabel>
                <Input
                  placeholder="License number"
                  {...inputStyles}
                  {...register('numPermis')}
                />
                <FormErrorMessage>{errors.numPermis?.message}</FormErrorMessage>
              </FormControl>
            </SimpleGrid>

            <FormControl isInvalid={!!errors.address}>
              <FormLabel fontWeight="medium" fontSize="sm" color="navy.800">
                Address
              </FormLabel>
              <Input
                placeholder="123 Main St"
                {...inputStyles}
                {...register('address')}
              />
              <FormErrorMessage>{errors.address?.message}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.city}>
              <FormLabel fontWeight="medium" fontSize="sm" color="navy.800">
                City
              </FormLabel>
              <Input placeholder="New York" {...inputStyles} {...register('city')} />
              <FormErrorMessage>{errors.city?.message}</FormErrorMessage>
            </FormControl>

            <ProgressButton
              type="submit"
              size="lg"
              w="full"
              bg="brand.400"
              color="white"
              borderRadius="lg"
              h={12}
              fontWeight="semibold"
              isLoading={isLoading}
              _hover={{ bg: 'brand.500' }}
              _active={{ bg: 'brand.600' }}
            >
              Create Account
            </ProgressButton>
          </Stack>
        </Box>

        {/* Footer */}
        <Text textAlign="center" fontSize="sm" color="gray.500">
          Already have an account?{' '}
          <Link as={NextLink} href="/login" color="brand.400" fontWeight="medium">
            Sign in
          </Link>
        </Text>
      </VStack>
    </Box>
  );
}
