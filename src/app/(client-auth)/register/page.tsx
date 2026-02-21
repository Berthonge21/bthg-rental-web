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
  HStack,
  Button,
  Progress,
  Icon,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiEye, FiEyeOff, FiArrowRight, FiArrowLeft, FiUser, FiLock, FiMapPin, FiCheck } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { ProgressButton } from '@/components/ui/ProgressButton';

const MotionBox = motion(Box);

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

const STEP_FIELDS: (keyof RegisterFormData)[][] = [
  ['firstname', 'name', 'email'],
  ['password', 'confirmPassword'],
  ['telephone', 'numPermis', 'address', 'city'],
];

const STEP_META = [
  { label: 'Account', icon: FiUser },
  { label: 'Security', icon: FiLock },
  { label: 'Profile', icon: FiMapPin },
];

const focusGlow = '0 0 0 3px rgba(201,162,39,0.25)';

const inputStyles = {
  bg: 'white',
  border: '1px solid',
  borderColor: 'gray.200',
  borderRadius: 'lg',
  h: 10,
  _focus: {
    borderColor: 'brand.400',
    boxShadow: focusGlow,
  },
  _placeholder: { color: 'gray.400' },
};

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const { register: registerUser, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const progressPercent = ((step + 1) / STEP_META.length) * 100;

  const handleNext = async () => {
    const fields = STEP_FIELDS[step];
    const isValid = await trigger(fields);
    if (!isValid) {
      setShakeKey((k) => k + 1);
      return;
    }
    setStep((s) => Math.min(s + 1, STEP_META.length - 1));
  };

  const handleBack = () => {
    setStep((s) => Math.max(s - 1, 0));
  };

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

        {/* Progress bar */}
        <Box w="full">
          <Progress
            value={progressPercent}
            size="xs"
            borderRadius="full"
            colorScheme="yellow"
            bg="gray.100"
          />
        </Box>

        {/* Step dots */}
        <HStack spacing={6} justify="center">
          {STEP_META.map((s, i) => {
            const isCompleted = i < step;
            const isCurrent = i === step;
            return (
              <VStack key={s.label} spacing={1}>
                <Box
                  w={10}
                  h={10}
                  borderRadius="full"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  bg={isCompleted ? 'brand.400' : isCurrent ? 'brand.400' : 'gray.100'}
                  color={isCompleted || isCurrent ? 'white' : 'gray.400'}
                  transition="all 0.3s"
                  fontWeight="bold"
                  fontSize="sm"
                >
                  {isCompleted ? <Icon as={FiCheck} boxSize={4} /> : <Icon as={s.icon} boxSize={4} />}
                </Box>
                <Text
                  fontSize="xs"
                  fontWeight={isCurrent ? 'semibold' : 'medium'}
                  color={isCurrent ? 'brand.400' : 'gray.400'}
                >
                  {s.label}
                </Text>
              </VStack>
            );
          })}
        </HStack>

        {/* Form */}
        <Box as="form" onSubmit={handleSubmit(onSubmit)} w="full">
          <AnimatePresence mode="wait">
            <MotionBox
              key={`step-${step}-${shakeKey}`}
              initial={{ x: 40, opacity: 0 }}
              animate={{
                x: 0,
                opacity: 1,
                ...(shakeKey > 0 && errors && Object.keys(errors).length > 0
                  ? {}
                  : {}),
              }}
              exit={{ x: -40, opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* Shake wrapper for validation errors */}
              <MotionBox
                key={`shake-${shakeKey}`}
                animate={
                  shakeKey > 0
                    ? { x: [-8, 8, -8, 8, 0] }
                    : {}
                }
                transition={{ duration: 0.4 }}
              >
                <Stack spacing={4}>
                  {/* Step 1: Account */}
                  {step === 0 && (
                    <>
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
                    </>
                  )}

                  {/* Step 2: Security */}
                  {step === 1 && (
                    <>
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
                    </>
                  )}

                  {/* Step 3: Profile */}
                  {step === 2 && (
                    <>
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
                    </>
                  )}
                </Stack>
              </MotionBox>
            </MotionBox>
          </AnimatePresence>

          {/* Navigation buttons */}
          <HStack spacing={4} mt={6} w="full">
            {step > 0 && (
              <Button
                variant="outline"
                borderRadius="lg"
                h={12}
                flex={1}
                leftIcon={<FiArrowLeft />}
                onClick={handleBack}
                borderColor="gray.200"
                color="gray.600"
                _hover={{ bg: 'gray.50' }}
              >
                Back
              </Button>
            )}
            {step < STEP_META.length - 1 ? (
              <Button
                flex={1}
                bg="brand.400"
                color="white"
                borderRadius="lg"
                h={12}
                fontWeight="semibold"
                rightIcon={<FiArrowRight />}
                _hover={{ bg: 'brand.500' }}
                _active={{ bg: 'brand.600' }}
                onClick={handleNext}
              >
                Next
              </Button>
            ) : (
              <ProgressButton
                type="submit"
                size="lg"
                w="full"
                flex={1}
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
            )}
          </HStack>
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
